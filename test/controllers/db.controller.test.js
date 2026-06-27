jest.mock('mysql2', () => ({
  createPool: jest.fn(),
  format: jest.fn((query) => query)
}));

jest.mock('../../server/controllers/response', () => ({
  send: jest.fn(),
  error: jest.fn()
}));

const mysql = require('mysql2');
const response = require('../../server/controllers/response');
const httpStatus = require('http-status-codes');
const db = require('../../server/controllers/db');

const makeConnection = () => ({
  query: jest.fn(),
  ping: jest.fn((cb) => cb(null)),
  on: jest.fn(),
  destroy: jest.fn()
});

describe('server/controllers/db', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.log = {
      error: jest.fn(),
      debug: jest.fn()
    };
  });

  it('connect() initializes pool and calls callback', () => {
    const connection = makeConnection();
    const pool = { getConnection: jest.fn((cb) => cb(null, connection)) };
    mysql.createPool.mockReturnValue(pool);

    const callback = jest.fn();
    const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(() => 1);

    db.connect({ db: { conn_limit: 1, host: 'h', port: 3306, user: 'u', pwd: 'p', name: 'n' } }, callback);

    expect(mysql.createPool).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
    expect(connection.on).toHaveBeenCalledWith('error', expect.any(Function));

    setIntervalSpy.mockRestore();
  });

  it('connect() logs and exits on pool connection error', () => {
    const pool = { getConnection: jest.fn((cb) => cb(new Error('boom'), null)) };
    mysql.createPool.mockReturnValue(pool);

    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined);

    db.connect({ db: { conn_limit: 1, host: 'h', port: 3306, user: 'u', pwd: 'p', name: 'n' } }, jest.fn());

    expect(global.log.error).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('queryRow() resolves rows and closes connection', async () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, [{ id: 1 }]));

    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const rows = await db.queryRow('select 1');

    expect(rows).toEqual([{ id: 1 }]);
    expect(connection.destroy).toHaveBeenCalled();
  });

  it('queryRow() rejects when getConnection fails', async () => {
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(new Error('conn-error')));

    await expect(db.queryRow('select 1')).rejects.toBeTruthy();
  });

  it('insert() stores object values (including JSON objects)', async () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, { insertId: 10 }));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const result = await db.insert('t', { a: 1, b: { x: true } });
    expect(result).toEqual({ insertId: 10 });
  });

  it('update() runs update query for valid data and filter', async () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, { affectedRows: 1 }));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const result = await db.update('t', { a: 1 }, { id: 1 });
    expect(result).toEqual({ affectedRows: 1 });
  });

  it('insert() rejects invalid data type', async () => {
    await expect(db.insert('table', 'x')).rejects.toBe('data passed is not an object');
  });

  it('update() rejects invalid filter type', async () => {
    const connection = makeConnection();
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    await expect(db.update('table', { a: 1 }, 'x')).rejects.toBe('filter passed is not an object');
  });

  it('delete() rejects null or empty filter', async () => {
    const connection = makeConnection();
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    await expect(db.delete('table', null)).rejects.toThrow('filter passed is not an object');
    await expect(db.delete('table', {})).rejects.toThrow('Refusing to delete without a filter.');
  });

  it('delete() executes query with valid filter', async () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, { affectedRows: 1 }));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const result = await db.delete('table', { id: 1 });

    expect(result).toEqual({ affectedRows: 1 });
    expect(connection.destroy).toHaveBeenCalled();
  });

  it('tableExists() resolves true when count > 0', async () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, [{ count: 1 }]));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    await expect(db.tableExists('users')).resolves.toBe(true);
  });

  it('tableExists() rejects when table name is missing', async () => {
    await expect(db.tableExists()).rejects.toBe('Table name not specified');
  });

  it('pingMySQL() throws on ping error', () => {
    const connection = {
      ping: jest.fn((cb) => cb(new Error('ping-fail')))
    };

    expect(() => db.pingMySQL(connection)).toThrow('ping-fail');
  });

  it('getLoad() sends response payload', () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(null, [{ VARIABLE_VALUE: '10' }, { VARIABLE_VALUE: '20' }]));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const req = {};
    const res = {};

    db.getLoad(req, res, jest.fn());

    expect(response.send).toHaveBeenCalledWith(res, 30);
    expect(response.error).not.toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.anything());
  });

  it('getLoad() reports error through response.error', () => {
    const connection = makeConnection();
    connection.query.mockImplementation((query, cb) => cb(new Error('load-fail')));
    jest.spyOn(db, 'getConnection').mockImplementation((cb) => cb(null, connection));

    const req = {};
    const res = {};
    db.getLoad(req, res, jest.fn());

    expect(response.error).toHaveBeenCalledWith(res, httpStatus.INTERNAL_SERVER_ERROR, expect.any(Error));
  });
});
