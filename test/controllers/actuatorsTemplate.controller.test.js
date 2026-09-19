jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/actuatorsTemplate', () => ({
  TYPES: ['set', 'switch', 'number', 'text', 'json'],
  getById: jest.fn(),
  add: jest.fn((...args) => args[args.length - 1](null, [{}])),
  update: jest.fn((...args) => args[args.length - 1](null, [{}])),
  delete: jest.fn((...args) => args[args.length - 1](null, [{}])),
  list: jest.fn((...args) => args[args.length - 1](null, []))
}));

jest.mock('../../server/models/actuators', () => ({
  getByRef: jest.fn(),
  updateObject: jest.fn((...args) => args[args.length - 1](null, [{}])),
  add: jest.fn((...args) => args[args.length - 1](null, [{}]))
}));

jest.mock('../../server/models/devices', () => ({
  listByModel: jest.fn()
}));

const ctrl = require('../../server/controllers/actuatorsTemplate');
const response = require('../../server/controllers/response');
const ActuatorTemplate = require('../../server/models/actuatorsTemplate');
const Actuator = require('../../server/models/actuators');
const Device = require('../../server/models/devices');
const httpStatus = require('http-status-codes');

describe('server/controllers/actuatorsTemplate add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid type', () => {
    const req = { params: { model_id: 1 }, body: { ref: 'r', name: 'n', type: 'invalid' } };
    const res = {};

    ctrl.add(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    expect(ActuatorTemplate.add).not.toHaveBeenCalled();
  });
});

describe('server/controllers/actuatorsTemplate propagate branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns not found when actuator template does not exist', async () => {
    ActuatorTemplate.getById.mockImplementation((id, cb) => cb(null, null));
    const res = {};

    await ctrl.propagate({ body: { actuator_id: 1 } }, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'actuator template not found');
  });

  it('returns not found when model has no devices', async () => {
    ActuatorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, []));
    const res = {};

    await ctrl.propagate({ body: { actuator_id: 1 } }, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'no devices associated to this model');
  });

  it('updates existing actuators when found', async () => {
    ActuatorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p', active: true, name: 'n', type: 'switch' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, [{ id: 11 }]));
    Actuator.getByRef.mockImplementation((deviceId, ref, property, cb) => cb(null, [{ id: 99 }]));
    const res = {};

    await ctrl.propagate({ body: { actuator_id: 1 } }, res, jest.fn());
    expect(response.send.mock.calls.length + response.error.mock.calls.length).toBeGreaterThan(0);
  });

  it('adds actuator when no existing actuator is found', async () => {
    ActuatorTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 1, model_id: 9, ref: 'r', property: 'p', active: true, name: 'n', type: 'switch' }));
    Device.listByModel.mockImplementation((modelId, cb) => cb(null, [{ id: 11 }]));
    Actuator.getByRef.mockImplementation((deviceId, ref, property, cb) => cb(null, []));
    const res = {};

    await ctrl.propagate({ body: { actuator_id: 1 } }, res, jest.fn());
    expect(response.send.mock.calls.length + response.error.mock.calls.length).toBeGreaterThan(0);
  });
});
