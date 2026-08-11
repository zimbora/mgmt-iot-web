jest.mock('../../server/controllers/db', () => ({
  insert: jest.fn(async () => ({ insertId: 1, affectedRows: 1 })),
  queryRow: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
}));

const db = require('../../server/controllers/db');
const sensors = require('../../server/models/sensors');

describe('server/models/sensors add active propagation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores active when provided', async () => {
    await new Promise((resolve) => {
      sensors.add(9, 11, 'r', 'n', 't', 'p', true, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(db.insert).toHaveBeenCalledWith('sensors', expect.objectContaining({
      model_id: 9,
      device_id: 11,
      ref: 'r',
      name: 'n',
      type: 't',
      property: 'p',
      active: true
    }));
  });

  it('keeps backward compatible callback signature when active is omitted', async () => {
    await new Promise((resolve) => {
      sensors.add(9, 11, 'r', 'n', 't', 'p', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    const insertObj = db.insert.mock.calls[0][1];
    expect(Object.prototype.hasOwnProperty.call(insertObj, 'active')).toBe(false);
  });
});

describe('server/models/sensors add graph propagation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores active when provided', async () => {
    await new Promise((resolve) => {
      sensors.add(9, 11, 'r', 'n', 't', 'p', true, { type: 'linear' }, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(db.insert).toHaveBeenCalledWith('sensors', expect.objectContaining({
      model_id: 9,
      device_id: 11,
      ref: 'r',
      name: 'n',
      type: 't',
      property: 'p',
      active: true,
      graph: { type : 'linear'}
    }));
  });

  it('keeps backward compatible callback signature when active is omitted', async () => {
    await new Promise((resolve) => {
      sensors.add(9, 11, 'r', 'n', 't', 'p', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    const insertObj = db.insert.mock.calls[0][1];
    expect(Object.prototype.hasOwnProperty.call(insertObj, 'active')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(insertObj, 'graph')).toBe(false);
  });
});