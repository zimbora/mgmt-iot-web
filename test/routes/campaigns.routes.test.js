const express = require('express');
const request = require('supertest');
jest.mock('../../server/controllers/models', () => ({
  ...jest.requireActual('../../server/controllers/models'),
  checkAccess: (req, res, next) => next()
}));
jest.mock('../../server/models/campaigns', () => ({
  options: jest.fn(), list: jest.fn(), targets: jest.fn(), create: jest.fn(), dispatch: jest.fn()
}));
const Campaigns = require('../../server/models/campaigns');
const router = require('../../server/routes/models');

describe('model campaign API', () => {
  let app;
  let level;
  const body = { name: 'Test', variant_id: 3, firmware_id: 'latest', device_ids: [10, 11] };
  beforeEach(() => {
    jest.resetAllMocks();
    level = 4;
    app = express();
    app.use(express.json());
    app.use((req, res, next) => { req.user = { level }; next(); });
    app.use('/api/model', router);
    Campaigns.create.mockResolvedValue({ id: 20, firmware_id: 7, device_count: 2 });
    Campaigns.dispatch.mockResolvedValue();
    Campaigns.options.mockResolvedValue({ variants: [], devices: [], firmwares: [] });
    Campaigns.list.mockResolvedValue([]);
    Campaigns.targets.mockResolvedValue([]);
  });

  it('accepts multiple devices, applies defaults, and starts dispatch after persistence', async () => {
    const res = await request(app).post('/api/model/2/campaigns').send(body);
    expect(res.status).toBe(202);
    expect(Campaigns.create).toHaveBeenCalledWith('2', { ...body, build_release: 'prod', all_devices: false });
    await new Promise(resolve => setImmediate(resolve));
    expect(Campaigns.dispatch).toHaveBeenCalledWith({ id: 20, firmware_id: 7, device_count: 2 });
  });

  it('accepts all devices and an explicit firmware with no variant', async () => {
    const res = await request(app).post('/api/model/2/campaigns')
      .send({ name: 'All', firmware_id: 7, all_devices: true });
    expect(res.status).toBe(202);
    expect(Campaigns.create).toHaveBeenCalledWith('2', expect.objectContaining({
      firmware_id: 7, variant_id: null, all_devices: true, device_ids: []
    }));
  });

  it.each([
    { device_ids: [] }, { device_ids: [10, 10] }, { device_ids: [-1] },
    { all_devices: true }, { firmware_id: 'bad' }, { build_release: 'bad' },
    { variant_id: -1 }, { name: ' ' }
  ])('rejects invalid campaign selection %j', async override => {
    const res = await request(app).post('/api/model/2/campaigns').send({ ...body, ...override });
    expect(res.status).toBe(400);
    expect(Campaigns.create).not.toHaveBeenCalled();
  });

  it.each(['', '/options', '/20/devices'])('restricts campaign reads to administrators: %s', async suffix => {
    level = 3;
    expect((await request(app).get('/api/model/2/campaigns' + suffix)).status).toBe(403);
    expect(Campaigns.list).not.toHaveBeenCalled();
    expect(Campaigns.options).not.toHaveBeenCalled();
    expect(Campaigns.targets).not.toHaveBeenCalled();
  });

  it('restricts campaign creation to administrators', async () => {
    level = 3;
    expect((await request(app).post('/api/model/2/campaigns').send(body)).status).toBe(403);
    expect(Campaigns.create).not.toHaveBeenCalled();
  });

  it('serves selection options, history and model-scoped results', async () => {
    for (const suffix of ['', '/options', '/20/devices']) {
      expect((await request(app).get('/api/model/2/campaigns' + suffix)).status).toBe(200);
    }
    expect(Campaigns.targets).toHaveBeenCalledWith('2', '20');
    expect(Campaigns.options).toHaveBeenCalledWith('2');
    expect(Campaigns.list).toHaveBeenCalledWith('2');
  });

  it('returns validation errors without starting dispatch', async () => {
    Campaigns.create.mockRejectedValue(Object.assign(new Error('Firmware mismatch'), { status: 400 }));
    const res = await request(app).post('/api/model/2/campaigns').send(body);
    expect(res.status).toBe(400);
    expect(res.body.Message).toBe('Firmware mismatch');
    expect(Campaigns.dispatch).not.toHaveBeenCalled();
  });

  it('does not disclose database errors', async () => {
    Campaigns.list.mockRejectedValue(new Error('sensitive database details'));
    const res = await request(app).get('/api/model/2/campaigns');
    expect(res.status).toBe(500);
    expect(res.body.Message).not.toContain('sensitive');
  });

  it('rejects malformed path IDs', async () => {
    expect((await request(app).get('/api/model/bad/campaigns')).status).toBe(400);
    expect((await request(app).get('/api/model/2/campaigns/bad/devices')).status).toBe(400);
  });
});
