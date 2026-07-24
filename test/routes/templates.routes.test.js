const express = require('express');
const request = require('supertest');

jest.mock('../../server/controllers/templates', () => {
  const handlers = {
    getObjects: (req, res) => res.status(200).json({ route: 'getObjects', templateId: req.params.template_id }),
    addObject: (req, res) => res.status(201).json({ route: 'addObject', templateId: req.params.template_id }),
    getMqttTopics: (req, res) => res.status(200).json({ route: 'getMqttTopics', templateId: req.params.template_id }),
    deleteMqttTopic: (req, res) => res.status(200).json({ route: 'deleteMqttTopic', templateId: req.params.template_id, entryId: req.params.entry_id }),
    list: (req, res) => res.status(200).json({ route: 'list' })
  };

  return new Proxy(handlers, {
    get(target, property) {
      if (!(property in target)) {
        target[property] = (req, res) => {
          res.status(200).json({ route: String(property), templateId: req.params.template_id });
        };
      }
      return target[property];
    }
  });
});

describe('server/routes/templates', () => {
  let app;

  beforeEach(() => {
    const router = require('../../server/routes/templates');
    app = express();
    app.use(express.json());
    app.use('/template', router);
  });

  it('GET /template/:template_id/lwm2m/objects returns objects', async () => {
    const response = await request(app).get('/template/9/lwm2m/objects');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('getObjects');
    expect(response.body.templateId).toBe('9');
  });

  it('POST /template/:template_id/lwm2m/object adds object', async () => {
    const response = await request(app).post('/template/9/lwm2m/object').send({ object_id: 3 });

    expect(response.status).toBe(201);
    expect(response.body.route).toBe('addObject');
    expect(response.body.templateId).toBe('9');
  });

  it('DELETE /template/:template_id/mqtt/topic/:entry_id deletes topic', async () => {
    const response = await request(app).delete('/template/9/mqtt/topic/99');

    expect(response.status).toBe(200);
    expect(response.body.route).toBe('deleteMqttTopic');
    expect(response.body.templateId).toBe('9');
    expect(response.body.entryId).toBe('99');
  });
});
