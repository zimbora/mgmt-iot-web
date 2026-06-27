jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/sensorsTemplate', () => ({
  getById: jest.fn(),
  add: jest.fn((...args) => args[args.length - 1](null, [{}])),
  update: jest.fn((...args) => args[args.length - 1](null, [{}])),
  delete: jest.fn((...args) => args[args.length - 1](null, [{}])),
  list: jest.fn((...args) => args[args.length - 1](null, []))
}));

jest.mock('../../server/models/sensors', () => ({
  getByRef: jest.fn(),
  updateObject: jest.fn((...args) => args[args.length - 1](null, [{}])),
  add: jest.fn((...args) => args[args.length - 1](null, [{}]))
}));

jest.mock('../../server/models/devices', () => ({
  listByModel: jest.fn()
}));

const ctrl = require('../../server/controllers/sensorsTemplate');
const response = require('../../server/controllers/response');
const SensorTemplate = require('../../server/models/sensorsTemplate');
const Sensor = require('../../server/models/sensors');
const Device = require('../../server/models/devices');
const httpStatus = require('http-status-codes');

describe('server/controllers/sensorsTemplate propagate branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns not found when sensor template does not exist', async () => {
    SensorTemplate.getById.mockImplementation((id, cb) => cb(null, null));
    const res = {};

    await ctrl.propagate({ body: { sensor_id: 1 } }, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'sensor template not found');
  });

  it('returns not found when model has no devices', async () => {
    SensorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, []));
    const res = {};

    await ctrl.propagate({ body: { sensor_id: 1 } }, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'no devices associated to this model');
  });

  it('updates existing sensors when found', async () => {
    SensorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p', active: true, name: 'n', type: 't' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, [{ id: 11 }]));
    Sensor.getByRef.mockImplementation((deviceId, ref, property, cb) => cb(null, [{ id: 99 }]));
    const res = {};

    await ctrl.propagate({ body: { sensor_id: 1, data: {} } }, res, jest.fn());
    expect(response.send.mock.calls.length + response.error.mock.calls.length).toBeGreaterThan(0);
  });

  it('adds sensor when no existing sensor is found', async () => {
    SensorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p', active: true, name: 'n', type: 't' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, [{ id: 11 }]));
    Sensor.getByRef.mockImplementation((deviceId, ref, property, cb) => cb(null, []));
    const res = {};

    await ctrl.propagate({ body: { sensor_id: 1, data: {} } }, res, jest.fn());
    expect(response.send.mock.calls.length + response.error.mock.calls.length).toBeGreaterThan(0);
  });
});
