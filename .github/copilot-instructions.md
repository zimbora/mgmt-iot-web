# Copilot Instructions for mgmt-iot-web

## Project Overview

`mgmt-iot-web` is an IoT device management web platform that enables configuration and interaction with IoT devices (primarily ESP32-based). It provides firmware management, device monitoring, MQTT integration, and client/user management.

## Database Schema

The database is MySQL 8. The canonical schema definitions are maintained in the [`mqtt-devices-parser`](https://github.com/zimbora/mqtt-devices-parser) repository under the `models/` folder. Below is a summary of all tables and their columns.

### `users`
| Column     | Type        | Notes                        |
|------------|-------------|------------------------------|
| id         | INT (PK)    | auto-increment               |
| type       | VARCHAR(32) | unique                       |
| password   | STRING      |                              |
| level      | INT         | access level                 |
| createdAt  | DATETIME    |                              |
| updatedAt  | DATETIME    |                              |

### `clients`
| Column         | Type        | Notes                        |
|----------------|-------------|------------------------------|
| id             | INT (PK)    | auto-increment               |
| user_id        | INT         | FK → users.id                |
| nick           | VARCHAR(64) | unique                       |
| token          | STRING      | nullable                     |
| api_token      | STRING      | nullable                     |
| mqtt_password  | VARCHAR(24) | nullable                     |
| gmail          | VARCHAR(64) | nullable                     |
| name           | STRING      | nullable                     |
| avatar         | STRING      | nullable                     |
| createdAt      | DATETIME    |                              |
| updatedAt      | DATETIME    |                              |

### `projects`
| Column        | Type    | Notes        |
|---------------|---------|--------------|
| id            | INT (PK)| auto-increment|
| name          | STRING  | unique       |
| description   | STRING  |              |
| project_table | STRING  | nullable     |
| logs_table    | STRING  | nullable     |
| uidPrefix     | STRING  |              |
| uidLength     | INT     |              |
| createdAt     | DATETIME|              |
| updatedAt     | DATETIME|              |

### `models`
| Column           | Type    | Notes                         |
|------------------|---------|-------------------------------|
| id               | INT (PK)| auto-increment                |
| name             | STRING  | unique                        |
| description      | STRING  |                               |
| model_table      | STRING  | nullable, deprecated          |
| logs_table       | STRING  | nullable, deprecated          |
| project_id       | INT     | not null                      |
| fw_enabled       | BOOLEAN | default false                 |
| ar_enabled       | BOOLEAN | default false                 |
| alarms_enabled   | BOOLEAN | default false                 |
| js_code_enabled  | BOOLEAN | default false                 |
| createdAt        | DATETIME|                               |
| updatedAt        | DATETIME|                               |

### `variants`
| Column      | Type    | Notes                     |
|-------------|---------|---------------------------|
| id          | INT (PK)| auto-increment            |
| name        | STRING  | unique                    |
| model_id    | INT     | FK → models.id            |
| description | STRING  | nullable                  |
| createdAt   | DATETIME|                           |
| updatedAt   | DATETIME|                           |

### `devices`
| Column           | Type    | Notes                          |
|------------------|---------|--------------------------------|
| id               | INT (PK)| auto-increment                 |
| uid              | STRING  | unique                         |
| name             | STRING  | nullable                       |
| status           | STRING  | nullable                       |
| project_id       | INT     | FK → projects.id               |
| template_id      | INT     | nullable                       |
| model_id         | INT     | FK → models.id                 |
| variant_id       | INT     | FK → variants.id               |
| version          | STRING  | nullable, current fw version   |
| app_version      | STRING  | nullable                       |
| accept_release   | STRING  | nullable (dev/beta/stable/critical) |
| tech             | STRING  | nullable                       |
| remote_settings  | JSON    | nullable, device settings      |
| local_settings   | JSON    | nullable, server settings      |
| settings_ref     | STRING  | nullable                       |
| associatedDevice | INT     | nullable                       |
| protocol         | STRING  | not null                       |
| psk              | STRING  | nullable, pre-shared key       |
| synch            | INT     | nullable, default 0            |
| synched          | INT     | nullable, default 0            |
| createdAt        | DATETIME|                               |
| updatedAt        | DATETIME|                               |

### `firmwares`
| Column        | Type    | Notes                          |
|---------------|---------|--------------------------------|
| id            | INT (PK)| auto-increment                 |
| filename      | STRING  | nullable, stored filename      |
| originalname  | STRING  | nullable, unique               |
| version       | STRING  | nullable, firmware version     |
| app_version   | STRING  | nullable                       |
| build_release | STRING  | nullable (dev/beta/stable/critical) |
| model_id      | INT     | FK → models.id                 |
| variant_id    | INT     | FK → variants.id, nullable     |
| token         | STRING  | nullable, SHA256 download token|
| createdAt     | DATETIME|                               |
| updatedAt     | DATETIME|                               |

> **Note**: If upgrading from an older schema that is missing the `variant_id` column, run the migration:
> `mysql/migrations/add_variant_id_to_firmwares.sql`

### `fota`
| Column              | Type    | Notes                          |
|---------------------|---------|--------------------------------|
| id                  | INT (PK)| auto-increment                 |
| device_id           | INT     | unique, FK → devices.id        |
| model_id            | INT     |                                |
| target_version      | STRING  |                                |
| target_app_version  | STRING  |                                |
| target_release      | STRING  |                                |
| firmware_id         | INT     | FK → firmwares.id              |
| nAttempts           | INT     | default 0                      |
| fUpdate             | BOOLEAN | default 0                      |
| createdAt           | DATETIME|                               |
| updatedAt           | DATETIME|                               |

### `modelPermissions`
| Column    | Type    | Notes             |
|-----------|---------|-------------------|
| id        | INT (PK)| auto-increment    |
| client_id | INT     | FK → clients.id   |
| model_id  | INT     | FK → models.id    |
| level     | INT     |                   |
| createdAt | DATETIME|                   |
| updatedAt | DATETIME|                   |

### `sensors`
| Column       | Type    | Notes                          |
|--------------|---------|--------------------------------|
| id           | INT (PK)| auto-increment                 |
| model_id     | INT     | FK → models.id, not null       |
| device_id    | INT     | FK → devices.id, not null      |
| active       | BOOLEAN | not null, default true         |
| ref          | STRING  | not null                       |
| name         | STRING  | not null                       |
| type         | STRING  | not null                       |
| property     | STRING  | nullable                       |
| value        | STRING  | nullable                       |
| error        | STRING  | nullable                       |
| remoteUnixTs | BIGINT  | nullable                       |
| graph        | JSON    | nullable                       |
| createdAt    | DATETIME|                               |
| updatedAt    | DATETIME|                               |

## Key Architecture Notes

- **Backend**: Node.js + Express, server code lives in `server/`
- **Database**: MySQL 8, raw `mysql2` queries (not an ORM)
- **Authentication**: Session-based + optional Google OAuth
- **Firmware storage**: Files saved to `server/public/firmwares/` (or `/mgmt-iot/devices/firmwares/` in Docker)
- **Tests**: Jest, run with `npm test`; test files are in `test/`
- **Routes** are in `server/routes/`, **controllers** in `server/controllers/`, **models** (DB logic) in `server/models/`

## Common Pitfalls

- When adding new columns to a table, always provide a migration SQL script in `mysql/migrations/`
- The `firmwares` table requires a `variant_id` nullable FK column (added via migration if missing)
- Firmware upload sends `multipart/form-data`; the controller reads `req.file` and `req.body`
- `build_release` is the column name for the release field in `firmwares` (not `release`)
