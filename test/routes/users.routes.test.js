const express = require('express');
const request = require('supertest');

describe('server/routes/users', () => {
  let app;

  beforeEach(() => {
    global.log = {
      debug: jest.fn(),
      trace: jest.fn(),
      info: jest.fn(),
      error: jest.fn()
    };

    const router = require('../../server/routes/users');
    app = express();
    app.use('/user', router);
    app.use((req, res) => res.status(404).json({ ok: false }));
  });

  it('runs users middleware on unmatched route', async () => {
    const response = await request(app).get('/user/any-path');

    expect(response.status).toBe(404);
    expect(global.log.debug).toHaveBeenCalledWith('users route');
  });
});
