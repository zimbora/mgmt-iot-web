-- SQL script to create mqtt_topics table for MQTT settings feature
-- Run this script to create the necessary table for MQTT topics management

CREATE TABLE IF NOT EXISTS `mqtt_topics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `topic` varchar(500) NOT NULL,
  `description` text,
  `qos` tinyint(1) NOT NULL DEFAULT 0,
  `retain` tinyint(1) NOT NULL DEFAULT 0,
  `type` enum('publish','subscribe','both') NOT NULL DEFAULT 'both',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device_name` (`device_id`, `name`),
  KEY `idx_device_id` (`device_id`),
  CONSTRAINT `fk_mqtt_topics_device_id` FOREIGN KEY (`device_id`) REFERENCES `devices` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;