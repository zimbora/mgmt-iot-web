jest.mock('../../server/controllers/db', () => ({
  queryRow: jest.fn()
}));

const db = require('../../server/controllers/db');
const firmwares = require('../../server/models/firmwares');

describe('server/models/firmwares - getLatestVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when variantId is not provided', async () => {
    const result = await firmwares.getLatestVersion(1, 'prod', null);
    expect(result).toBeNull();
    expect(db.queryRow).not.toHaveBeenCalled();
  });

  it('returns null when variantId is undefined', async () => {
    const result = await firmwares.getLatestVersion(1, 'prod', undefined);
    expect(result).toBeNull();
    expect(db.queryRow).not.toHaveBeenCalled();
  });

  it('does not skip query when variantId is 0', async () => {
    db.queryRow.mockResolvedValue([]);
    const result = await firmwares.getLatestVersion(1, 'prod', 0);
    expect(result).toBeNull();
    expect(db.queryRow).toHaveBeenCalled();
  });

  it('queries db with variantId filter and returns matching firmware', async () => {
    const fakeRow = { version: '1.2.3', filename: 'fw.bin', token: 'abc', id: 7 };
    db.queryRow.mockResolvedValue([fakeRow]);

    const result = await firmwares.getLatestVersion(1, 'prod', 42);
    expect(result).toEqual(fakeRow);
    expect(db.queryRow).toHaveBeenCalled();
  });

  it('returns null when no firmware matches variant_id', async () => {
    db.queryRow.mockResolvedValue([]);

    const result = await firmwares.getLatestVersion(1, 'prod', 99);
    expect(result).toBeNull();
  });
});

describe('server/models/firmwares - getLatestAppVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when variantId is not provided', async () => {
    const result = await firmwares.getLatestAppVersion(1, 'prod', null);
    expect(result).toBeNull();
    expect(db.queryRow).not.toHaveBeenCalled();
  });

  it('returns null when variantId is undefined', async () => {
    const result = await firmwares.getLatestAppVersion(1, 'prod', undefined);
    expect(result).toBeNull();
    expect(db.queryRow).not.toHaveBeenCalled();
  });

  it('does not skip query when variantId is 0', async () => {
    db.queryRow.mockResolvedValue([]);
    const result = await firmwares.getLatestAppVersion(1, 'prod', 0);
    expect(result).toBeNull();
    expect(db.queryRow).toHaveBeenCalled();
  });

  it('queries db with variantId filter and returns matching firmware', async () => {
    const fakeRow = { app_version: '2.0.0', filename: 'app.bin', token: 'xyz', id: 8 };
    db.queryRow.mockResolvedValue([fakeRow]);

    const result = await firmwares.getLatestAppVersion(1, 'prod', 42);
    expect(result).toEqual(fakeRow);
    expect(db.queryRow).toHaveBeenCalled();
  });

  it('returns null when no firmware matches variant_id', async () => {
    db.queryRow.mockResolvedValue([]);

    const result = await firmwares.getLatestAppVersion(1, 'prod', 99);
    expect(result).toBeNull();
  });
});
