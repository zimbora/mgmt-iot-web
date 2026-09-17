jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/sensors', () => ({
  add: jest.fn((...args) => args[args.length - 1](null, [{}]))
}));

const ctrl = require('../../server/controllers/sensors');
const response = require('../../server/controllers/response');
const Sensor = require('../../server/models/sensors');

describe('server/controllers/sensors readable support', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('passes readable to model add on device sensor creation', () => {
    const req = {
      params: { device_id: 17 },
      body: {
        ref: 'temperature',
        name: 'Temperature',
        type: 'number',
        property: '',
        readable: false
      }
    };
    const res = {};

    ctrl.add(req, res, jest.fn());

    expect(Sensor.add).toHaveBeenCalledWith(
      null,
      17,
      'temperature',
      'Temperature',
      'number',
      '',
      undefined,
      undefined,
      false,
      expect.any(Function)
    );
    expect(response.send).toHaveBeenCalledWith(res, [{}]);
  });
});
