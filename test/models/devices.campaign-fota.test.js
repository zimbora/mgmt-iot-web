const mockDb = { queryRow: jest.fn(), insert: jest.fn() };
jest.mock('../../server/controllers/db', () => mockDb);
jest.mock('../../server/models/firmwares', () => ({
  getLatestVersion: jest.fn(), getLatestAppVersion: jest.fn()
}));
const Devices = require('../../server/models/devices');
const Firmwares = require('../../server/models/firmwares');

describe('pinned campaign FOTA delivery', () => {
  const device = { id: 10, model_id: 2, variant_id: 3, version: '1.0.0', app_version: '1.0.0', accept_release: 'prod' };
  const firmware = { id: 7, version: '2.0.0', app_version: '3.0.0', filename: 'image.bin', token: 'download-token' };
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(Devices, 'getById').mockResolvedValue(device);
    jest.spyOn(Devices, 'getModel').mockResolvedValue('model');
    jest.spyOn(Devices, 'sendMqttMessage').mockImplementation(async (id, topic, payload, qos, retain, cb) => cb(null, 'ok'));
    mockDb.queryRow.mockReset().mockResolvedValueOnce([{ value: 'online' }])
      .mockResolvedValueOnce([{ nAttempts: 0 }]).mockResolvedValueOnce([firmware]);
    mockDb.insert.mockResolvedValue({});
    global.$ = { config: { web: { protocol: 'https://', domain: 'example.test', fw_path: '/firmwares/' } } };
  });
  afterAll(() => { jest.restoreAllMocks(); delete global.$; });

  function trigger(firmwareId = 7) {
    return new Promise((resolve, reject) => {
      Devices.triggerFota(10, null, null, (err, result) => err ? reject(err) : resolve(result), firmwareId);
    });
  }

  it('dispatches the selected firmware and logs its exact versions', async () => {
    await expect(trigger()).resolves.toBe('updating fw to image.bin');
    expect(Firmwares.getLatestVersion).not.toHaveBeenCalled();
    expect(Firmwares.getLatestAppVersion).not.toHaveBeenCalled();
    expect(mockDb.queryRow.mock.calls[2][0]).toContain('id = 7 AND model_id = 2 AND variant_id <=> 3');
    expect(Devices.sendMqttMessage).toHaveBeenCalledWith(10, 'fw/fota/update/set',
      JSON.stringify({ url: 'https://example.test/firmwares/image.bin/download?token=download-token' }), 1, false, expect.any(Function));
    expect(mockDb.insert).toHaveBeenCalledWith('logs_fota', expect.objectContaining({
      target_version: '2.0.0', target_app_version: '3.0.0', target_file: 'image.bin'
    }));
  });

  it('supports explicit older versions rather than silently choosing latest', async () => {
    Devices.getById.mockResolvedValue({ ...device, version: '9.0.0', app_version: '9.0.0' });
    await expect(trigger()).resolves.toBe('updating fw to image.bin');
  });

  it('skips devices already running both selected versions', async () => {
    Devices.getById.mockResolvedValue({ ...device, version: firmware.version, app_version: firmware.app_version });
    await expect(trigger()).resolves.toBe('no new version available');
    expect(Devices.sendMqttMessage).not.toHaveBeenCalled();
  });

  it('rejects deleted devices', async () => {
    Devices.getById.mockResolvedValue(null);
    await expect(trigger()).rejects.toBe('device not found');
  });

  it('rejects deleted or incompatible firmware', async () => {
    mockDb.queryRow.mockReset().mockResolvedValueOnce([]).mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    await expect(trigger()).rejects.toBe('firmware does not match device model and variant');
    expect(Devices.sendMqttMessage).not.toHaveBeenCalled();
  });

  it.each([['offline', 0, 'device is offline'], ['online', 3, 'max fota attempts']])(
    'preserves %s / attempt count %s checks', async (status, attempts, error) => {
      mockDb.queryRow.mockReset().mockResolvedValueOnce([{ value: status }]).mockResolvedValueOnce([{ nAttempts: attempts }]);
      await expect(trigger()).rejects.toContain(error);
      expect(Devices.sendMqttMessage).not.toHaveBeenCalled();
    });

  it('reports MQTT callback errors rather than claiming successful dispatch', async () => {
    Devices.sendMqttMessage.mockImplementation(async (id, topic, payload, qos, retain, cb) => cb('publish failed'));
    await expect(trigger()).rejects.toBe('publish failed');
  });

  it('reports rejected MQTT operations', async () => {
    Devices.sendMqttMessage.mockRejectedValue(new Error('MQTT disconnected'));
    await expect(trigger()).rejects.toThrow('MQTT disconnected');
  });

  it('reports logging failures without sending an unrecorded update', async () => {
    mockDb.insert.mockRejectedValue(new Error('logging unavailable'));
    await expect(trigger()).rejects.toThrow('logging unavailable');
    expect(Devices.sendMqttMessage).not.toHaveBeenCalled();
  });

  it('keeps default single-device latest-version selection unchanged', async () => {
    Firmwares.getLatestVersion.mockResolvedValue({ ...firmware, version: '5.0.0' });
    Firmwares.getLatestAppVersion.mockResolvedValue({ ...firmware, app_version: '6.0.0' });
    await expect(trigger(null)).resolves.toBe('updating fw to image.bin');
    expect(Firmwares.getLatestVersion).toHaveBeenCalledWith(2, 'prod', 3);
    expect(Firmwares.getLatestAppVersion).toHaveBeenCalledWith(2, 'prod', 3);
  });
});
