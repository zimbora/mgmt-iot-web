const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/models', () => ({
  checkAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'modelAccess'];
    next();
  },
  get: (req, res) => res.status(200).json({ route: 'get', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'delete', guards: req.guards }),
  update: (req, res) => res.status(200).json({ route: 'update', guards: req.guards }),
  listPermissions: (req, res) => res.status(200).json({ route: 'listPermissions', guards: req.guards }),
  grantPermission: (req, res) => res.status(201).json({ route: 'grantPermission', guards: req.guards }),
  removePermission: (req, res) => res.status(200).json({ route: 'removePermission', guards: req.guards }),
  getLatestFirmware: (req, res) => res.status(200).json({ route: 'getLatestFirmware', guards: req.guards }),
  updateOption: (req, res) => res.status(200).json({ route: 'updateOption', guards: req.guards })
}));

jest.mock('../../server/controllers/firmwares', () => ({
  listByModel: (req, res) => res.status(200).json({ route: 'listByModel', guards: req.guards }),
  add: (req, res) => res.status(201).json({ route: 'firmwareAdd', guards: req.guards }),
  get: (req, res) => res.status(200).json({ route: 'firmwareGet', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'firmwareDelete', guards: req.guards }),
  updateRelease: (req, res) => res.status(200).json({ route: 'firmwareUpdateRelease', guards: req.guards })
}));

jest.mock('../../server/controllers/sensorsTemplate', () => ({
  list: (req, res) => res.status(200).json({ route: 'sensorTemplate.list', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'sensorTemplate.delete', guards: req.guards }),
  update: (req, res) => res.status(200).json({ route: 'sensorTemplate.update', guards: req.guards }),
  add: (req, res) => res.status(201).json({ route: 'sensorTemplate.add', guards: req.guards }),
  propagate: (req, res) => res.status(200).json({ route: 'sensorTemplate.propagate', guards: req.guards })
}));

jest.mock('../../server/controllers/variants', () => ({
  get: (req, res) => res.status(200).json({ route: 'variant.get', guards: req.guards, variant_id: req.params.variant_id }),
  add: (req, res) => res.status(201).json({ route: 'variant.add', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'variant.delete', guards: req.guards }),
  update: (req, res) => res.status(200).json({ route: 'variant.update', guards: req.guards }),
  list: (req, res) => res.status(200).json({ route: 'variant.list', guards: req.guards }),
  listByModel: (req, res) => res.status(200).json({ route: 'variant.listByModel', guards: req.guards })
}));

jest.mock('multer', () => {
  const multerMock = () => ({
    single: () => (req, res, next) => {
      req.file = { originalname: 'test.bin' };
      next();
    }
  });
  multerMock.diskStorage = jest.fn(() => ({}));
  multerMock.MulterError = class MulterError extends Error {};
  return multerMock;
});

describe('server/routes/models – variant and additional routes', () => {
  let app;

  beforeEach(() => {
    jest.resetModules();
    // Re-require mocks after resetModules
    jest.mock('../../server/controllers/models', () => ({
      checkAccess: (req, res, next) => { req.guards = ['modelAccess']; next(); },
      get: (req, res) => res.status(200).json({ route: 'get', guards: req.guards }),
      delete: (req, res) => res.status(200).json({ route: 'delete', guards: req.guards }),
      update: (req, res) => res.status(200).json({ route: 'update', guards: req.guards }),
      listPermissions: (req, res) => res.status(200).json({ route: 'listPermissions', guards: req.guards }),
      grantPermission: (req, res) => res.status(201).json({ route: 'grantPermission', guards: req.guards }),
      removePermission: (req, res) => res.status(200).json({ route: 'removePermission', guards: req.guards }),
      getLatestFirmware: (req, res) => res.status(200).json({ route: 'getLatestFirmware', guards: req.guards }),
      updateOption: (req, res) => res.status(200).json({ route: 'updateOption', guards: req.guards })
    }));
    jest.mock('../../server/controllers/firmwares', () => ({
      listByModel: (req, res) => res.status(200).json({ route: 'listByModel', guards: req.guards }),
      add: (req, res) => res.status(201).json({ route: 'firmwareAdd', guards: req.guards }),
      get: (req, res) => res.status(200).json({ route: 'firmwareGet', guards: req.guards }),
      delete: (req, res) => res.status(200).json({ route: 'firmwareDelete', guards: req.guards }),
      updateRelease: (req, res) => res.status(200).json({ route: 'firmwareUpdateRelease', guards: req.guards })
    }));
    jest.mock('../../server/controllers/sensorsTemplate', () => ({
      list: (req, res) => res.status(200).json({ route: 'sensorTemplate.list', guards: req.guards }),
      delete: (req, res) => res.status(200).json({ route: 'sensorTemplate.delete', guards: req.guards }),
      update: (req, res) => res.status(200).json({ route: 'sensorTemplate.update', guards: req.guards }),
      add: (req, res) => res.status(201).json({ route: 'sensorTemplate.add', guards: req.guards }),
      propagate: (req, res) => res.status(200).json({ route: 'sensorTemplate.propagate', guards: req.guards })
    }));
    jest.mock('../../server/controllers/variants', () => ({
      get: (req, res) => res.status(200).json({ route: 'variant.get', guards: req.guards, variant_id: req.params.variant_id }),
      add: (req, res) => res.status(201).json({ route: 'variant.add', guards: req.guards }),
      delete: (req, res) => res.status(200).json({ route: 'variant.delete', guards: req.guards }),
      update: (req, res) => res.status(200).json({ route: 'variant.update', guards: req.guards }),
      list: (req, res) => res.status(200).json({ route: 'variant.list', guards: req.guards }),
      listByModel: (req, res) => res.status(200).json({ route: 'variant.listByModel', guards: req.guards })
    }));
    jest.mock('multer', () => {
      const multerMock = () => ({
        single: () => (req, res, next) => {
          req.file = { originalname: 'test.bin' };
          next();
        }
      });
      multerMock.diskStorage = jest.fn(() => ({}));
      multerMock.MulterError = class MulterError extends Error {};
      return multerMock;
    });

    const router = require('../../server/routes/models');
    app = express();
    app.use(express.json());
    app.use('/model', router);
  });

  it('DELETE /model/:model_id uses delete handler', async () => {
    const res = await request(app).delete('/model/10');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('delete');
    expect(res.body.guards).toContain('modelAccess');
  });

  it('PUT /model/:model_id uses update handler', async () => {
    const res = await request(app).put('/model/10').send({ name: 'test' });
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('update');
  });

  it('GET /model/:model_id/permissions uses listPermissions handler', async () => {
    const res = await request(app).get('/model/10/permissions');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('listPermissions');
  });

  it('POST /model/:model_id/permissions uses grantPermission handler', async () => {
    const res = await request(app).post('/model/10/permissions').send({});
    expect(res.status).toBe(201);
    expect(res.body.route).toBe('grantPermission');
  });

  it('DELETE /model/:model_id/permissions uses removePermission handler', async () => {
    const res = await request(app).delete('/model/10/permissions');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('removePermission');
  });

  it('GET /model/:model_id/firmwares uses firmware listByModel handler', async () => {
    const res = await request(app).get('/model/10/firmwares');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('listByModel');
  });

  it('GET /model/:model_id/firmware uses firmware get handler', async () => {
    const res = await request(app).get('/model/10/firmware');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('firmwareGet');
  });

  it('DELETE /model/:model_id/firmware uses firmware delete handler', async () => {
    const res = await request(app).delete('/model/10/firmware');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('firmwareDelete');
  });

  it('PUT /model/:model_id/firmware uses firmware updateRelease handler', async () => {
    const res = await request(app).put('/model/10/firmware').send({});
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('firmwareUpdateRelease');
  });

  it('GET /model/:model_id/firmware/latest uses getLatestFirmware handler', async () => {
    const res = await request(app).get('/model/10/firmware/latest');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('getLatestFirmware');
  });

  it('DELETE /model/:model_id/sensor uses sensorTemplate delete handler', async () => {
    const res = await request(app).delete('/model/10/sensor');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('sensorTemplate.delete');
  });

  it('PUT /model/:model_id/sensor uses sensorTemplate update handler', async () => {
    const res = await request(app).put('/model/10/sensor').send({});
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('sensorTemplate.update');
  });

  it('POST /model/:model_id/sensor uses sensorTemplate add handler', async () => {
    const res = await request(app).post('/model/10/sensor').send({});
    expect(res.status).toBe(201);
    expect(res.body.route).toBe('sensorTemplate.add');
  });

  it('POST /model/:model_id/sensor/propagate uses sensorTemplate propagate handler', async () => {
    const res = await request(app).post('/model/10/sensor/propagate').send({});
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('sensorTemplate.propagate');
  });

  it('PUT /model/:model_id/option uses updateOption handler', async () => {
    const res = await request(app).put('/model/10/option').send({});
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('updateOption');
  });

  it('GET /model/:model_id/variants uses variant listByModel handler', async () => {
    const res = await request(app).get('/model/10/variants');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('variant.listByModel');
  });

  it('POST /model/:model_id/variants uses variant add handler', async () => {
    const res = await request(app).post('/model/10/variants').send({});
    expect(res.status).toBe(201);
    expect(res.body.route).toBe('variant.add');
  });

  it('GET /model/:model_id/variant/:variant_id uses variant get handler', async () => {
    const res = await request(app).get('/model/10/variant/3');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('variant.get');
    expect(res.body.variant_id).toBe('3');
  });

  it('DELETE /model/:model_id/variant/:variant_id uses variant delete handler', async () => {
    const res = await request(app).delete('/model/10/variant/3');
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('variant.delete');
  });

  it('PUT /model/:model_id/variant/:variant_id uses variant update handler', async () => {
    const res = await request(app).put('/model/10/variant/3').send({});
    expect(res.status).toBe(200);
    expect(res.body.route).toBe('variant.update');
  });
});
