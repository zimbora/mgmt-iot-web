jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/actuators', () => ({
  TYPES: ['set', 'switch', 'number', 'text', 'json'],
  validateValue: jest.fn(),
  getById: jest.fn(),
  add: jest.fn((...args) => args[args.length - 1](null, [{}])),
  update: jest.fn((...args) => args[args.length - 1](null, [{}])),
  delete: jest.fn((...args) => args[args.length - 1](null, [{}])),
  list: jest.fn((...args) => args[args.length - 1](null, [])),
  addLog: jest.fn()
}));

const ctrl = require('../../server/controllers/actuators');
const response = require('../../server/controllers/response');
const Actuator = require('../../server/models/actuators');
const httpStatus = require('http-status-codes');

describe('server/controllers/actuators add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects invalid type', () => {
    const req = { params: { device_id: 1 }, body: { ref: 'r', name: 'n', type: 'invalid' } };
    const res = {};

    ctrl.add(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    expect(Actuator.add).not.toHaveBeenCalled();
  });

  it('adds actuator with a valid type', () => {
    const req = { params: { device_id: 1 }, body: { ref: 'r', name: 'n', type: 'switch' } };
    const res = {};

    ctrl.add(req, res, jest.fn());

    expect(Actuator.add).toHaveBeenCalledWith(null, 1, 'r', 'n', 'switch', undefined, expect.any(Function));
    expect(response.send).toHaveBeenCalled();
  });
});

describe('server/controllers/actuators update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates non value properties directly', () => {
    const req = { body: { actuator_id: 1, property: 'name', value: 'new name' } };
    const res = {};

    ctrl.update(req, res, jest.fn());

    expect(Actuator.update).toHaveBeenCalledWith(1, 'name', 'new name', expect.any(Function));
    expect(response.send).toHaveBeenCalled();
  });

  it('returns not found when actuator does not exist for value write', () => {
    Actuator.getById.mockImplementation((id, cb) => cb(null, null));
    const req = { body: { actuator_id: 1, property: 'value', value: 1 } };
    const res = {};

    ctrl.update(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'actuator not found');
  });

  it('rejects invalid value for the actuator type', () => {
    Actuator.getById.mockImplementation((id, cb) => cb(null, { id: 1, type: 'switch' }));
    Actuator.validateValue.mockReturnValue('switch value must be 0 or 1');
    const req = { body: { actuator_id: 1, property: 'value', value: 5 } };
    const res = {};

    ctrl.update(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'switch value must be 0 or 1');
    expect(Actuator.update).not.toHaveBeenCalled();
  });

  it('writes a valid value', () => {
    Actuator.getById.mockImplementation((id, cb) => cb(null, { id: 1, device_id: 11, type: 'switch' }));
    Actuator.validateValue.mockReturnValue(null);
    const req = { body: { actuator_id: 1, property: 'value', value: 1 } };
    const res = {};

    ctrl.update(req, res, jest.fn());

    expect(Actuator.update).toHaveBeenCalledWith(1, 'value', 1, expect.any(Function));
    expect(Actuator.addLog).toHaveBeenCalledWith(11, 1, 1);
    expect(response.send).toHaveBeenCalled();
  });

  it('does not log when the value write fails', () => {
    Actuator.getById.mockImplementation((id, cb) => cb(null, { id: 1, device_id: 11, type: 'switch' }));
    Actuator.validateValue.mockReturnValue(null);
    Actuator.update.mockImplementationOnce((...args) => args[args.length - 1]('db error', null));
    const req = { body: { actuator_id: 1, property: 'value', value: 1 } };
    const res = {};

    ctrl.update(req, res, jest.fn());

    expect(Actuator.addLog).not.toHaveBeenCalled();
    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'db error');
  });
});

describe('server/controllers/actuators delete/list', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes an actuator', () => {
    const req = { body: { actuator_id: 1 } };
    const res = {};

    ctrl.delete(req, res, jest.fn());

    expect(Actuator.delete).toHaveBeenCalledWith(1, expect.any(Function));
    expect(response.send).toHaveBeenCalled();
  });

  it('lists actuators for a device', () => {
    const req = { params: { device_id: 1 } };
    const res = {};

    ctrl.list(req, res, jest.fn());

    expect(Actuator.list).toHaveBeenCalledWith(1, expect.any(Function));
    expect(response.send).toHaveBeenCalled();
  });
});
