const httpStatus = require('http-status-codes');
const response = require('../../server/controllers/response');

describe('server/controllers/response', () => {
  it('send() returns success envelope', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json };

    response.send(res, { id: 1 });

    expect(status).toHaveBeenCalledWith(httpStatus.OK);
    expect(json).toHaveBeenCalledWith({
      Error: false,
      Message: 'Success',
      Result: { id: 1 }
    });
  });

  it('error() returns error envelope', () => {
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json };

    response.error(res, httpStatus.BAD_REQUEST, 'Invalid');

    expect(status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      Error: true,
      Message: 'Invalid',
      Result: null
    });
  });
});
