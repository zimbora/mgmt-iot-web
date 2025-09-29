-- freeRTOS Template Database Schema
-- This table stores MQTT topic templates for freeRTOS2 projects

CREATE TABLE IF NOT EXISTS `freeRTOSTemplate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `description` TEXT,
  `defaultData` TEXT,
  `publishInterval` int(11) DEFAULT 0,
  `createdAt` datetime DEFAULT NULL,
  `updatedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `topic` (`topic`),
  CONSTRAINT `fk_freertos_template_id` 
    FOREIGN KEY (`template_id`) 
    REFERENCES `templates` (`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Example data for demonstration
-- INSERT INTO `freeRTOSTemplate` (`template_id`, `topic`, `description`, `defaultData`, `publishInterval`, `createdAt`, `updatedAt`) VALUES
-- (1, 'sensors/temperature', '{"attributes":{"type":"float","title":"Temperature Sensor","readable":true,"writable":false}}', '{"value":25.0}', 30, NOW(), NOW()),
-- (1, 'sensors/humidity', '{"attributes":{"type":"float","title":"Humidity Sensor","readable":true,"writable":false}}', '{"value":60.0}', 30, NOW(), NOW()),
-- (1, 'status/online', '{"attributes":{"type":"boolean","title":"Device Online Status","readable":true,"writable":false}}', '{"value":true}', 60, NOW(), NOW()),
-- (1, 'config/interval', '{"attributes":{"type":"integer","title":"Measurement Interval","readable":true,"writable":true}}', '{"value":30}', 0, NOW(), NOW());