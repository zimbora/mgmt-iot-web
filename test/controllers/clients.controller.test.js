jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/clients', () => ({
  add: jest.fn((clientID, user, password, cb) => cb(null, { id: 1 })),
  delete: jest.fn((clientID, cb) => cb(null, {})),
  update: jest.fn((clientID, user, password, cb) => cb(null, {})),
  list: jest.fn((cb) => cb(null, [])),
  listHuman: jest.fn((cb) => cb(null, [])),
  getDevices: jest.fn((client_id, cb) => cb(null, [])),
  addPermission: jest.fn((client_id, device, level, cb) => cb(null, {})),
  removePermission: jest.fn((client_id, device, cb) => cb(null, {})),
  updatePermission: jest.fn((client_id, device, level, cb) => cb(null, {})),
  checkDeviceReadAccess: jest.fn((client_id, level, device_id, cb) => cb(null, true)),
  checkDeviceWriteAccess: jest.fn((client_id, level, device_id, cb) => cb(null, true)),
  checkDevicePermissionsAccess: jest.fn((client_id, level, device_id, cb) => cb(null, true)),
  getMqttCredentials: jest.fn((client_id, cb) => cb(null, { user: 'u', password: 'p' })),
  getProfile: jest.fn((client_id, cb) => cb(null, { name: 'John' })),
  updateProfile: jest.fn((client_id, name, gmail, cb) => cb(null, {})),
  regenerateApiToken: jest.fn((client_id, cb) => cb(null, 'new-token')),
  findGoogleClient: jest.fn((email, cb) => cb(null, { id: 1 }))
}));

const response = require('../../server/controllers/response');
const Client = require('../../server/models/clients');
const clientsCtrl = require('../../server/controllers/clients');
const httpStatus = require('http-status-codes');

describe('server/controllers/clients – branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('add()', () => {
    it('returns validation error when clientID is missing', () => {
      const req = { body: { user: 'u', password: 'p' } };
      const res = {};
      clientsCtrl.add(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('adds client on valid body', () => {
      const req = { body: { clientID: 'c1', user: 'u', password: 'p' } };
      const res = {};
      clientsCtrl.add(req, res, jest.fn());
      expect(Client.add).toHaveBeenCalledWith('c1', 'u', 'p', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns error on model failure', () => {
      Client.add.mockImplementation((cid, u, p, cb) => cb('add-error'));
      const req = { body: { clientID: 'c1', user: 'u', password: 'p' } };
      const res = {};
      clientsCtrl.add(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'add-error');
    });
  });

  describe('delete()', () => {
    it('returns validation error when clientID is missing', () => {
      const req = { body: {} };
      const res = {};
      clientsCtrl.delete(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('deletes client on valid body', () => {
      const req = { body: { clientID: 'c1' } };
      const res = {};
      clientsCtrl.delete(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', () => {
      Client.delete.mockImplementation((cid, cb) => cb('del-error'));
      const req = { body: { clientID: 'c1' } };
      const res = {};
      clientsCtrl.delete(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'del-error');
    });
  });

  describe('update()', () => {
    it('returns validation error when password is missing', () => {
      const req = { body: { clientID: 'c1', user: 'u' } };
      const res = {};
      clientsCtrl.update(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('updates client on valid body', () => {
      const req = { body: { clientID: 'c1', user: 'u', password: 'p' } };
      const res = {};
      clientsCtrl.update(req, res, jest.fn());
      expect(Client.update).toHaveBeenCalledWith('c1', 'u', 'p', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });
  });

  describe('list()', () => {
    it('returns client list on success', () => {
      Client.list.mockImplementation((cb) => cb(null, [{ id: 1 }]));
      const req = {};
      const res = {};
      clientsCtrl.list(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, [{ id: 1 }]);
    });

    it('returns error on model failure', () => {
      Client.list.mockImplementation((cb) => cb('list-error'));
      const req = {};
      const res = {};
      clientsCtrl.list(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'list-error');
    });
  });

  describe('listHuman()', () => {
    it('returns human clients on success', () => {
      Client.listHuman.mockImplementation((cb) => cb(null, [{ id: 2 }]));
      const req = {};
      const res = {};
      clientsCtrl.listHuman(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, [{ id: 2 }]);
    });

    it('returns error on model failure', () => {
      Client.listHuman.mockImplementation((cb) => cb('err'));
      const req = {};
      const res = {};
      clientsCtrl.listHuman(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'err');
    });
  });

  describe('getDevices()', () => {
    it('returns devices on success', () => {
      Client.getDevices.mockImplementation((id, cb) => cb(null, [{ device: 'd1' }]));
      const req = { params: { client_id: 5 } };
      const res = {};
      clientsCtrl.getDevices(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, [{ device: 'd1' }]);
    });

    it('returns error on model failure', () => {
      Client.getDevices.mockImplementation((id, cb) => cb('dev-error'));
      const req = { params: { client_id: 5 } };
      const res = {};
      clientsCtrl.getDevices(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'dev-error');
    });
  });

  describe('addPermission()', () => {
    it('returns validation error on missing fields', () => {
      const req = { params: { client_id: 1 }, body: { device: 'd1' } };
      const res = {};
      clientsCtrl.addPermission(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('adds permission on valid body', () => {
      const req = { params: { client_id: 1 }, body: { device: 'd1', level: 2 } };
      const res = {};
      clientsCtrl.addPermission(req, res, jest.fn());
      expect(Client.addPermission).toHaveBeenCalledWith(1, 'd1', 2, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', () => {
      Client.addPermission.mockImplementation((cid, d, l, cb) => cb('perm-error'));
      const req = { params: { client_id: 1 }, body: { device: 'd1', level: 2 } };
      const res = {};
      clientsCtrl.addPermission(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'perm-error');
    });
  });

  describe('removePermission()', () => {
    it('returns validation error on missing device', () => {
      const req = { params: { client_id: 1 }, body: {} };
      const res = {};
      clientsCtrl.removePermission(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('removes permission on valid body', () => {
      const req = { params: { client_id: 1 }, body: { device: 'd1' } };
      const res = {};
      clientsCtrl.removePermission(req, res, jest.fn());
      expect(Client.removePermission).toHaveBeenCalledWith(1, 'd1', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', () => {
      Client.removePermission.mockImplementation((cid, d, cb) => cb('rm-error'));
      const req = { params: { client_id: 1 }, body: { device: 'd1' } };
      const res = {};
      clientsCtrl.removePermission(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'rm-error');
    });
  });

  describe('updatePermission()', () => {
    it('returns validation error on missing fields', () => {
      const req = { params: { client_id: 1 }, body: { device: 'd1' } };
      const res = {};
      clientsCtrl.updatePermission(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('updates permission on valid body', () => {
      const req = { params: { client_id: 1 }, body: { device: 'd1', level: 3 } };
      const res = {};
      clientsCtrl.updatePermission(req, res, jest.fn());
      expect(Client.updatePermission).toHaveBeenCalledWith(1, 'd1', 3, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });
  });

  describe('checkDeviceReadAccess()', () => {
    it('calls next() for admin users', () => {
      const next = jest.fn();
      const req = { user: { type: 'admin', client_id: 1, level: 5 }, params: { device_id: 'd1' } };
      const res = {};
      clientsCtrl.checkDeviceReadAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('calls next() when access is granted', () => {
      const next = jest.fn();
      const req = { user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDeviceReadAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns error when access check fails', () => {
      Client.checkDeviceReadAccess.mockImplementation((cid, level, did, cb) => cb('err'));
      const next = jest.fn();
      const req = { originalUrl: '/api/device/d1/info', user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDeviceReadAccess(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ Error: true, Message: 'err', Result: null });
    });

    it('returns not allowed JSON when API access is denied', () => {
      Client.checkDeviceReadAccess.mockImplementation((cid, level, did, cb) => cb(null, false));
      const next = jest.fn();
      const req = { originalUrl: '/api/device/d1/info', user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDeviceReadAccess(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ Error: true, Message: 'Not allowed', Result: null });
    });

    it('renders forbidden page when web access is denied', () => {
      Client.checkDeviceReadAccess.mockImplementation((cid, level, did, cb) => cb(null, false));
      const next = jest.fn();
      const req = { originalUrl: '/device/d1/dashboard', user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { status: jest.fn().mockReturnThis(), render: jest.fn() };
      clientsCtrl.checkDeviceReadAccess(req, res, next);
      expect(res.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
      expect(res.render).toHaveBeenCalledWith(
        expect.stringContaining('/server/public/views/pages/forbidden'),
        expect.objectContaining({
          user: req.user,
          page: 'Forbidden',
          message: 'You do not have permission to access this page.',
          suggestion: 'Please report this to your administrator.',
          redirectPath: '/devices'
        })
      );
    });
  });

  describe('checkDeviceWriteAccess()', () => {
    it('calls next() for admin users', () => {
      const next = jest.fn();
      const req = { user: { type: 'admin', client_id: 1, level: 5 }, params: { device_id: 'd1' } };
      const res = {};
      clientsCtrl.checkDeviceWriteAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('calls next() when access is granted', () => {
      Client.checkDeviceWriteAccess.mockImplementation((cid, level, did, cb) => cb(null, true));
      const next = jest.fn();
      const req = { user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDeviceWriteAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns not allowed when access is denied', () => {
      Client.checkDeviceWriteAccess.mockImplementation((cid, level, did, cb) => cb(null, false));
      const next = jest.fn();
      const req = { originalUrl: '/api/device/d1/field', user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDeviceWriteAccess(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ Error: true, Message: 'Not allowed', Result: null });
    });
  });

  describe('checkDevicePermissionsAccess()', () => {
    it('calls next() for admin users', () => {
      const next = jest.fn();
      const req = { user: { type: 'admin', client_id: 1, level: 5 }, params: { device_id: 'd1' } };
      const res = {};
      clientsCtrl.checkDevicePermissionsAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('calls next() when access is granted', () => {
      Client.checkDevicePermissionsAccess.mockImplementation((cid, level, did, cb) => cb(null, true));
      const next = jest.fn();
      const req = { user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDevicePermissionsAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns not allowed when access is denied', () => {
      Client.checkDevicePermissionsAccess.mockImplementation((cid, level, did, cb) => cb(null, false));
      const next = jest.fn();
      const req = { originalUrl: '/api/device/d1', user: { type: 'user', client_id: 1, level: 2 }, params: { device_id: 'd1' } };
      const res = { json: jest.fn() };
      clientsCtrl.checkDevicePermissionsAccess(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ Error: true, Message: 'Not allowed', Result: null });
    });
  });

  describe('checkAdminAccess()', () => {
    it('calls next() for level >= 4', () => {
      const next = jest.fn();
      const req = { user: { level: 4 } };
      const res = { json: jest.fn() };
      clientsCtrl.checkAdminAccess(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('returns not allowed for level < 4', () => {
      const next = jest.fn();
      const req = { user: { level: 3 } };
      const res = { json: jest.fn() };
      clientsCtrl.checkAdminAccess(req, res, next);
      expect(res.json).toHaveBeenCalledWith({ Error: true, Message: 'Not allowed', Result: null });
    });
  });

  describe('getMqttCredentials()', () => {
    it('returns credentials on success', () => {
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.getMqttCredentials(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { user: 'u', password: 'p' });
    });

    it('returns error on model failure', () => {
      Client.getMqttCredentials.mockImplementation((cid, cb) => cb('cred-error'));
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.getMqttCredentials(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'cred-error');
    });
  });

  describe('getProfile()', () => {
    it('returns profile on success', () => {
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.getProfile(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { name: 'John' });
    });

    it('returns error on model failure', () => {
      Client.getProfile.mockImplementation((cid, cb) => cb('profile-error'));
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.getProfile(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'profile-error');
    });
  });

  describe('updateProfile()', () => {
    it('returns validation error on missing fields', () => {
      const req = { user: { client_id: 1 }, body: { name: 'John' } };
      const res = {};
      clientsCtrl.updateProfile(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('updates profile on valid body', () => {
      const req = { user: { client_id: 1 }, body: { name: 'John', gmail: 'john@g.com' } };
      const res = {};
      clientsCtrl.updateProfile(req, res, jest.fn());
      expect(Client.updateProfile).toHaveBeenCalledWith(1, 'John', 'john@g.com', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', () => {
      Client.updateProfile.mockImplementation((cid, name, gmail, cb) => cb('upd-error'));
      const req = { user: { client_id: 1 }, body: { name: 'John', gmail: 'john@g.com' } };
      const res = {};
      clientsCtrl.updateProfile(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'upd-error');
    });
  });

  describe('regenerateApiToken()', () => {
    it('returns new token on success', () => {
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.regenerateApiToken(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { api_token: 'new-token' });
    });

    it('returns error on model failure', () => {
      Client.regenerateApiToken.mockImplementation((cid, cb) => cb('token-error'));
      const req = { user: { client_id: 1 } };
      const res = {};
      clientsCtrl.regenerateApiToken(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'token-error');
    });
  });

  describe('findGoogleClient()', () => {
    it('returns validation error on missing email', () => {
      const req = { query: {} };
      const res = {};
      clientsCtrl.findGoogleClient(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('finds client on valid query', () => {
      const req = { query: { email: 'test@g.com' } };
      const res = {};
      clientsCtrl.findGoogleClient(req, res, jest.fn());
      expect(Client.findGoogleClient).toHaveBeenCalledWith('test@g.com', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns error on model failure', () => {
      Client.findGoogleClient.mockImplementation((email, cb) => cb('find-error'));
      const req = { query: { email: 'test@g.com' } };
      const res = {};
      clientsCtrl.findGoogleClient(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'find-error');
    });
  });
});
