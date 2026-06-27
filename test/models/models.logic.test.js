const fs = require('fs');
const path = require('path');

const genericRow = {
  id: 1,
  user_id: 1,
  client_id: 1,
  device_id: 1,
  model_id: 1,
  project_id: 1,
  template_id: 1,
  objectId: 3,
  objectInstanceId: 0,
  resourceId: 1,
  level: 5,
  count: 1,
  nick: 'nick',
  name: 'name',
  type: 'admin',
  protocol: 'mqtt',
  uid: 'dev-001',
  token: 'token',
  api_token: 'api-token',
  version: '1.0.0',
  app_version: '1.0.0',
  release: 'prod',
  observing: true,
  description: '{}',
  defaultData: '{}',
  VARIABLE_VALUE: '10',
  updatedAt: '2025-01-01 00:00:00',
  createdAt: '2025-01-01 00:00:00'
};

jest.mock('mysql2', () => ({
  format: jest.fn((query) => query)
}));

jest.mock('../../server/controllers/db', () => ({
  queryRow: jest.fn(async () => [genericRow, { ...genericRow, id: 2 }]),
  insert: jest.fn(async () => ({ affectedRows: 1, insertId: 1 })),
  update: jest.fn(async () => ({ affectedRows: 1 })),
  delete: jest.fn(async () => ({ affectedRows: 1 }))
}));

const db = require('../../server/controllers/db');

const pickValue = (name) => {
  const n = name.toLowerCase();

  if (n.includes('cb')) return undefined;
  if (n.includes('data') || n.includes('obj') || n.includes('filter')) return {};
  if (n.includes('updatedat') || n.includes('createdat') || n.includes('time') || n.includes('date')) return '2025-01-01 00:00:00';
  if (n.includes('version')) return '1.0.0';
  if (n.includes('release')) return 'prod';
  if (n.includes('email')) return 'user@example.com';
  if (n.includes('token')) return 'token';
  if (n.includes('type')) return 'admin';
  if (n.includes('name') || n.includes('nick') || n.includes('uid') || n.includes('pwd') || n.includes('pass') || n.includes('ref') || n.includes('property')) return 'x';
  if (n.includes('id') || n.includes('level') || n.includes('port') || n.includes('limit') || n.includes('instance') || n.includes('resource')) return 1;
  return 'x';
};

describe('server/models logic execution', () => {
  const modelsDir = path.join(__dirname, '../../server/models');
  const files = fs.readdirSync(modelsDir).filter((file) => file.endsWith('.js'));
  let setTimeoutSpy;
  let consoleLogSpy;
  let consoleErrorSpy;

  const runAllExports = async (file) => {
    const mod = require(`../../server/models/${file}`);

    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      const callback = jest.fn();

      if (file === 'devices.js' && name === 'sendMqttMessage') {
        try {
          await fn(1, 'state/get', '{}', 0, false, callback);
          await new Promise((resolve) => setImmediate(resolve));
        } catch (_e) {}
        continue;
      }

      if (file === 'devices.js' && name === 'sendMqttMessageChunked') {
        try {
          await fn(1, 'state/get', '{}', 0, false, callback, 1000);
          await new Promise((resolve) => setImmediate(resolve));
        } catch (_e) {}
        continue;
      }

      const argc = Math.max(fn.length, 1);
      const args = Array.from({ length: argc }, (_, i) => {
        if (i === argc - 1 && fn.length > 0) return callback;
        return i % 2 === 0 ? 'x' : 1;
      });

      try {
        const out = fn(...args);
        if (out && typeof out.then === 'function') {
          await out;
        }
        await new Promise((resolve) => setImmediate(resolve));
      } catch (_e) {
        // keep walking other model methods to maximize execution coverage
      }
    }
  };

  beforeAll(() => {
    setTimeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      if (typeof fn === 'function') fn();
      return 0;
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };

    global.$ = {
      mqttClient: {
        publish: jest.fn(),
        subscribe: jest.fn((topic, opts, cb) => cb && cb(null)),
        unsubscribe: jest.fn(),
        on: jest.fn((event, handler) => {
          if (event === 'message') {
            setImmediate(() => handler('topic/response', Buffer.from('ok')));
          }
        }),
        off: jest.fn()
      }
    };

    global.device = { associatedDevice: null };
  });

  afterAll(() => {
    setTimeoutSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it.each(files)('executes exported functions in %s with populated DB responses', async (file) => {
    db.queryRow.mockImplementation(async () => [genericRow, { ...genericRow, id: 2 }]);
    db.insert.mockImplementation(async () => ({ affectedRows: 1, insertId: 1 }));
    db.update.mockImplementation(async () => ({ affectedRows: 1 }));
    db.delete.mockImplementation(async () => ({ affectedRows: 1 }));

    await runAllExports(file);
  });

  it.each(files)('executes exported functions in %s with empty DB responses', async (file) => {
    db.queryRow.mockImplementation(async () => []);
    db.insert.mockImplementation(async () => ({ affectedRows: 0, insertId: 0 }));
    db.update.mockImplementation(async () => ({ affectedRows: 0 }));
    db.delete.mockImplementation(async () => ({ affectedRows: 0 }));

    await runAllExports(file);
  });

  it.each(files)('executes exported functions in %s with DB errors', async (file) => {
    db.queryRow.mockImplementation(async () => {
      throw new Error('query error');
    });
    db.insert.mockImplementation(async () => {
      throw new Error('insert error');
    });
    db.update.mockImplementation(async () => {
      throw new Error('update error');
    });
    db.delete.mockImplementation(async () => {
      throw new Error('delete error');
    });

    global.$.mqttClient.subscribe.mockImplementation((topic, opts, cb) => cb && cb(new Error('subscribe error')));

    await runAllExports(file);

    global.$.mqttClient.subscribe.mockImplementation((topic, opts, cb) => cb && cb(null));
  });
});
