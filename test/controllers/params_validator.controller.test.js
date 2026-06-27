const { body, params } = require('../../server/controllers/params_validator');

describe('server/controllers/params_validator', () => {
  it('body() passes when required params and types match', () => {
    const middleware = body([
      { param_key: 'name', type: 'string', required: true }
    ]);

    const req = { body: { name: 'ok' } };
    const res = { send: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  it('body() fails when required param is missing', () => {
    const middleware = body([
      { param_key: 'name', type: 'string', required: true }
    ]);

    const req = { body: {} };
    const res = { send: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.send).toHaveBeenCalledWith(400, expect.objectContaining({ status: 400 }));
    expect(next).not.toHaveBeenCalled();
  });

  it('params() fails when type is invalid', () => {
    const middleware = params([
      { param_key: 'id', type: 'number', required: true, validator_functions: [] }
    ]);

    const req = { params: { id: '1' } };
    const res = { send: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.send).toHaveBeenCalledWith(400, expect.objectContaining({ status: 400 }));
    expect(next).not.toHaveBeenCalled();
  });

  it('params() runs validators and fails when validator returns false', () => {
    const middleware = params([
      { param_key: 'id', type: 'number', required: true, validator_functions: [() => false] }
    ]);

    const req = { params: { id: 1 } };
    const res = { send: jest.fn() };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.send).toHaveBeenCalledWith(400, expect.objectContaining({ status: 400 }));
    expect(next).not.toHaveBeenCalled();
  });
});
