jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

jest.mock('../../server/models/variants', () => ({
  getById: jest.fn((id, cb) => cb(null, { id })),
  add: jest.fn((name, model_id, description, cb) => cb(null, { id: 1 })),
  delete: jest.fn((id, cb) => cb(null, {})),
  update: jest.fn((id, description, cb) => cb(null, {})),
  list: jest.fn((cb) => cb(null, [])),
  listByModel: jest.fn((model_id, cb) => cb(null, []))
}));

const response = require('../../server/controllers/response');
const Variant = require('../../server/models/variants');
const variantsCtrl = require('../../server/controllers/variants');
const httpStatus = require('http-status-codes');

describe('server/controllers/variants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get()', () => {
    it('returns variant by id on success', () => {
      const req = { params: { variant_id: 5 } };
      const res = {};

      variantsCtrl.get(req, res, jest.fn());

      expect(Variant.getById).toHaveBeenCalledWith(5, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, { id: 5 });
    });

    it('returns error on model failure', () => {
      Variant.getById.mockImplementation((id, cb) => cb('db-error'));

      const req = { params: { variant_id: 5 } };
      const res = {};

      variantsCtrl.get(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'db-error');
    });
  });

  describe('add()', () => {
    it('adds variant with valid body', () => {
      const req = { body: { name: 'v1', model_id: 2, description: 'desc' } };
      const res = {};

      variantsCtrl.add(req, res, jest.fn());

      expect(Variant.add).toHaveBeenCalledWith('v1', 2, 'desc', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, { id: 1 });
    });

    it('returns validation error when name is missing', () => {
      const req = { body: { model_id: 2 } };
      const res = {};

      variantsCtrl.add(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('returns error on model failure', () => {
      Variant.add.mockImplementation((name, model_id, desc, cb) => cb('insert-error'));

      const req = { body: { name: 'v1', model_id: 2, description: '' } };
      const res = {};

      variantsCtrl.add(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'insert-error');
    });
  });

  describe('delete()', () => {
    it('deletes variant with valid params', () => {
      const req = { params: { variant_id: 3 } };
      const res = {};

      variantsCtrl.delete(req, res, jest.fn());

      expect(Variant.delete).toHaveBeenCalledWith(3, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns validation error when variant_id is missing', () => {
      const req = { params: {} };
      const res = {};

      variantsCtrl.delete(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('returns error on model failure', () => {
      Variant.delete.mockImplementation((id, cb) => cb('delete-error'));

      const req = { params: { variant_id: 3 } };
      const res = {};

      variantsCtrl.delete(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'delete-error');
    });
  });

  describe('update()', () => {
    it('updates variant with valid body', () => {
      const req = { body: { id: 1, description: 'updated' } };
      const res = {};

      variantsCtrl.update(req, res, jest.fn());

      expect(Variant.update).toHaveBeenCalledWith(1, 'updated', expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, {});
    });

    it('returns validation error when id is missing', () => {
      const req = { body: { description: 'updated' } };
      const res = {};

      variantsCtrl.update(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.BAD_REQUEST, expect.any(String));
    });

    it('returns error on model failure', () => {
      Variant.update.mockImplementation((id, desc, cb) => cb('update-error'));

      const req = { body: { id: 1, description: 'updated' } };
      const res = {};

      variantsCtrl.update(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'update-error');
    });
  });

  describe('list()', () => {
    it('returns all variants on success', () => {
      Variant.list.mockImplementation((cb) => cb(null, [{ id: 1 }, { id: 2 }]));

      const req = {};
      const res = {};

      variantsCtrl.list(req, res, jest.fn());

      expect(response.send).toHaveBeenCalledWith(res, [{ id: 1 }, { id: 2 }]);
    });

    it('returns error on model failure', () => {
      Variant.list.mockImplementation((cb) => cb('list-error'));

      const req = {};
      const res = {};

      variantsCtrl.list(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'list-error');
    });
  });

  describe('listByModel()', () => {
    it('returns variants for a model on success', () => {
      Variant.listByModel.mockImplementation((id, cb) => cb(null, [{ id: 1 }]));

      const req = { params: { model_id: 7 } };
      const res = {};

      variantsCtrl.listByModel(req, res, jest.fn());

      expect(Variant.listByModel).toHaveBeenCalledWith(7, expect.any(Function));
      expect(response.send).toHaveBeenCalledWith(res, [{ id: 1 }]);
    });

    it('returns error on model failure', () => {
      Variant.listByModel.mockImplementation((id, cb) => cb('list-error'));

      const req = { params: { model_id: 7 } };
      const res = {};

      variantsCtrl.listByModel(req, res, jest.fn());

      expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, 'list-error');
    });
  });
});
