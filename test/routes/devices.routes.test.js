const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/clients', () => ({
  checkDevicePermissionsAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'permissions'];
    next();
  },
  checkDeviceReadAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'read'];
    next();
  },
  checkDeviceWriteAccess: (req, res, next) => {
    req.guards = [...(req.guards || []), 'write'];
    next();
  }
}));

jest.mock('../../server/controllers/devices', () => {
  const controllers = {
    addClientPermission: (req, res) => {
      res.status(201).json({ route: 'addClientPermission', guards: req.guards || [] });
    },
    getInfo: (req, res) => {
      res.status(200).json({ route: 'getInfo', guards: req.guards || [], deviceId: req.params.device_id });
    },
    updateDeviceField: (req, res) => {
      res.status(200).json({ route: 'updateDeviceField', guards: req.guards || [], deviceId: req.params.device_id });
    },
    delete: (req, res) => {
      res.status(200).json({ route: 'delete', guards: req.guards || [], deviceId: req.params.device_id });
    }
  };

  return new Proxy(controllers, {
    get(target, property) {
      if (!(property in target)) {
        target[property] = (req, res) => {
          res.status(200).json({ route: String(property), guards: req.guards || [] });
        };
      }
      return target[property];
    }
  });
});

jest.mock('../../server/controllers/sensors', () => ({
  add: (req, res) => res.status(200).json({ route: 'sensor.add' }),
  update: (req, res) => res.status(200).json({ route: 'sensor.update' }),
  delete: (req, res) => res.status(200).json({ route: 'sensor.delete' }),
  list: (req, res) => res.status(200).json({ route: 'sensor.list' })
}));

describe('server/routes/devices', () => {
  let app;

  beforeAll(() => {
    global.log = {
      debug: jest.fn(),
      trace: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
    };
  });

  beforeEach(() => {
    const router = require('../../server/routes/devices');
    app = express();
    app.use(express.json());
    app.use('/device', router);
  });

  it('POST /device/permission calls add permission handler', async () => {
    const response = await request(app)
      .post('/device/permission')
      .send({ client_id: 1, permission: 'read' });

    expect(response.status).toBe(201);
    expect(response.body.route).toBe('addClientPermission');
    expect(response.body.guards).toEqual([]);
  });

  it('GET /device/:device_id/info uses read guard', async () => {
    const response = await request(app).get('/device/abc/info');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('getInfo');
    expect(response.body.guards).toEqual(['read']);
    expect(response.body.deviceId).toBe('abc');
  });

  it('PUT /device/:device_id/field requires read and write guards', async () => {
    const response = await request(app)
      .put('/device/abc/field')
      .send({ field: 'name', value: 'test' });

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('updateDeviceField');
    expect(response.body.guards).toEqual(['read', 'write']);
  });

  it('DELETE /device/:device_id requires read, write and permissions guards', async () => {
    const response = await request(app).delete('/device/abc');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('delete');
    expect(response.body.guards).toEqual(['read', 'write', 'permissions']);
  });
});
