-- LWM2M Template table creation script
-- This table stores LWM2M resources configuration for templates

CREATE TABLE IF NOT EXISTS lwm2mTemplate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  objectId INT NOT NULL,
  objectInstanceId INT NULL,
  resourceId INT NULL,
  description JSON NOT NULL,
  defaultData JSON NULL,
  observe INT NULL,
  readInterval INT NULL,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  INDEX idx_template_id (template_id),
  INDEX idx_object_id (objectId),
  INDEX idx_template_object (template_id, objectId)
);

-- Insert some sample data for testing (optional)
-- INSERT INTO lwm2mTemplate (template_id, objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval, createdAt, updatedAt) VALUES
-- (1, 3, 0, 1, '{"attributes": {"type": "string", "title": "Device Manufacturer", "readable": true, "writable": false, "observable": false}}', '{"value": "Example Corp"}', 0, NULL, NOW(), NOW()),
-- (1, 3, 0, 2, '{"attributes": {"type": "string", "title": "Model Number", "readable": true, "writable": false, "observable": false}}', '{"value": "EX-1000"}', 0, NULL, NOW(), NOW()),
-- (1, 3, 0, 3, '{"attributes": {"type": "string", "title": "Serial Number", "readable": true, "writable": false, "observable": false}}', '{"value": "SN123456"}', 0, NULL, NOW(), NOW());