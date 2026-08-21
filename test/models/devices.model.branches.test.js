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
    mockDb.queryRow.mockResolvedValueOnce([{
      id: 1,
      model_id: 9,
      ref: 'r',
      name: 'temperature',
      type: 'float',
      property: null,
      active: true,
      createdAt: 'x',
      updatedAt: 'x'
    }]);

    const out = await devices.associateSensorsTemplateToDevice(1, 9);

    expect(Array.isArray(out)).toBe(true);
    expect(mockDb.insert).toHaveBeenCalledWith('sensors', expect.objectContaining({
      model_id: 9,
      device_id: 1,
      ref: 'r',
      name: 'temperature',
      type: 'float',
      property: '',
      active: true,
    }));
    expect(mockDb.insert.mock.calls[0][1]).toHaveProperty('active');
  });

  it('add() generates a 9-character psk and returns id, uid, psk', async () => {
    const devices = require('../../server/models/devices');

    jest.spyOn(require('../../server/models/projects'), 'getId').mockResolvedValue(1);
    jest.spyOn(require('../../server/models/models'), 'getId').mockResolvedValue(2);
    jest.spyOn(devices, 'addClientPermission').mockImplementation((deviceId, clientId, level, cb) => cb(null, {}));
    jest.spyOn(devices, 'associateSensorsTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateLwm2mTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateMqttTemplateToDevice').mockResolvedValue([]);

    mockDb.insert.mockResolvedValueOnce({ insertId: 42, affectedRows: 1 });

    const deviceData = {
      projectName: 'testProject',
      modelName: 'testModel',
      uid: 'device-uid-001',
      protocol: 'MQTT',
      clientId: 10
    };

    await new Promise((resolve) => {
      devices.add(deviceData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toHaveProperty('id', 42);
        expect(result).toHaveProperty('uid', 'device-uid-001');
        expect(result).toHaveProperty('psk');
        expect(typeof result.psk).toBe('string');
        expect(result.psk).toHaveLength(9);
        resolve();
      });
    });
  });

  it('add() stores the generated psk in the database', async () => {
    const devices = require('../../server/models/devices');

    jest.spyOn(require('../../server/models/projects'), 'getId').mockResolvedValue(1);
    jest.spyOn(require('../../server/models/models'), 'getId').mockResolvedValue(2);
    jest.spyOn(devices, 'addClientPermission').mockImplementation((deviceId, clientId, level, cb) => cb(null, {}));
    jest.spyOn(devices, 'associateSensorsTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateLwm2mTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateMqttTemplateToDevice').mockResolvedValue([]);

    mockDb.insert.mockResolvedValueOnce({ insertId: 5, affectedRows: 1 });

    const deviceData = {
      projectName: 'testProject',
      modelName: 'testModel',
      uid: 'device-uid-002',
      protocol: 'MQTT'
    };

    await new Promise((resolve) => {
      devices.add(deviceData, (err, result) => {
        expect(err).toBeNull();
        const insertedObj = mockDb.insert.mock.calls[0][1];
        expect(insertedObj).toHaveProperty('psk');
        expect(insertedObj.psk).toHaveLength(9);
        expect(insertedObj.psk).toBe(result.psk);
        resolve();
      });
    });
  });

  it('add() uses the provided psk when given and returns it', async () => {
    const devices = require('../../server/models/devices');

    jest.spyOn(require('../../server/models/projects'), 'getId').mockResolvedValue(1);
    jest.spyOn(require('../../server/models/models'), 'getId').mockResolvedValue(2);
    jest.spyOn(devices, 'addClientPermission').mockImplementation((deviceId, clientId, level, cb) => cb(null, {}));
    jest.spyOn(devices, 'associateSensorsTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateLwm2mTemplateToDevice').mockResolvedValue([]);
    jest.spyOn(devices, 'associateMqttTemplateToDevice').mockResolvedValue([]);

    mockDb.insert.mockResolvedValueOnce({ insertId: 7, affectedRows: 1 });

    const deviceData = {
      projectName: 'testProject',
      modelName: 'testModel',
      uid: 'device-uid-003',
      protocol: 'MQTT',
      psk: 'myCustomPSK'
    };

    await new Promise((resolve) => {
      devices.add(deviceData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toHaveProperty('psk', 'myCustomPSK');
        const insertedObj = mockDb.insert.mock.calls[0][1];
        expect(insertedObj.psk).toBe('myCustomPSK');
        resolve();
      });
    });
  });

  it('triggerFota() rejects when device is offline', async () => {
    const devices = require('../../server/models/devices');

    mockDb.queryRow
      .mockResolvedValueOnce([{
        id: 1,
        model_id: 2,
        accept_release: 'prod',
        variant_id: 3,
        version: '1.0.0',
        app_version: '1.0.0',
        nAttempts: 0
      }])
      .mockResolvedValueOnce([{ value: 'offline' }]);

    await new Promise((resolve) => {
      devices.triggerFota(1, null, null, (err, res) => {
        expect(err).toBe('device is offline');
        expect(res).toBeNull();
        resolve();
      });
    });
  });

  it('triggerFota() rejects when max attempts is reached', async () => {
    const devices = require('../../server/models/devices');

    mockDb.queryRow
      .mockResolvedValueOnce([{
        id: 1,
        model_id: 2,
        accept_release: 'prod',
        variant_id: 3,
        version: '1.0.0',
        app_version: '1.0.0',
        nAttempts: 3
      }])
      .mockResolvedValueOnce([{ value: 'online' }])
      .mockResolvedValueOnce([{ nAttempts: 3 }]);

    await new Promise((resolve) => {
      devices.triggerFota(1, null, null, (err, res) => {
        expect(err).toContain('max fota attempts reached');
        expect(res).toBeNull();
        resolve();
      });
    });
  });

  it('triggerFota() logs model_id when update is triggered', async () => {
    const devices = require('../../server/models/devices');
    const firmwares = require('../../server/models/firmwares');

    jest.spyOn(firmwares, 'getLatestVersion').mockResolvedValue({
      version: '1.0.1',
      filename: 'fw.bin',
      token: 'abc'
    });
    jest.spyOn(firmwares, 'getLatestAppVersion').mockResolvedValue({
      version: '1.0.1',
      app_version: '1.0.1',
      filename: 'app.bin',
      token: 'def'
    });
    jest.spyOn(devices, 'getModel').mockResolvedValue('normal');
    jest.spyOn(devices, 'sendMqttMessage').mockImplementation(async (deviceId, topic, payload, qos, retain, cb) => {
      cb(null, 'ok');
      return Promise.resolve();
    });

    mockDb.queryRow
      .mockResolvedValueOnce([{
        id: 1,
        model_id: 2,
        accept_release: 'prod',
        variant_id: 3,
        version: '1.0.0',
        app_version: '1.0.0',
        nAttempts: 1
      }])
      .mockResolvedValueOnce([{ value: 'online' }])
      .mockResolvedValueOnce([{ nAttempts: 1 }]);

    await new Promise((resolve) => {
      devices.triggerFota(1, null, null, (err, res) => {
        expect(err).toBeNull();
        expect(res).toContain('updating fw to');
        resolve();
      });
    });

    expect(mockDb.insert).toHaveBeenCalledWith('logs_fota', expect.objectContaining({
      device_id: 1,
      model_id: 2
    }));
  });

  it('getFotaLogs() returns empty list when no rows exist', async () => {
    const devices = require('../../server/models/devices');
    mockDb.queryRow.mockResolvedValueOnce([]);

    await new Promise((resolve) => {
      devices.getFotaLogs(1, (err, rows) => {
        expect(err).toBeNull();
        expect(rows).toEqual([]);
        resolve();
      });
    });
  });

  it('resetFotaAttempts() updates fota.nAttempts to zero', async () => {
    const devices = require('../../server/models/devices');
    mockDb.update.mockResolvedValueOnce({ affectedRows: 1 });

    await new Promise((resolve) => {
      devices.resetFotaAttempts(1, (err, rows) => {
        expect(err).toBeNull();
        expect(rows).toEqual({ affectedRows: 1 });
        resolve();
      });
    });

    expect(mockDb.update).toHaveBeenCalledWith(
      'fota',
      expect.objectContaining({ nAttempts: 0 }),
      { device_id: 1 }
    );
  });
});
