const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/models', () => ({
  checkAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'modelAccess'];
    next();
  },
  get: (req, res) => res.status(200).json({ route: 'get', guards: req.guards, modelId: req.params.model_id }),
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
  add: (req, res) => res.status(201).json({ route: 'add', guards: req.guards }),
  get: (req, res) => res.status(200).json({ route: 'get', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'delete', guards: req.guards }),
  updateRelease: (req, res) => res.status(200).json({ route: 'updateRelease', guards: req.guards })
}));

jest.mock('../../server/controllers/sensorsTemplate', () => ({
  list: (req, res) => res.status(200).json({ route: 'sensorTemplate.list', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'sensorTemplate.delete', guards: req.guards }),
  update: (req, res) => res.status(200).json({ route: 'sensorTemplate.update', guards: req.guards }),
  add: (req, res) => res.status(201).json({ route: 'sensorTemplate.add', guards: req.guards }),
  propagate: (req, res) => res.status(200).json({ route: 'sensorTemplate.propagate', guards: req.guards })
}));

describe('server/routes/models', () => {
  let app;

  beforeEach(() => {
    const router = require('../../server/routes/models');
    app = express();
    app.use(express.json());
    app.use('/model', router);
  });

  it('GET /model/:model_id enforces model access middleware', async () => {
    const response = await request(app).get('/model/55');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('get');
    expect(response.body.guards).toEqual(['modelAccess']);
    expect(response.body.modelId).toBe('55');
  });

  it('GET /model/:model_id/sensors uses sensor template list handler', async () => {
    const response = await request(app).get('/model/55/sensors');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('sensorTemplate.list');
    expect(response.body.guards).toEqual(['modelAccess']);
  });
});
