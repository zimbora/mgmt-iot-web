'use strict';

/**
 * Sequelize migration to create the `logs_actuators` table.
 *
 * Every time an actuator's `value` is written (either directly through the
 * device endpoint, or triggered by a client), a row is appended here so the
 * write history can be inspected the same way sensor readings are inspected
 * through `logs_sensor`.
 *
 * `confirmed` starts as `false` and is later flipped to `true` by an
 * external service once the device acknowledges the write. `createdAt`
 * marks when the write was sent, `updatedAt` marks when it was acknowledged.
 *
 * Run with the sequelize-cli, e.g.:
 *   npx sequelize-cli db:migrate
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logs_actuators', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      actuator_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'actuators',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      device_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'devices',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      confirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('logs_actuators', ['actuator_id']);
    await queryInterface.addIndex('logs_actuators', ['device_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('logs_actuators');
  }
};
