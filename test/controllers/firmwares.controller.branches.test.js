jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readFileSync: jest.fn(() => Buffer.from('firmware'))
}));

jest.mock('crc', () => ({
  crc32: jest.fn(() => 255),
  crc16modbus: jest.fn(() => 65535)
}));

jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/firmwares', () => ({
  add: jest.fn((...args) => args[args.length - 1](null, {})),
  delete: jest.fn((id, cb) => cb(null, {})),
  updateRelease: jest.fn((id, rel, cb) => cb(null, {})),
  list: jest.fn((cb) => cb(null, [])),
  listWithClientPermission: jest.fn((id, cb) => cb(null, [])),
  listByModel: jest.fn((id, cb) => cb(null, [])),
  listByModelWithClientPermission: jest.fn((cid, id, cb) => cb(null, []))
}));

jest.mock('../../server/models/clients', () => ({
  isAdmin: jest.fn(() => false)
}));

jest.mock('../../server/models/models', () => ({
  list: jest.fn((cb) => cb(null, [])),
  listWithClientPermission: jest.fn((id, cb) => cb(null, []))
}));

const response = require('../../server/controllers/response');
const clientsModel = require('../../server/models/clients');
const firmwaresCtrl = require('../../server/controllers/firmwares');
const httpStatus = require('http-status-codes');
const fs = require('fs');

describe('server/controllers/firmwares branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('add() returns error when no file is provided', () => {
    const req = { body: {}, params: {} };
    const res = {};

    firmwaresCtrl.add(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'No files were uploaded');
  });

  it('list() uses client-permission path for non-admin', () => {
    clientsModel.isAdmin.mockReturnValue(false);

    const req = { user: { level: 1, client_id: 7 } };
    const res = {};

    firmwaresCtrl.list(req, res, jest.fn());

    expect(response.send).toHaveBeenCalled();
  });

  it('get() sets hashes and sends file', () => {
    const req = { params: { fwId: 'fw.bin' } };
    const res = { set: jest.fn().mockReturnThis(), sendFile: jest.fn() };

    firmwaresCtrl.get(req, res, jest.fn());

    expect(res.set).toHaveBeenCalledWith('Content-MD5', expect.any(String));
    expect(res.set).toHaveBeenCalledWith('Content-CRC32', expect.any(String));
    expect(res.set).toHaveBeenCalledWith('Content-CRC16', expect.any(String));
    expect(res.sendFile).toHaveBeenCalled();
  });

  it('get() rejects invalid firmware filenames', () => {
    const req = { params: { fwId: '../fw.bin' } };
    const res = {};

    firmwaresCtrl.get(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Invalid firmware filename.');
  });

  it('get() returns not found when firmware file is missing', () => {
    const req = { params: { fwId: 'fw.bin' } };
    const res = { set: jest.fn().mockReturnThis(), sendFile: jest.fn() };
    const missingFileError = new Error('missing');
    missingFileError.code = 'ENOENT';
    fs.readFileSync.mockImplementationOnce(() => {
      throw missingFileError;
    });

    firmwaresCtrl.get(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'missing');
  });

  it('get() returns internal server error for unexpected file read failures', () => {
    const req = { params: { fwId: 'fw.bin' } };
    const res = { set: jest.fn().mockReturnThis(), sendFile: jest.fn() };
    const readError = new Error('denied');
    readError.code = 'EACCES';
    fs.readFileSync.mockImplementationOnce(() => {
      throw readError;
    });

    firmwaresCtrl.get(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'denied');
  });
});
