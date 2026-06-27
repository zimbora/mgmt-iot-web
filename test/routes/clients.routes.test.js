const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/clients', () => ({
  findGoogleClient: (req, res) => {
    res.status(200).json({ route: 'findGoogleClient' });
  },
  checkDeviceReadAccess: (req, res, next) => {
    req.guards = ['read'];
    next();
  },
  getDevices: (req, res) => {
    res.status(200).json({ route: 'getDevices', guards: req.guards, clientId: req.params.client_id });
  },
  checkDevicePermissionsAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'permissions'];
    next();
  },
  addPermission: (req, res) => {
    res.status(201).json({ route: 'addPermission', guards: req.guards, clientId: req.params.client_id });
  },
  removePermission: (req, res) => {
    res.status(200).json({ route: 'removePermission', guards: req.guards });
  },
  updatePermission: (req, res) => {
    res.status(200).json({ route: 'updatePermission', guards: req.guards });
  }
}));

describe('server/routes/clients', () => {
  let app;

  beforeEach(() => {
    const router = require('../../server/routes/clients');
    app = express();
    app.use(express.json());
    app.use('/client', router);
  });

  it('GET /client/id calls client discovery handler', async () => {
    const response = await request(app).get('/client/id');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('findGoogleClient');
  });

  it('GET /client/:client_id/devices enforces read access first', async () => {
    const response = await request(app).get('/client/42/devices');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('getDevices');
    expect(response.body.guards).toEqual(['read']);
    expect(response.body.clientId).toBe('42');
  });

  it('POST /client/:client_id/permissions enforces permissions middleware', async () => {
    const response = await request(app)
      .post('/client/77/permissions')
      .send({ user_id: 1, permissions: ['read'] });

    expect(response.status).toBe(201);
    expect(response.body.route).toBe('addPermission');
    expect(response.body.guards).toEqual(['read', 'permissions']);
    expect(response.body.clientId).toBe('77');
  });
});
