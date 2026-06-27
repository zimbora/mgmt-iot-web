const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/auth', () => ({
  authenticate: (req, res, next) => {
    req.steps = ['authenticate'];
    next();
  },
  generateToken: (req, res, next) => {
    req.steps.push('generateToken');
    next();
  },
  respondJWT: (req, res) => {
    req.steps.push('respondJWT');
    res.status(200).json({ ok: true, steps: req.steps });
  }
}));

describe('server/routes/auth', () => {
  let app;

  beforeEach(() => {
    const router = require('../../server/routes/auth');
    app = express();
    app.use(express.json());
    app.use('/auth', router);
  });

  it('POST /auth/token runs auth middleware chain', async () => {
    const response = await request(app)
      .post('/auth/token')
      .send({ user: 'demo', password: 'demo' });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
    expect(response.body.steps).toEqual([
      'authenticate',
      'generateToken',
      'respondJWT'
    ]);
  });
});
