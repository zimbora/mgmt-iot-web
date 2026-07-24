jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/firmwares', () => ({
  add: jest.fn((...args) => args[args.length - 1](null, {})),
  delete: jest.fn((id, cb) => cb(null, {})),
  updateRelease: jest.fn((id, release, cb) => cb(null, {})),
  list: jest.fn((cb) => cb(null, [])),
  listWithClientPermission: jest.fn((id, cb) => cb(null, [])),
  listByModel: jest.fn((id, cb) => cb(null, [])),
  listByModelWithClientPermission: jest.fn((cid, mid, cb) => cb(null, []))
}));

jest.mock('../../server/models/clients', () => ({
  isAdmin: jest.fn(() => true)
}));

jest.mock('../../server/models/models', () => ({
  list: jest.fn((cb) => cb(null, [])),
  listWithClientPermission: jest.fn((id, cb) => cb(null, []))
}));

const ctrl = require('../../server/controllers/firmwares');
const response = require('../../server/controllers/response');
const clients = require('../../server/models/clients');
const httpStatus = require('http-status-codes');

describe('server/controllers/firmwares additional branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('add() errors when version is missing', () => {
    const res = {};
    const req = { file: { filename: 'f.bin', originalname: 'f.bin' }, body: { release: 'prod' }, params: { model_id: 1 } };
    ctrl.add(req, res, jest.fn());
    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'fw version not defined');
  });

  it('add() errors when release is missing', () => {
    const res = {};
    const req = { file: { filename: 'f.bin', originalname: 'f.bin' }, body: { version: '1.0.0' }, params: { model_id: 1 } };
    ctrl.add(req, res, jest.fn());
    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'release not defined');
  });

  it('add() succeeds when payload is valid', () => {
    const res = {};
    const req = { file: { filename: 'f.bin', originalname: 'f.bin' }, body: { version: '1.0.0', app_version: '1.0.0', release: 'prod' }, params: { model_id: 1 } };
    ctrl.add(req, res, jest.fn());
    expect(response.send).toHaveBeenCalled();
  });

  it('listByModel() uses admin path', () => {
    clients.isAdmin.mockReturnValue(true);
    ctrl.listByModel({ user: { level: 5, client_id: 1 }, params: { model_id: 1 } }, {}, jest.fn());
    expect(response.send).toHaveBeenCalled();
  });

  it('listModels() uses admin path', () => {
    clients.isAdmin.mockReturnValue(true);
    ctrl.listModels({ user: { level: 5, client_id: 1 } }, {}, jest.fn());
    expect(response.send).toHaveBeenCalled();
  });
});
