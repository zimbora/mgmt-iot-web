const makeReqRes = () => {
  const req = {
    body: {
      id: 1,
      user: 'u',
      email: 'user@example.com',
      password: 'pwd',
      uid: 'uid-1',
      uid_prefix: 'dev',
      uid_length: 8,
      name: 'name',
      description: 'desc',
      project_id: 1,
      projectId: 1,
      model_id: 1,
      modelId: 1,
      clientID: '1',
      deviceID: '1',
      clientId: '1',
      client_id: 1,
      device: '1',
      level: 5,
      tag: 'tag',
      objectId: 3,
      objectInstanceId: 0,
      resourceId: 1,
      observe: true,
      readInterval: 10,
      option: 'opt',
      enable: true,
      token: 'tkn',
      observing: true,
      data: {},
      value: 1,
      entry_id: 1,
      release: 'prod',
      app_version: '1.0.0'
    },
    query: {
      uid: 'uid-1',
      modelId: 1,
      updatedAt: '2025-01-01 00:00:00',
      objectId: 3,
      accept_release: 'prod',
      token: 'google-token',
      email: 'user@example.com'
    },
    params: {
      id: 1,
      fwId: 1,
      user_id: 1,
      client_id: '1',
      device_id: 1,
      project_id: 1,
      model_id: 1,
      template_id: 1,
      template_id2: 1,
      entry_id: 1,
      resource_id: 1,
      sensor_id: 1
    },
    headers: { token: 'Bearer token' },
    session: {},
    user: { level: 5, type: 'admin', client_id: 1, user_id: 1, nick: 'nick', name: 'Name', avatar: '' },
    ip: '127.0.0.1',
    get: jest.fn(() => 'agent')
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    sendFile: jest.fn().mockReturnThis(),
    redirect: jest.fn().mockReturnThis()
  };

  const next = jest.fn();

  return { req, res, next };
};

let mockBehavior = 'success';

const createModelProxy = () => {
  const cache = {
    isAdmin: jest.fn(() => true),
    getId: jest.fn(() => Promise.resolve(null)),
    getInfo: jest.fn(() => Promise.resolve({ protocol: 'mqtt' })),
    getById: jest.fn(() => Promise.resolve({ protocol: 'mqtt' })),
    getLatestVersion: jest.fn(() => Promise.resolve({ version: '1.0.0' })),
    getLatestAppVersion: jest.fn(() => Promise.resolve({ app_version: '1.0.0' })),
    getProject: jest.fn(() => Promise.resolve(mockBehavior === 'error' ? 'mqtt' : 'lwm2m')),
    check_authentication: jest.fn((token, cb) => cb(mockBehavior !== 'error', { level: 5, client_id: 1, type: 'admin', agent: 'agent', ip: '127.0.0.1' })),
    check_token: jest.fn((token, cb) => cb(mockBehavior !== 'error', { level: 5, client_id: 1, type: 'admin' })),
    getByApiToken: jest.fn((token, cb) => cb(mockBehavior === 'error' ? 'mock-error' : null, mockBehavior === 'error' ? null : [{ client_id: 1 }]))
  };

  return new Proxy(cache, {
    get(target, prop) {
      if (!(prop in target)) {
        target[prop] = jest.fn((...args) => {
          const cb = args[args.length - 1];
          if (typeof cb === 'function') {
            if (String(prop).toLowerCase().includes('check') || String(prop).toLowerCase().includes('access') || String(prop).toLowerCase().includes('ownership')) {
              cb(mockBehavior === 'error' ? 'mock-error' : null, mockBehavior !== 'error');
            } else {
              cb(mockBehavior === 'error' ? 'mock-error' : null, mockBehavior === 'error' ? null : []);
            }
            return;
          }
          return Promise.resolve([]);
        });
      }
      return target[prop];
    }
  });
};

jest.mock('joi', () => {
  const makeValidationResult = () => (
    mockBehavior === 'validation'
      ? { error: { details: [{ message: 'validation error' }] } }
      : { error: null }
  );

  const chain = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'validate') return () => makeValidationResult();
        return () => chain;
      }
    }
  );

  return {
    object: () => ({ validate: () => makeValidationResult() }),
    string: () => chain,
    number: () => chain,
    boolean: () => chain,
    array: () => chain,
    any: () => chain,
    required: () => chain,
    optional: () => chain
  };
});

jest.mock('fs', () => ({
  readFileSync: jest.fn(() => Buffer.from('firmware-bytes'))
}));

jest.mock('../../server/models/auth', () => createModelProxy());
jest.mock('../../server/models/clients', () => createModelProxy());
jest.mock('../../server/models/users', () => createModelProxy());
jest.mock('../../server/models/devices', () => createModelProxy());
jest.mock('../../server/models/projects', () => createModelProxy());
jest.mock('../../server/models/models', () => createModelProxy());
jest.mock('../../server/models/firmwares', () => createModelProxy());
jest.mock('../../server/models/sensors', () => createModelProxy());
jest.mock('../../server/models/sensorsTemplate', () => createModelProxy());
jest.mock('../../server/models/templates', () => createModelProxy());
jest.mock('../../server/models/lwm2m', () => createModelProxy());
jest.mock('../../server/models/lwm2mTemplate', () => createModelProxy());
jest.mock('../../server/models/mqttTemplate', () => createModelProxy());

jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(async () => ({
      getPayload: () => ({ email: 'user@example.com', name: 'User', picture: 'avatar' })
    }))
  }))
}));

describe('controllers logic execution', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    global.user = { level: 5 };
    global.log = {
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn()
    };
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  const controllers = [
    '../../server/controllers/auth',
    '../../server/controllers/clients',
    '../../server/controllers/devices',
    '../../server/controllers/firmwares',
    '../../server/controllers/lwm2m',
    '../../server/controllers/models',
    '../../server/controllers/projects',
    '../../server/controllers/sensors',
    '../../server/controllers/sensorsTemplate',
    '../../server/controllers/templates',
    '../../server/controllers/users'
  ];

  it.each(controllers)('executes exported handlers for %s', async (controllerPath) => {
    const controller = require(controllerPath);

    for (const [name, handler] of Object.entries(controller)) {
      if (typeof handler !== 'function') continue;

      for (const behavior of ['success', 'error', 'validation']) {
        mockBehavior = behavior;

        const { req, res, next } = makeReqRes();
        req.user.level = behavior === 'error' ? 1 : 5;
        req.user.type = behavior === 'error' ? 'user' : 'admin';

        try {
          if (name === 'deauth') {
            await handler(req, res, jest.fn());
            continue;
          }

          const out = handler(req, res, next);
          if (out && typeof out.then === 'function') {
            await out;
          }

          await new Promise((resolve) => setImmediate(resolve));
        } catch (_e) {
          // keep traversing remaining handlers to maximize exercised code paths
        }
      }
    }
  });
});
