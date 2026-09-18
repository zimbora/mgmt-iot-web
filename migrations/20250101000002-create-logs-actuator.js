'use strict';

/**
 * Sequelize migration to create the `logs_actuator` table.
 *
 * Every time an actuator's `value` is written (either directly through the
 * device endpoint, or triggered by a client), a row is appended here so the
 * write history can be inspected the same way sensor readings are inspected
 * through `logs_sensor`.
 *
 * Run with the sequelize-cli, e.g.:
 *   npx sequelize-cli db:migrate
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logs_actuator', {
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
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('logs_actuator', ['actuator_id']);
    await queryInterface.addIndex('logs_actuator', ['device_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('logs_actuator');
  }
};
