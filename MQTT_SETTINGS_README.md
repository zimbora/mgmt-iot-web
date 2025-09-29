# MQTT Settings Feature - Setup Instructions

## Overview
This feature adds MQTT topic management capabilities to devices, allowing users to configure and manage MQTT topics for publish/subscribe operations.

## Database Setup

Before using the MQTT Settings feature, you need to create the `mqtt_topics` table in your database.

Run the following SQL script:

```sql
-- Create mqtt_topics table
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
```

Or run the provided SQL file:
```bash
mysql -u your_username -p your_database < mysql/mqtt_topics_table.sql
```

## Features Added

### 1. API Endpoints
- `GET /api/device/:device_id/mqtt/topics` - Get all MQTT topics for a device
- `POST /api/device/:device_id/mqtt/topic` - Add a new MQTT topic
- `PUT /api/device/:device_id/mqtt/topic/:entry_id` - Update an existing MQTT topic
- `DELETE /api/device/:device_id/mqtt/topic/:entry_id` - Delete an MQTT topic

### 2. Frontend JavaScript API
New methods added to `api.device.mqtt`:
- `getMqttTopics(deviceId, cb)` - Get MQTT topics for a device
- `addTopic(deviceId, topic, cb)` - Add new MQTT topic
- `updateTopic(deviceId, entryId, topic, cb)` - Update MQTT topic
- `deleteTopic(deviceId, entryId, cb)` - Delete MQTT topic

### 3. Web Interface
- New page: `/device/:device_id/mqttSettings`
- Added "MQTT Settings" link to device sidebar navigation
- Full CRUD interface for managing MQTT topics with:
  - Topic name and path configuration
  - QoS level selection (0, 1, 2)
  - Retain flag option
  - Type selection (publish, subscribe, both)
  - Description field

### 4. Database Layer
New methods in `server/models/devices.js`:
- `getMqttTopics(deviceId, cb)`
- `addMqttTopic(deviceId, name, topic, description, qos, retain, type, cb)`
- `updateMqttTopic(entryId, topicData, cb)`
- `deleteMqttTopic(entryId, cb)`

## Usage

1. Navigate to any device page
2. Click on "MQTT Settings" in the sidebar
3. Use the interface to:
   - Add new MQTT topics with the "Add Topic" button
   - Edit existing topics by clicking the pencil icon
   - Delete topics by clicking the X icon

## Topic Configuration

Each MQTT topic can be configured with:
- **Name**: Unique identifier for the topic within the device
- **Topic**: The actual MQTT topic path (e.g., `sensors/temperature`)
- **Description**: Optional description of the topic's purpose
- **Type**: 
  - `publish` - Device publishes to this topic
  - `subscribe` - Device subscribes to this topic
  - `both` - Device can both publish and subscribe
- **QoS**: Quality of Service level (0, 1, or 2)
- **Retain**: Whether messages should be retained by the broker

## Files Modified

- `server/public/js/api.js` - Added MQTT API methods
- `server/controllers/devices.js` - Added MQTT topic controllers
- `server/models/devices.js` - Added database operations
- `server/routes/devices.js` - Added MQTT routes
- `server/public/views/pages/device/mqttSettings.ejs` - New page
- `server/public/views/partials/device/sidebar.ejs` - Added navigation link
- `express-web.js` - Added route handler
- `mysql/mqtt_topics_table.sql` - Database schema