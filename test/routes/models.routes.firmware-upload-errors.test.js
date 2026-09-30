const express = require('express');
const request = require('supertest');

const duplicateFilenameError = 'File with the same name already exists.';

const mockControllers = () => {
  jest.doMock('../../server/controllers/models', () => ({
    checkAccess: (req, res, next) => next(),
    get: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    listPermissions: jest.fn(),
    grantPermission: jest.fn(),
    removePermission: jest.fn(),
    getLatestFirmware: jest.fn(),
    updateOption: jest.fn()
  }));

  jest.doMock('../../server/controllers/firmwares', () => ({
    listByModel: jest.fn(),
    add: jest.fn((req, res) => res.status(201).json({ route: 'firmwareAdd' })),
    get: jest.fn(),
    delete: jest.fn(),
    updateRelease: jest.fn()
  }));

  jest.doMock('../../server/controllers/sensorsTemplate', () => ({
    list: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    add: jest.fn(),
    propagate: jest.fn()
  }));

  jest.doMock('../../server/controllers/actuatorsTemplate', () => ({
    list: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    add: jest.fn(),
    propagate: jest.fn()
  }));

  jest.doMock('../../server/controllers/variants', () => ({
    get: jest.fn(),
    add: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    list: jest.fn(),
    listByModel: jest.fn()
  }));
};

const createApp = () => {
  const router = require('../../server/routes/models');
  const app = express();
  app.use(express.json());
  app.use('/model', router);
  return app;
};

describe('server/routes/models firmware upload error handling', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 400 when multer reports a duplicate firmware filename', async () => {
    mockControllers();
    jest.doMock('multer', () => {
      const multerMock = () => ({
        single: () => (req, res, next) => next(new Error(duplicateFilenameError))
      });
      multerMock.diskStorage = jest.fn(() => ({}));
      multerMock.MulterError = class MulterError extends Error {};
      return multerMock;
    });

    const app = createApp();
    const res = await request(app).post('/model/10/firmwares').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ success: false, message: duplicateFilenameError });
  });

  it('returns 500 when multer reports a generic storage failure', async () => {
    mockControllers();
    jest.doMock('multer', () => {
      const multerMock = () => ({
        single: () => (req, res, next) => next(new Error('storage failed'))
      });
      multerMock.diskStorage = jest.fn(() => ({}));
      multerMock.MulterError = class MulterError extends Error {};
      return multerMock;
    });

    const app = createApp();
    const res = await request(app).post('/model/10/firmwares').send({});

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: 'An unknown error occurred.' });
  });
});
