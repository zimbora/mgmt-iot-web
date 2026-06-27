jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/templates', () => ({
  getById: jest.fn((id, cb) => cb(null, {})),
  list: jest.fn((projectId, cb) => cb(null, [])),
  add: jest.fn((...args) => args[args.length - 1](null, {})),
  delete: jest.fn((id, cb) => cb(null, {})),
  update: jest.fn((...args) => args[args.length - 1](null, {}))
}));

jest.mock('../../server/models/lwm2mTemplate', () => ({
  getObjects: jest.fn((id, cb) => cb(null, [])),
  getResources: jest.fn((id, objectId, cb) => cb(null, [{ description: '{"a":1}', defaultData: '{"value":2}' }])),
  getResource: jest.fn((...args) => args[args.length - 1](null, [])),
  addObject: jest.fn((...args) => args[args.length - 1](null, {})),
  addResource: jest.fn((...args) => args[args.length - 1](null, {})),
  updateEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  deleteEntry: jest.fn((...args) => args[args.length - 1](null, {}))
}));

jest.mock('../../server/models/mqttTemplate', () => ({
  getTopics: jest.fn((id, cb) => cb(null, [])),
  addTopic: jest.fn((...args) => args[args.length - 1](null, {})),
  updateEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  deleteEntry: jest.fn((...args) => args[args.length - 1](null, {})),
  getById: jest.fn((id, cb) => cb(null, []))
}));

const response = require('../../server/controllers/response');
const mqttTemplate = require('../../server/models/mqttTemplate');
const templatesCtrl = require('../../server/controllers/templates');
const httpStatus = require('http-status-codes');
const lwm2mTemplate = require('../../server/models/lwm2mTemplate');

describe('server/controllers/templates branch coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getMqttTopic() returns bad request when template id is missing', async () => {
    const req = { params: {} };
    const res = {};

    await templatesCtrl.getMqttTopic(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID is required');
  });

  it('getMqttTopic() returns not found when model returns empty list', async () => {
    mqttTemplate.getById.mockImplementation((id, cb) => cb(null, []));

    const req = { params: { template_id: 1 } };
    const res = {};

    await templatesCtrl.getMqttTopic(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.NOT_FOUND, 'No topics found for this template');
  });

  it('getMqttTopic() returns send when topics exist', async () => {
    mqttTemplate.getById.mockImplementation((id, cb) => cb(null, [{ id: 1 }]));

    const req = { params: { template_id: 1 } };
    const res = {};

    await templatesCtrl.getMqttTopic(req, res, jest.fn());

    expect(response.send).toHaveBeenCalledWith(res, [{ id: 1 }]);
  });

  it('deleteMqttTopic() returns bad request on missing ids', async () => {
    const req = { params: {} };
    const res = {};

    await templatesCtrl.deleteMqttTopic(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, 'Template ID and Entry ID are required');
  });

  it('getMqttTopic() returns internal server error on model error', async () => {
    mqttTemplate.getById.mockImplementation((id, cb) => cb(new Error('db-error')));

    const req = { params: { template_id: 1 } };
    const res = {};

    await templatesCtrl.getMqttTopic(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
  });

  it('getResources() tolerates invalid JSON blobs', async () => {
    lwm2mTemplate.getResources.mockImplementation((id, objectId, cb) => cb(null, [{ description: 'invalid-json', defaultData: 'invalid-json' }]));

    const req = { params: { template_id: 1 }, query: {} };
    const res = {};

    await templatesCtrl.getResources(req, res, jest.fn());

    expect(response.send).toHaveBeenCalled();
  });

  it('deleteMqttTopic() returns internal server error when model fails', async () => {
    mqttTemplate.deleteEntry.mockImplementation((entryId, cb) => cb(new Error('delete-fail')));

    const req = { params: { template_id: 1, entry_id: 2 } };
    const res = {};

    await templatesCtrl.deleteMqttTopic(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
  });
});
