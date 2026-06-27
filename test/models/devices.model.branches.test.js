jest.mock('mysql2', () => ({
  format: jest.fn((q) => q)
}));

const mockDb = {
  queryRow: jest.fn(),
  insert: jest.fn(async () => ({ insertId: 1, affectedRows: 1 })),
  update: jest.fn(async () => ({ affectedRows: 1 })),
  delete: jest.fn(async () => ({ affectedRows: 1 }))
};

jest.mock('../../server/controllers/db', () => mockDb);

describe('server/models/devices deep branches', () => {
  let setTimeoutSpy;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') setImmediate(fn);
      return 0;
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    setTimeoutSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    global.$ = {
      mqttClient: {
        publish: jest.fn(),
        subscribe: jest.fn((topic, opts, cb) => cb(null)),
        unsubscribe: jest.fn(),
        on: jest.fn(),
        off: jest.fn()
      }
    };
  });

  it('sendMqttMessage() publishes and resolves response', async () => {
    const devices = require('../../server/models/devices');

    jest.spyOn(devices, 'getProject').mockResolvedValue('project');
    jest.spyOn(devices, 'getUID').mockResolvedValue('uid');
    jest.spyOn(devices, 'getModel').mockResolvedValue('normal');

    let subscribedTopic = null;
    global.$.mqttClient.subscribe.mockImplementation((topic, opts, cb) => {
      subscribedTopic = topic;
      cb(null);
    });

    global.$.mqttClient.on.mockImplementation((event, handler) => {
      if (event === 'message') {
        setImmediate(() => handler(subscribedTopic, Buffer.from('ok')));
      }
    });

    await new Promise((resolve) => {
      devices.sendMqttMessage(1, 'state/get', '{}', 0, false, (err, res) => {
        expect(err).toBeNull();
        expect(res).toBe('ok');
        resolve();
      });
    });
  });

  it('sendMqttMessageChunked() merges chunked response payload', async () => {
    const devices = require('../../server/models/devices');

    jest.spyOn(devices, 'getProject').mockResolvedValue('project');
    jest.spyOn(devices, 'getUID').mockResolvedValue('uid');
    jest.spyOn(devices, 'getModel').mockResolvedValue('normal');

    let subscribedTopic = null;
    global.$.mqttClient.subscribe.mockImplementation((topic, opts, cb) => {
      subscribedTopic = topic;
      cb(null);
    });

    global.$.mqttClient.on.mockImplementation((event, handler) => {
      if (event === 'message') {
        setImmediate(() => {
          handler(subscribedTopic, Buffer.from(JSON.stringify({ c: 0, t: 2, d: [1, 2] })));
          handler(subscribedTopic, Buffer.from(JSON.stringify({ c: 1, t: 2, d: [3, 4] })));
        });
      }
    });

    await new Promise((resolve) => {
      devices.sendMqttMessageChunked(1, 'state/get', '{}', 0, false, (err, res) => {
        expect(err).toBeNull();
        expect(res).toEqual([1, 2, 3, 4]);
        resolve();
      }, 1000);
    });
  });

  it('associateLwm2mTemplateToDevice() empty templates path currently throws', async () => {
    const devices = require('../../server/models/devices');
    mockDb.queryRow.mockResolvedValueOnce([]);

    await expect(devices.associateLwm2mTemplateToDevice(1, 10)).rejects.toThrow();
  });

  it('associateSensorsTemplateToDevice() copies templates into sensors', async () => {
    const devices = require('../../server/models/devices');
    mockDb.queryRow.mockResolvedValueOnce([{ id: 1, model_id: 9, ref: 'r', createdAt: 'x', updatedAt: 'x' }]);

    const out = await devices.associateSensorsTemplateToDevice(1, 9);

    expect(Array.isArray(out)).toBe(true);
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
