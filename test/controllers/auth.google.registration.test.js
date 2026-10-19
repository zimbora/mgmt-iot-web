const mockVerifyIdToken = jest.fn();
const mockGetPayload = jest.fn(() => ({
  email: 'newuser@example.com',
  name: 'New User',
  picture: 'https://example.com/avatar.png'
}));

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken
  }))
}));

const mockUserAdd = jest.fn();
jest.mock('../../server/models/users', () => ({
  getId: jest.fn(async () => 1),
  add: mockUserAdd,
  findUserByEmail: jest.fn((e, p, cb) => cb(null, null))
}));

const mockFindGoogleClient = jest.fn();
const mockRegisterGoogleClient = jest.fn();
jest.mock('../../server/models/clients', () => ({
  get: jest.fn((u, p, cb) => cb(null, null)),
  findGoogleClient: mockFindGoogleClient,
  registerGoogleClient: mockRegisterGoogleClient
}));

jest.mock('../../server/models/auth', () => ({
  check_authentication: jest.fn((t, cb) => cb(false, null)),
  check_token: jest.fn((t, cb) => cb(false, null))
}));

jest.mock('../../server/models/firmwares', () => ({
  getFirmwareToken: jest.fn((t, id, cb) => cb(null, []))
}));

describe('authenticate_google new user registration', () => {
  beforeEach(() => {
    jest.resetModules();
    mockVerifyIdToken.mockResolvedValue({ getPayload: mockGetPayload });
    mockUserAdd.mockClear();
    mockFindGoogleClient.mockClear();
    mockRegisterGoogleClient.mockClear();
    global.log = { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn(), trace: jest.fn() };
  });

  it('creates a new user and client when Google user is not registered', async () => {
    mockFindGoogleClient
      .mockImplementationOnce((email, cb) => cb(null, null)) // first call: not found
      .mockImplementationOnce((email, cb) => cb(null, { user_id: 42, client_id: 10, nick: 'newuser', name: 'New User', avatar: '' })); // after registration
    mockUserAdd.mockImplementation((type, pwd, level, cb) => cb(null, { insertId: 42 }));
    mockRegisterGoogleClient.mockImplementation((userId, data, cb) => {
      expect(userId).toBe(42);
      cb(null, { affectedRows: 1 });
    });

    const authCtrl = require('../../server/controllers/auth');
    const req = { query: { token: 'valid-token' }, body: {}, session: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await authCtrl.authenticate_google(req, res, next);

    expect(mockUserAdd).toHaveBeenCalled();
    expect(mockRegisterGoogleClient).toHaveBeenCalledWith(42, expect.objectContaining({ email: 'newuser@example.com' }), expect.any(Function));
    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ user_id: 42 });
  });

  it('returns Failure when User.add fails during new Google registration', async () => {
    mockFindGoogleClient.mockImplementationOnce((email, cb) => cb(null, null));
    mockUserAdd.mockImplementation((type, pwd, level, cb) => cb(new Error('db error'), null));

    const authCtrl = require('../../server/controllers/auth');
    const req = { query: { token: 'valid-token' }, body: {}, session: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await authCtrl.authenticate_google(req, res, next);

    expect(res.json).toHaveBeenCalledWith({ message: 'Failure' });
    expect(next).not.toHaveBeenCalled();
  });

  it('logs in existing Google user without creating a new user', async () => {
    const existingUser = { user_id: 5, client_id: 2, nick: 'existing', name: 'Existing User', avatar: '' };
    mockFindGoogleClient.mockImplementationOnce((email, cb) => cb(null, existingUser));

    const authCtrl = require('../../server/controllers/auth');
    const req = { query: { token: 'valid-token' }, body: {}, session: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();

    await authCtrl.authenticate_google(req, res, next);

    expect(mockUserAdd).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(existingUser);
  });
});
