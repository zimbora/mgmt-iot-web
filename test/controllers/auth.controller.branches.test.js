jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'signed-token')
}));

jest.mock('../../server/models/users', () => ({
  findUserByEmail: jest.fn((email, password, cb) => cb(null, { id: 1 })),
  getId: jest.fn(async () => 1)
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
});
