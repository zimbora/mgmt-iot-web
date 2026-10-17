const mockDb = { getConnection: jest.fn(), queryRow: jest.fn(), update: jest.fn() };
jest.mock('../../server/controllers/db', () => mockDb);
jest.mock('../../server/models/devices', () => ({ triggerFota: jest.fn() }));
const Devices = require('../../server/models/devices');
const Campaigns = require('../../server/models/campaigns');

describe('FOTA campaign persistence and dispatch', () => {
  let conn;
  let release;
  const data = {
    name: 'Rollout', variant_id: 3, firmware_id: 'latest',
    build_release: 'prod', all_devices: false, device_ids: [10, 11]
  };

  beforeEach(() => {
    jest.resetAllMocks();
    conn = {
      beginTransaction: jest.fn(), commit: jest.fn(), rollback: jest.fn(),
      query: jest.fn()
        .mockResolvedValueOnce([[{ id: 2 }]])
        .mockResolvedValueOnce([[{ id: 3 }]])
        .mockResolvedValueOnce([[{ id: 7, version: '2.0.0', app_version: '3.0.0', build_release: 'prod' }]])
        .mockResolvedValueOnce([[{ id: 10, uid: 'one' }, { id: 11, uid: 'two' }]])
        .mockResolvedValueOnce([{ insertId: 20 }])
        .mockResolvedValueOnce([{ affectedRows: 2 }])
    };
    release = jest.fn();
    mockDb.getConnection.mockImplementation(cb => cb(null, { promise: () => conn, release }));
    mockDb.update.mockResolvedValue({ affectedRows: 1 });
  });

  it('pins latest firmware and persists the complete target snapshot in one transaction', async () => {
    await expect(Campaigns.create(2, data)).resolves.toEqual({ id: 20, firmware_id: 7, device_count: 2 });
    expect(conn.query).toHaveBeenNthCalledWith(3,
      expect.stringContaining('variant_id <=> ? AND build_release = ?'), [2, 3, 'prod']);
    expect(conn.query.mock.calls[2][0]).toContain("SUBSTRING_INDEX(app_version, '.', 1)");
    expect(conn.query.mock.calls[2][0]).toContain('LIMIT 1 FOR UPDATE');
    expect(conn.query).toHaveBeenNthCalledWith(4, expect.stringContaining('AND id IN (?)'), [2, 3, [10, 11]]);
    expect(conn.query).toHaveBeenNthCalledWith(5, expect.any(String), expect.objectContaining({
      model_id: 2, variant_id: 3, firmware_id: 7, status: 'dispatching'
    }));
    expect(conn.query.mock.calls[5][1][0]).toEqual([
      [20, 10, 'one', 'pending', expect.any(String), expect.any(String)],
      [20, 11, 'two', 'pending', expect.any(String), expect.any(String)]
    ]);
    expect(conn.commit).toHaveBeenCalledTimes(1);
    expect(conn.rollback).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('selects all and only devices in the model and variant, including no-variant devices', async () => {
    conn.query.mockReset()
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[{ id: 8, version: '1', app_version: '2', build_release: 'dev' }]])
      .mockResolvedValueOnce([[{ id: 12, uid: 'three' }]])
      .mockResolvedValueOnce([{ insertId: 21 }])
      .mockResolvedValueOnce([{}]);
    await Campaigns.create(2, { ...data, variant_id: null, firmware_id: 8, build_release: 'dev', all_devices: true, device_ids: [] });
    expect(conn.query).toHaveBeenNthCalledWith(2, expect.stringContaining('AND id = ?'), [2, null, 'dev', 8]);
    expect(conn.query).toHaveBeenNthCalledWith(3, expect.not.stringContaining('IN (?)'), [2, null]);
  });

  it.each([
    ['disabled model', 0, []],
    ['foreign variant', 1, []],
    ['foreign or missing firmware', 2, []],
    ['empty targets', 3, []],
    ['foreign device in selection', 3, [{ id: 10, uid: 'one' }]]
  ])('rolls back before dispatch for %s', async (name, queryIndex, rows) => {
    const original = conn.query;
    const results = [];
    for (let i = 0; i < queryIndex; i++) results.push(await original());
    conn.query = jest.fn();
    results.forEach(result => conn.query.mockResolvedValueOnce(result));
    conn.query.mockResolvedValueOnce([rows]);
    await expect(Campaigns.create(2, data)).rejects.toMatchObject({ status: 400 });
    expect(conn.rollback).toHaveBeenCalledTimes(1);
    expect(conn.commit).not.toHaveBeenCalled();
    expect(release).toHaveBeenCalledTimes(1);
    expect(Devices.triggerFota).not.toHaveBeenCalled();
  });

  it('rolls back an incomplete snapshot on database error', async () => {
    conn.query.mockReset()
      .mockResolvedValueOnce([[{ id: 2 }]])
      .mockResolvedValueOnce([[{ id: 3 }]])
      .mockRejectedValueOnce(new Error('database unavailable'));
    await expect(Campaigns.create(2, data)).rejects.toThrow('database unavailable');
    expect(conn.rollback).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('records sent, skipped and failed targets without aborting other devices', async () => {
    mockDb.queryRow.mockResolvedValue([{ device_id: 10 }, { device_id: 11 }, { device_id: 12 }]);
    Devices.triggerFota.mockImplementation((id, version, app, cb) => {
      if (id === 10) cb(null, 'updating fw to image.bin');
      if (id === 11) cb(null, 'no new version available');
      if (id === 12) cb('device is offline');
    });
    await Campaigns.dispatch({ id: 20, firmware_id: 7 });
    expect(Devices.triggerFota).toHaveBeenCalledTimes(3);
    expect(Devices.triggerFota).toHaveBeenCalledWith(10, null, null, expect.any(Function), 7);
    for (const [id, status] of [[10, 'sent'], [11, 'skipped'], [12, 'failed']]) {
      expect(mockDb.update).toHaveBeenCalledWith('fota_campaign_devices',
        expect.objectContaining({ status }), { campaign_id: 20, device_id: id });
    }
    expect(mockDb.update).toHaveBeenLastCalledWith('fota_campaigns',
      expect.objectContaining({ status: 'finished' }), { id: 20 });
  });

  it('marks the campaign failed when recording results fails', async () => {
    mockDb.queryRow.mockRejectedValue(new Error('database error'));
    await expect(Campaigns.dispatch({ id: 20, firmware_id: 7 })).rejects.toThrow('database error');
    expect(mockDb.update).toHaveBeenCalledWith('fota_campaigns',
      expect.objectContaining({ status: 'failed' }), { id: 20 });
  });

  it('scopes history and device results to the requested model', async () => {
    mockDb.queryRow.mockResolvedValue([]);
    await Campaigns.list(2);
    await Campaigns.targets(2, 20);
    expect(mockDb.queryRow.mock.calls[0][0]).toContain('WHERE model_id = 2');
    expect(mockDb.queryRow.mock.calls[1][0]).toContain('WHERE c.model_id = 2 AND c.id = 20');
  });
});
