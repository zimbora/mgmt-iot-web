const mockDb = {
  update: jest.fn(async () => ({ affectedRows: 1 }))
};

jest.mock('../../server/controllers/db', () => mockDb);

jest.mock('moment', () => jest.fn(() => ({
  utc: () => ({
    format: () => 'UTC_TS'
  })
})));

const mqttTemplate = require('../../server/models/mqttTemplate');

describe('server/models/mqttTemplate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updateEntry() stores localData from the localData payload', async () => {
    await new Promise((resolve, reject) => {
      mqttTemplate.updateEntry(12, {
        defaultData: { value: 'remote-value' },
        localData: { value: 'local-value' },
        synch: false
      }, (err) => {
        try {
          expect(err).toBeNull();
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    expect(mockDb.update).toHaveBeenCalledWith(
      'mqttTemplate',
      expect.objectContaining({
        defaultData: JSON.stringify({ value: 'remote-value' }),
        localData: JSON.stringify({ value: 'local-value' }),
        synch: false,
        updatedAt: 'UTC_TS'
      }),
      { id: 12 }
    );
  });
});
