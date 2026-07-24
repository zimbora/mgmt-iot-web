jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

jest.mock('../../server/models/clients', () => ({
  getByApiToken: jest.fn()
}));

const jwt = require('jsonwebtoken');
const Client = require('../../server/models/clients');
const Auth = require('../../server/models/auth');

describe('server/models/auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('check_authentication() accepts valid bearer token', (done) => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { exp: Math.round(Date.now() / 1000) + 60, user_id: 5 });
    });

    Auth.check_authentication('Bearer token-123', (authenticated, decoded) => {
      expect(authenticated).toBe(true);
      expect(decoded.user_id).toBe(5);
      done();
    });
  });

  it('check_authentication() rejects expired token', (done) => {
    jwt.verify.mockImplementation((token, secret, cb) => {
      cb(null, { exp: Math.round(Date.now() / 1000) - 1 });
    });

    Auth.check_authentication('token-123', (authenticated) => {
      expect(authenticated).toBe(false);
      done();
    });
  });

  it('check_token() resolves user from API token', (done) => {
    Client.getByApiToken.mockImplementation((token, cb) => {
      cb(null, [{ client_id: 42 }]);
    });

    Auth.check_token('Bearer api-token', (authenticated, user) => {
      expect(authenticated).toBe(true);
      expect(user.client_id).toBe(42);
      done();
    });
  });
});
