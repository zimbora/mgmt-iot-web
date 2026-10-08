const fs = require('fs');
const path = require('path');

const DOCKER_FIRMWARE_DIR = '/mgmt-iot/devices/firmwares';
const LOCAL_FIRMWARE_DIR = path.join(__dirname, '../public/firmwares');
const invalidFilenameError = 'Invalid firmware filename.';

const normalizeFirmwareFilename = (filename) => {
  if (typeof filename !== 'string' || filename.length === 0) {
    throw new Error(invalidFilenameError);
  }

  if (filename.includes('/') || filename.includes('\\') || filename.includes('\0') || filename.trim() !== filename || filename === '.' || filename === '..') {
    throw new Error(invalidFilenameError);
  }

  return filename;
};

const isAllowedFirmwareDirectory = (directory) => {
  if (typeof directory !== 'string' || directory.trim().length === 0) {
    return false;
  }

  const trimmedDirectory = directory.trim();
  return path.isAbsolute(trimmedDirectory) && !trimmedDirectory.startsWith('.') && !trimmedDirectory.includes('\0');
};

const getFirmwareDirectory = () => {
  const configuredPath = process.env.FIRMWARES_PATH?.trim();

  if (configuredPath && isAllowedFirmwareDirectory(configuredPath)) {
    return path.resolve(configuredPath);
  }

  if (fs.existsSync(DOCKER_FIRMWARE_DIR)) {
    return DOCKER_FIRMWARE_DIR;
  }

  return LOCAL_FIRMWARE_DIR;
};

const ensureFirmwareDirectory = () => {
  const firmwareDirectory = getFirmwareDirectory();

  if (!fs.existsSync(firmwareDirectory)) {
    fs.mkdirSync(firmwareDirectory, { recursive: true });
  }

  return firmwareDirectory;
};

const getFirmwarePath = (filename) => {
  const firmwareDirectory = path.resolve(getFirmwareDirectory());
  const normalizedFilename = normalizeFirmwareFilename(filename);
  const filePath = path.resolve(firmwareDirectory, normalizedFilename);
  const relativePath = path.relative(firmwareDirectory, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(invalidFilenameError);
  }

  return filePath;
};

module.exports = {
  DOCKER_FIRMWARE_DIR,
  LOCAL_FIRMWARE_DIR,
  ensureFirmwareDirectory,
  getFirmwareDirectory,
  getFirmwarePath,
  invalidFilenameError,
  normalizeFirmwareFilename
};
