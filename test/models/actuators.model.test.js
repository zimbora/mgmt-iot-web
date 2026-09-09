jest.mock('../../server/controllers/db', () => ({
  insert: jest.fn(async () => ({ insertId: 1, affectedRows: 1 })),
  queryRow: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const db = require('../../server/controllers/db');
const actuators = require('../../server/models/actuators');

describe('server/models/actuators add', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores active when provided', async () => {
    await new Promise((resolve) => {
      actuators.add(9, 11, 'r', 'n', 'switch', 'p', true, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(db.insert).toHaveBeenCalledWith('actuators', expect.objectContaining({
      model_id: 9,
      device_id: 11,
      ref: 'r',
      name: 'n',
      type: 'switch',
      property: 'p',
      active: true
    }));
  });

  it('keeps backward compatible callback signature when active is omitted', async () => {
    await new Promise((resolve) => {
      actuators.add(9, 11, 'r', 'n', 'switch', 'p', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    const insertObj = db.insert.mock.calls[0][1];
    expect(Object.prototype.hasOwnProperty.call(insertObj, 'active')).toBe(false);
  });

  it('defaults value to 1 for set type', async () => {
    await new Promise((resolve) => {
      actuators.add(9, 11, 'r', 'n', 'set', 'p', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    const insertObj = db.insert.mock.calls[0][1];
    expect(insertObj.value).toBe(1);
  });

  it('leaves value null for other types when not provided', async () => {
    await new Promise((resolve) => {
      actuators.add(9, 11, 'r', 'n', 'number', 'p', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    const insertObj = db.insert.mock.calls[0][1];
    expect(insertObj.value).toBeNull();
  });

  it('stores graph when provided', async () => {
    await new Promise((resolve) => {
      actuators.add(9, 11, 'r', 'n', 'switch', 'p', true, { type: 'linear' }, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(db.insert).toHaveBeenCalledWith('actuators', expect.objectContaining({
      active: true,
      graph: { type: 'linear' }
    }));
  });
});

describe('server/models/actuators validateValue', () => {
  it('rejects unknown types', () => {
    expect(actuators.validateValue('unknown', 1)).toMatch(/invalid type/);
  });

  it('accepts 0/1 for switch', () => {
    expect(actuators.validateValue('switch', 0)).toBeNull();
    expect(actuators.validateValue('switch', 1)).toBeNull();
    expect(actuators.validateValue('switch', '0')).toBeNull();
    expect(actuators.validateValue('switch', '1')).toBeNull();
  });

  it('rejects non 0/1 for switch', () => {
    expect(actuators.validateValue('switch', 2)).toMatch(/0 or 1/);
    expect(actuators.validateValue('switch', 'on')).toMatch(/0 or 1/);
  });

  it('accepts any numeric value for number', () => {
    expect(actuators.validateValue('number', 12.5)).toBeNull();
    expect(actuators.validateValue('number', '42')).toBeNull();
  });

  it('rejects non numeric value for number', () => {
    expect(actuators.validateValue('number', 'abc')).toMatch(/numeric/);
  });

  it('accepts any string value for text', () => {
    expect(actuators.validateValue('text', 'hello world')).toBeNull();
  });

  it('rejects non string value for text', () => {
    expect(actuators.validateValue('text', 123)).toMatch(/string/);
  });

  it('accepts valid json for json', () => {
    expect(actuators.validateValue('json', '{"a":1}')).toBeNull();
    expect(actuators.validateValue('json', { a: 1 })).toBeNull();
  });

  it('rejects invalid json for json', () => {
    expect(actuators.validateValue('json', '{a:1}')).toMatch(/json/);
  });

  it('accepts any value for set', () => {
    expect(actuators.validateValue('set', 1)).toBeNull();
  });
});

describe('server/models/actuators getById', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error when id is missing', async () => {
    await new Promise((resolve) => {
      actuators.getById(null, (err, row) => {
        expect(err).toBe('id is null');
        expect(row).toBeNull();
        resolve();
      });
    });
  });

  it('returns first row found', async () => {
    db.queryRow.mockResolvedValue([{ id: 1, type: 'switch' }]);

    await new Promise((resolve) => {
      actuators.getById(1, (err, row) => {
        expect(err).toBeNull();
        expect(row).toEqual({ id: 1, type: 'switch' });
        resolve();
      });
    });
  });
});
