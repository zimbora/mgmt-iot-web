jest.mock('mysql2', () => ({
  format: jest.fn((query) => query)
}));

const mockDb = {
  queryRow: jest.fn()
};

jest.mock('../../server/controllers/db', () => mockDb);

describe('server/models/clients device access checks', () => {
  const Client = require('../../server/models/clients');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('checkDeviceReadAccess requires a device permission for non-admin users', async () => {
    mockDb.queryRow.mockResolvedValueOnce([]);

    await new Promise((resolve) => {
      Client.checkDeviceReadAccess(10, 1, 25, (err, access) => {
        expect(err).toBeNull();
        expect(access).toBe(false);
        resolve();
      });
    });

    expect(mockDb.queryRow).toHaveBeenCalled();
  });

  it('checkDeviceWriteAccess requires write-level device permission for non-admin users', async () => {
    mockDb.queryRow.mockResolvedValueOnce([]);

    await new Promise((resolve) => {
      Client.checkDeviceWriteAccess(10, 2, 25, (err, access) => {
        expect(err).toBeNull();
        expect(access).toBe(false);
        resolve();
      });
    });

    expect(mockDb.queryRow).toHaveBeenCalled();
  });

  it('checkDevicePermissionsAccess requires owner-level device permission for non-admin users', async () => {
    mockDb.queryRow.mockResolvedValueOnce([]);

    await new Promise((resolve) => {
      Client.checkDevicePermissionsAccess(10, 3, 25, (err, access) => {
        expect(err).toBeNull();
        expect(access).toBe(false);
        resolve();
      });
    });

    expect(mockDb.queryRow).toHaveBeenCalled();
  });

  it('device access checks still allow admin-level users without querying permissions', async () => {
    await new Promise((resolve) => {
      Client.checkDeviceReadAccess(10, 4, 25, (err, access) => {
        expect(err).toBeNull();
        expect(access).toBe(true);
        resolve();
      });
    });

    expect(mockDb.queryRow).not.toHaveBeenCalled();
  });
});
