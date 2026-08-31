const mockDb = {
  insert: jest.fn(async () => ({ insertId: 1, affectedRows: 1 })),
  update: jest.fn(async () => ({ affectedRows: 1 })),
  queryRow: jest.fn(),
  delete: jest.fn()
};

jest.mock('../../server/controllers/db', () => mockDb);

const mockUtcFormat = jest.fn(() => 'UTC_TS');
const mockUtc = jest.fn(() => ({ format: mockUtcFormat }));

const mockMoment = Object.assign(jest.fn(() => ({ format: jest.fn(() => 'LOCAL_TS') })), {
  utc: mockUtc
});

jest.mock('moment', () => mockMoment);

const templates = require('../../server/models/templates');

describe('server/models/templates UTC timestamps', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUtcFormat.mockReturnValue('UTC_TS');
  });

  it('add() stores createdAt/updatedAt in UTC', async () => {
    await new Promise((resolve) => {
      templates.add('tag', 'name', 1, 2, (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(mockUtc).toHaveBeenCalledTimes(2);
    expect(mockDb.insert).toHaveBeenCalledWith('templates', expect.objectContaining({
      createdAt: 'UTC_TS',
      updatedAt: 'UTC_TS'
    }));
  });

  it('update() stores updatedAt in UTC', async () => {
    await new Promise((resolve) => {
      templates.update(10, 'tag', 'name', (err) => {
        expect(err).toBeNull();
        resolve();
      });
    });

    expect(mockUtc).toHaveBeenCalledTimes(1);
    expect(mockDb.update).toHaveBeenCalledWith(
      'templates',
      expect.objectContaining({ updatedAt: 'UTC_TS' }),
      { id: 10 }
    );
  });
});
