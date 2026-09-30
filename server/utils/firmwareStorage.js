const fs = require('fs');
const path = require('path');

const DOCKER_FIRMWARE_DIR = '/mgmt-iot/devices/firmwares';
const LOCAL_FIRMWARE_DIR = path.join(__dirname, '../public/firmwares');
const invalidFilenameError = 'Invalid firmware filename.';

const normalizeFirmwareFilename = (filename) => {
  if (typeof filename !== 'string' || filename.length === 0) {
    throw new Error(invalidFilenameError);
  }

  if (filename.includes('/') || filename.includes('\\') || filename === '.' || filename === '..') {
    throw new Error(invalidFilenameError);
  }

  return filename;
};

const getFirmwareDirectory = () => {
  const configuredPath = process.env.FIRMWARES_PATH?.trim();

  if (configuredPath) {
    return configuredPath;
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

const getFirmwarePath = (filename) => path.join(getFirmwareDirectory(), normalizeFirmwareFilename(filename));

module.exports = {
  DOCKER_FIRMWARE_DIR,
  LOCAL_FIRMWARE_DIR,
  ensureFirmwareDirectory,
  getFirmwareDirectory,
  getFirmwarePath,
  invalidFilenameError,
  normalizeFirmwareFilename
};
