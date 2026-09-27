jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

const fs = require('fs');
const storage = require('../../server/utils/firmwareStorage');

describe('server/utils/firmwareStorage', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.FIRMWARES_PATH;
    delete process.env.NODE_ENV;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('prefers configured firmware path when provided', () => {
    process.env.FIRMWARES_PATH = '/custom/firmwares';

    expect(storage.getFirmwareDirectory()).toBe('/custom/firmwares');
  });

  it('uses docker firmware directory when it exists even outside docker node env naming', () => {
    process.env.NODE_ENV = 'staging';
    fs.existsSync.mockImplementation((targetPath) => targetPath === storage.DOCKER_FIRMWARE_DIR);

    expect(storage.getFirmwareDirectory()).toBe(storage.DOCKER_FIRMWARE_DIR);
  });

  it('falls back to local firmware directory when docker directory is unavailable', () => {
    fs.existsSync.mockReturnValue(false);

    expect(storage.getFirmwareDirectory()).toBe(storage.LOCAL_FIRMWARE_DIR);
  });

  it('creates the selected directory when it is missing', () => {
    fs.existsSync.mockReturnValue(false);

    const result = storage.ensureFirmwareDirectory();

    expect(result).toBe(storage.LOCAL_FIRMWARE_DIR);
    expect(fs.mkdirSync).toHaveBeenCalledWith(storage.LOCAL_FIRMWARE_DIR, { recursive: true });
  });

  it('rejects firmware filenames with path separators', () => {
    expect(() => storage.getFirmwarePath('../fw.bin')).toThrow(storage.invalidFilenameError);
    expect(() => storage.getFirmwarePath('..\\fw.bin')).toThrow(storage.invalidFilenameError);
  });
});
