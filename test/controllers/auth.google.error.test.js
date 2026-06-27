jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: jest.fn(async () => {
      throw new Error('invalid-token');
    })
  }))
}));

jest.mock('../../server/models/users', () => ({
  getId: jest.fn(async () => 1),
  findUserByEmail: jest.fn((e, p, cb) => cb(null, null))
}));

jest.mock('../../server/models/clients', () => ({
  get: jest.fn((u, p, cb) => cb(null, null)),
  findGoogleClient: jest.fn((email, cb) => cb(null, null)),
  registerGoogleClient: jest.fn((id, data, cb) => cb(null, { affectedRows: 1 }))
}));

jest.mock('../../server/models/auth', () => ({
  check_authentication: jest.fn((t, cb) => cb(false, null)),
  check_token: jest.fn((t, cb) => cb(false, null))
}));

jest.mock('../../server/models/firmwares', () => ({
  getFirmwareToken: jest.fn((t, id, cb) => cb(null, []))
}));

describe('server/controllers/auth google error path', () => {
  it('authenticate_google() handles token verification errors', async () => {
    global.log = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn()
    };

    const authCtrl = require('../../server/controllers/auth');

    const req = { query: { token: 'bad-token' }, body: {} };
    const res = { json: jest.fn() };

    await authCtrl.authenticate_google(req, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(global.log.warn).toHaveBeenCalledWith('Google Unauthorized');
  });
});
