jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/templates', () => ({
  getById: jest.fn((id, cb) => cb(null, { id })),
  list: jest.fn((projectId, cb) => cb(null, [])),
  add: jest.fn((...args) => args[args.length - 1](null, { id: 1 })),
  delete: jest.fn((id, cb) => cb(null, {})),
  update: jest.fn((...args) => args[args.length - 1](null, {}))
}));

jest.mock('../../server/models/lwm2mTemplate', () => ({
  getObjects: jest.fn((id, cb) => cb(null, [])),
  getResources: jest.fn((id, objectId, cb) => cb(null, [])),
  getResource: jest.fn((...args) => args[args.length - 1](null, [])),
  getById: jest.fn((id, cb) => cb(null, { id })),
  addObject: jest.fn((...args) => args[args.length - 1](null, { id: 1 })),
  addResource: jest.fn((...args) => args[args.length - 1](null, { id: 1 })),
  updateEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  deleteEntry: jest.fn((...args) => args[args.length - 1](null, {}))
}));

jest.mock('../../server/models/mqttTemplate', () => ({
  getTopics: jest.fn((id, cb) => cb(null, [])),
  addTopic: jest.fn((...args) => args[args.length - 1](null, { id: 1 })),
  updateEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  deleteEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  getById: jest.fn((id, cb) => cb(null, []))
}));

const response = require('../../server/controllers/response');
const Template = require('../../server/models/templates');
const lwm2mTemplate = require('../../server/models/lwm2mTemplate');
const mqttTemplate = require('../../server/models/mqttTemplate');
const templatesCtrl = require('../../server/controllers/templates');
const httpStatus = require('http-status-codes');

describe('server/controllers/templates – additional branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get()', () => {
    it('returns template on success', () => {
      const req = { params: { template_id: 1 } };
      const res = {};
      templatesCtrl.get(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns error on model failure', () => {
      Template.getById.mockImplementation((id, cb) => cb('db-error'));
      const req = { params: { template_id: 1 } };
      const res = {};
      templatesCtrl.get(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'db-error');
    });
  });

  describe('list()', () => {
    it('returns templates on success', () => {
      const req = { query: { projectId: 5 } };
      const res = {};
      templatesCtrl.list(req, res, jest.fn());
      expect(Template.list).toHaveBeenCalledWith(5, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, []);
    });

    it('returns error on model failure', () => {
      Template.list.mockImplementation((id, cb) => cb('list-error'));
      const req = { query: {} };
      const res = {};
      templatesCtrl.list(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'list-error');
    });
  });

  describe('add()', () => {
    it('adds template with valid body', () => {
      const req = { body: { tag: 'tag1', name: 'name1' }, user: { client_id: 10 }, params: { project_id: 3 } };
      const res = {};
      templatesCtrl.add(req, res, jest.fn());
      expect(Template.add).toHaveBeenCalledWith('tag1', 'name1', 10, 3, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns validation error on missing required fields', () => {
      const req = { body: { tag: 'tag1' }, user: { client_id: 10 }, params: {} };
      const res = {};
      templatesCtrl.add(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('returns error on model failure', () => {
      Template.add.mockImplementation((...args) => args[args.length - 1]('add-error'));
      const req = { body: { tag: 'tag1', name: 'name1' }, user: { client_id: 10 }, params: { project_id: 3 } };
      const res = {};
      templatesCtrl.add(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'add-error');
    });
  });

  describe('delete()', () => {
    it('deletes template on success', () => {
      const req = { params: { template_id: 2 } };
      const res = {};
      templatesCtrl.delete(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', () => {
      Template.delete.mockImplementation((id, cb) => cb('del-error'));
      const req = { params: { template_id: 2 } };
      const res = {};
      templatesCtrl.delete(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'del-error');
    });
  });

  describe('update()', () => {
    it('updates template with valid body', () => {
      const req = { params: { template_id: 2 }, body: { tag: 't', name: 'n' } };
      const res = {};
      templatesCtrl.update(req, res, jest.fn());
      expect(Template.update).toHaveBeenCalledWith(2, 't', 'n', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns validation error on missing fields', () => {
      const req = { params: { template_id: 2 }, body: { tag: 't' } };
      const res = {};
      templatesCtrl.update(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('returns error on model failure', () => {
      Template.update.mockImplementation((...args) => args[args.length - 1]('upd-error'));
      const req = { params: { template_id: 2 }, body: { tag: 't', name: 'n' } };
      const res = {};
      templatesCtrl.update(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'upd-error');
    });
  });

  describe('getObjects()', () => {
    it('returns bad request when template_id is missing', async () => {
      const req = { params: {} };
      const res = {};
      await templatesCtrl.getObjects(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID is required');
    });

    it('returns objects on success', async () => {
      lwm2mTemplate.getObjects.mockImplementation((id, cb) => cb(null, [{ objectId: 1 }]));
      const req = { params: { template_id: 1 } };
      const res = {};
      await templatesCtrl.getObjects(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, [{ objectId: 1 }]);
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.getObjects.mockImplementation((id, cb) => cb(new Error('obj-error')));
      const req = { params: { template_id: 1 } };
      const res = {};
      await templatesCtrl.getObjects(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('getResources()', () => {
    it('returns bad request when template_id is missing', async () => {
      const req = { params: {}, query: {} };
      const res = {};
      await templatesCtrl.getResources(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID is required');
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.getResources.mockImplementation((id, objId, cb) => cb(new Error('res-error')));
      const req = { params: { template_id: 1 }, query: {} };
      const res = {};
      await templatesCtrl.getResources(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });

    it('returns validation error for invalid objectId query', async () => {
      const req = { params: { template_id: 1 }, query: { objectId: 'abc' } };
      const res = {};
      await templatesCtrl.getResources(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });
  });

  describe('addObject()', () => {
    it('returns validation error on invalid body', async () => {
      const req = { params: { template_id: 1 }, body: {} };
      const res = {};
      await templatesCtrl.addObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('adds object on valid body', async () => {
      const req = {
        params: { template_id: 1 },
        body: {
          objectId: 3200,
          description: { attributes: { type: 'json', title: 'Temp', readable: true, writable: false, observable: true } },
          defaultData: { value: { temp: 0 } },
          observe: true,
          readInterval: 60
        }
      };
      const res = {};
      await templatesCtrl.addObject(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.addObject.mockImplementation((...args) => args[args.length - 1](new Error('add-obj-error')));
      const req = {
        params: { template_id: 1 },
        body: {
          objectId: 3200,
          observe: true,
          readInterval: 60
        }
      };
      const res = {};
      await templatesCtrl.addObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('addResource()', () => {
    it('returns validation error on invalid body', async () => {
      const req = { params: { template_id: 1 }, body: {} };
      const res = {};
      await templatesCtrl.addResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('adds resource on valid body', async () => {
      lwm2mTemplate.addResource.mockImplementation((...args) => args[args.length - 1](null, { id: 2 }));
      const req = {
        params: { template_id: 1 },
        body: {
          objectId: 3200,
          objectInstanceId: 0,
          resourceId: 5700,
          description: { attributes: { type: 'float', title: 'Sensor', readable: true, writable: false, observable: true } },
          defaultData: { value: 0 },
          observe: true,
          readInterval: 30
        }
      };
      const res = {};
      await templatesCtrl.addResource(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { id: 2 });
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.addResource.mockImplementation((...args) => args[args.length - 1](new Error('add-res-error')));
      const req = {
        params: { template_id: 1 },
        body: {
          objectId: 3200,
          objectInstanceId: 0,
          resourceId: 5700,
          description: { attributes: { type: 'float', title: 'Sensor', readable: true, writable: false, observable: true } },
          defaultData: { value: 0 },
          observe: true,
          readInterval: 30
        }
      };
      const res = {};
      await templatesCtrl.addResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('updateObject()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {}, body: {} };
      const res = {};
      await templatesCtrl.updateObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
    });

    it('returns validation error on invalid body', async () => {
      const req = { params: { template_id: 1, entry_id: 2 }, body: { observe: 'invalid' } };
      const res = {};
      await templatesCtrl.updateObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('updates object on valid body', async () => {
      const req = {
        params: { template_id: 1, entry_id: 2 },
        body: { observe: true, readInterval: 120 }
      };
      const res = {};
      await templatesCtrl.updateObject(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.updateEntry.mockImplementation((...args) => args[args.length - 1](new Error('upd-error')));
      const req = {
        params: { template_id: 1, entry_id: 2 },
        body: { observe: false, readInterval: 60 }
      };
      const res = {};
      await templatesCtrl.updateObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('updateResource()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {}, body: {} };
      const res = {};
      await templatesCtrl.updateResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
    });

    it('updates resource on valid body', async () => {
      lwm2mTemplate.updateEntry.mockImplementation((...args) => args[args.length - 1](null, {}));
      const req = {
        params: { template_id: 1, entry_id: 2 },
        body: { observe: true, readInterval: 30 }
      };
      const res = {};
      await templatesCtrl.updateResource(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });
  });

  describe('deleteObject()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {} };
      const res = {};
      await templatesCtrl.deleteObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
    });

    it('deletes object on success', async () => {
      lwm2mTemplate.deleteEntry.mockImplementation((...args) => args[args.length - 1](null, {}));
      const req = { params: { template_id: 1, entry_id: 2 } };
      const res = {};
      await templatesCtrl.deleteObject(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.deleteEntry.mockImplementation((...args) => args[args.length - 1](new Error('del-error')));
      const req = { params: { template_id: 1, entry_id: 2 } };
      const res = {};
      await templatesCtrl.deleteObject(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('deleteResource()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {} };
      const res = {};
      await templatesCtrl.deleteResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
    });

    it('deletes resource on success', async () => {
      lwm2mTemplate.deleteEntry.mockImplementation((...args) => args[args.length - 1](null, {}));
      const req = { params: { template_id: 1, entry_id: 2 } };
      const res = {};
      await templatesCtrl.deleteResource(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.deleteEntry.mockImplementation((...args) => args[args.length - 1](new Error('del-error')));
      const req = { params: { template_id: 1, entry_id: 2 } };
      const res = {};
      await templatesCtrl.deleteResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('getResource()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {} };
      const res = {};
      await templatesCtrl.getResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Resource ID are required');
    });

    it('returns resource on success', async () => {
      lwm2mTemplate.getById.mockImplementation((id, cb) => cb(null, { id: 5 }));
      const req = { params: { template_id: 1, resource_id: 5 } };
      const res = {};
      await templatesCtrl.getResource(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { id: 5 });
    });

    it('returns not found when resource is null', async () => {
      lwm2mTemplate.getById.mockImplementation((id, cb) => cb(null, null));
      const req = { params: { template_id: 1, resource_id: 5 } };
      const res = {};
      await templatesCtrl.getResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'Resource not found');
    });

    it('returns error on model failure', async () => {
      lwm2mTemplate.getById.mockImplementation((id, cb) => cb(new Error('get-error')));
      const req = { params: { template_id: 1, resource_id: 5 } };
      const res = {};
      await templatesCtrl.getResource(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('getMqttTopics()', () => {
    it('returns bad request when template_id is missing', async () => {
      const req = { params: {} };
      const res = {};
      await templatesCtrl.getMqttTopics(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID is required');
    });

    it('returns topics on success', async () => {
      mqttTemplate.getTopics.mockImplementation((id, cb) => cb(null, [{ topic: '/t' }]));
      const req = { params: { template_id: 1 } };
      const res = {};
      await templatesCtrl.getMqttTopics(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, [{ topic: '/t' }]);
    });

    it('returns error on model failure', async () => {
      mqttTemplate.getTopics.mockImplementation((id, cb) => cb(new Error('topics-error')));
      const req = { params: { template_id: 1 } };
      const res = {};
      await templatesCtrl.getMqttTopics(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('addMqttTopic()', () => {
    it('returns validation error on invalid body', async () => {
      const req = { params: { template_id: 1 }, body: {} };
      const res = {};
      await templatesCtrl.addMqttTopic(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('adds topic on valid body', async () => {
      const req = {
        params: { template_id: 1 },
        body: {
          topic: '/sensor/data',
          description: { attributes: { type: 'json', title: 'Data', readable: true, writable: false } },
          defaultData: { value: {} },
          synch: true,
          readInterval: 10
        }
      };
      const res = {};
      await templatesCtrl.addMqttTopic(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns error on model failure', async () => {
      mqttTemplate.addTopic.mockImplementation((...args) => args[args.length - 1](new Error('add-topic-error')));
      const req = {
        params: { template_id: 1 },
        body: {
          topic: '/sensor/data',
          description: { attributes: { type: 'json', title: 'Data', readable: true, writable: false } },
          synch: true
        }
      };
      const res = {};
      await templatesCtrl.addMqttTopic(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });

  describe('updateMqttTopic()', () => {
    it('returns bad request when ids are missing', async () => {
      const req = { params: {}, body: {} };
      const res = {};
      await templatesCtrl.updateMqttTopic(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
    });

    it('returns validation error on invalid body', async () => {
      const req = { params: { template_id: 1, entry_id: 2 }, body: { synch: 'invalid' } };
      const res = {};
      await templatesCtrl.updateMqttTopic(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('updates topic on valid body', async () => {
      mqttTemplate.updateEntry.mockImplementation((...args) => args[args.length - 1](null, {}));
      const req = {
        params: { template_id: 1, entry_id: 2 },
        body: {
          topic: '/updated',
          synch: false,
          description: { attributes: { type: 'string', title: 'Updated', readable: true, writable: true } }
        }
      };
      const res = {};
      await templatesCtrl.updateMqttTopic(req, res, jest.fn());
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns error on model failure', async () => {
      mqttTemplate.updateEntry.mockImplementation((...args) => args[args.length - 1](new Error('upd-topic-error')));
      const req = {
        params: { template_id: 1, entry_id: 2 },
        body: { synch: true, description: { attributes: { type: 'json', title: 'T', readable: true, writable: true } } }
      };
      const res = {};
      await templatesCtrl.updateMqttTopic(req, res, jest.fn());
      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
    });
  });
});
