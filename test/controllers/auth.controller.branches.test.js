jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token')
}));

jest.mock('../../server/models/users', () => ({
  findUserByEmail: jest.fn((email, password, cb) => cb(null, { id: 1 })),
  getId: jest.fn(async () => 1),
  add: jest.fn((type, pwd, level, cb) => cb(null, { insertId: 42 }))
}));

jest.mock('../../server/models/clients', () => ({
  get: jest.fn((user, password, cb) => cb(null, { user_id: 1, type: 'admin', level: 5, client_id: 1, nick: 'n', name: 'N', avatar: '' })),
  findGoogleClient: jest.fn((email, cb) => cb(null, { user_id: 1 })),
  registerGoogleClient: jest.fn((uid, data, cb) => cb(null, { affectedRows: 1 }))
}));

jest.mock('../../server/models/auth', () => ({
  check_authentication: jest.fn((token, cb) => cb(false, null)),
  check_token: jest.fn((token, cb) => cb(false, null))
}));

jest.mock('../../server/models/firmwares', () => ({
  getFirmwareToken: jest.fn((token, fwId, cb) => cb(null, []))
}));

const authCtrl = require('../../server/controllers/auth');
const response = require('../../server/controllers/response');
const Auth = require('../../server/models/auth');
const httpStatus = require('http-status-codes');

describe('server/controllers/auth branch coverage', () => {
  it('respondJWT() returns unauthorized when req.user missing', () => {
    const req = { session: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    authCtrl.respondJWT(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('generateToken() skips when req.user missing', () => {
    const req = { session: {} };
    const res = {};
    const next = jest.fn();

    authCtrl.generateToken(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('generateToken() sets session token and cookie when req.user present', () => {
    const req = {
      session: {},
      user: { user_id: 1, type: 'admin', level: 5, client_id: 1, nick: 'n', name: 'N', avatar: '' },
      ip: '127.0.0.1',
      secure: false,
      get: jest.fn(() => 'test-agent')
    };
    const res = { cookie: jest.fn() };
    const next = jest.fn();

    authCtrl.generateToken(req, res, next);

    expect(req.session.token).toBe('signed-token');
    expect(res.cookie).toHaveBeenCalledWith('jwt_token', 'signed-token', expect.objectContaining({
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    }));
    expect(next).toHaveBeenCalled();
  });

  it('fw_check_token() returns bad request when token missing', () => {
    const req = { headers: {}, query: {}, params: { fwId: 1 } };
    const res = {};

    authCtrl.fw_check_token(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'No token defined');
  });

  it('respondJWT() returns success payload when req.user exists', () => {
    const req = { user: { id: 1 }, session: { token: 'signed-token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    authCtrl.respondJWT(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Success', token: 'signed-token' });
  });

  it('check_authentication() falls back to cookie token when session token is missing', (done) => {
    Auth.check_authentication.mockImplementationOnce((token, cb) => {
      cb(true, { agent: 'ua', ip: '1.2.3.4' });
    });

    const req = {
      session: {},
      headers: { cookie: 'jwt_token=cookie-jwt' },
      ip: '1.2.3.4',
      get: jest.fn(() => 'ua')
    };
    const res = {};
    const next = jest.fn(() => {
      expect(Auth.check_authentication).toHaveBeenCalledWith('cookie-jwt', expect.any(Function));
      expect(req.session.token).toBe('cookie-jwt');
      done();
    });

    authCtrl.check_authentication(req, res, next);
  });

  it('deauth() clears session token and cookie', () => {
    const req = { session: { token: 'some-token' } };
    const res = { clearCookie: jest.fn(), redirect: jest.fn() };
    const cb = jest.fn();

    authCtrl.deauth(req, res, cb);

    expect(req.session.token).toBeNull();
    expect(res.clearCookie).toHaveBeenCalledWith('jwt_token');
    expect(cb).toHaveBeenCalledWith(res, res);
  });
});
