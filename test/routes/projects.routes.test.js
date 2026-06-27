const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/projects', () => ({
  checkAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'projectAccess'];
    next();
  },
  get: (req, res) => res.status(200).json({ route: 'get', guards: req.guards, projectId: req.params.project_id }),
  update: (req, res) => res.status(200).json({ route: 'update', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'delete', guards: req.guards }),
  listPermissions: (req, res) => res.status(200).json({ route: 'listPermissions', guards: req.guards }),
  grantPermission: (req, res) => res.status(201).json({ route: 'grantPermission', guards: req.guards }),
  updatePermission: (req, res) => res.status(200).json({ route: 'updatePermission', guards: req.guards }),
  removePermission: (req, res) => res.status(200).json({ route: 'removePermission', guards: req.guards }),
  updateOption: (req, res) => res.status(200).json({ route: 'updateOption', guards: req.guards })
}));

jest.mock('../../server/controllers/sensors', () => ({
  list: (req, res) => res.status(200).json({ route: 'sensor.list', guards: req.guards }),
  add: (req, res) => res.status(201).json({ route: 'sensor.add', guards: req.guards }),
  update: (req, res) => res.status(200).json({ route: 'sensor.update', guards: req.guards })
}));

jest.mock('../../server/controllers/templates', () => ({
  list: (req, res) => res.status(200).json({ route: 'template.list', guards: req.guards }),
  add: (req, res) => res.status(201).json({ route: 'template.add', guards: req.guards }),
  delete: (req, res) => res.status(200).json({ route: 'template.delete', guards: req.guards })
}));

describe('server/routes/projects', () => {
  let app;

  beforeEach(() => {
    const router = require('../../server/routes/projects');
    app = express();
    app.use(express.json());
    app.use('/project', router);
  });

  it('GET /project/:project_id enforces access middleware', async () => {
    const response = await request(app).get('/project/10');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('get');
    expect(response.body.guards).toEqual(['projectAccess']);
    expect(response.body.projectId).toBe('10');
  });

  it('POST /project/:project_id/template reaches template handler with guard', async () => {
    const response = await request(app).post('/project/10/template').send({ name: 't1' });

    expect(response.status).toBe(201);
    expect(response.body.route).toBe('template.add');
    expect(response.body.guards).toEqual(['projectAccess']);
  });
});
