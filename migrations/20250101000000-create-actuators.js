'use strict';

/**
 * Sequelize migration to create the `actuators` table.
 *
 * An actuator is a device-level counterpart of a sensor: instead of holding
 * readings coming *from* a device, it holds a value that is *written* to a
 * device. The `type` column constrains the shape of the `value` column:
 *
 *  - set    : stateless trigger, defaults to 1
 *  - switch : boolean-like value, only accepts 0/1
 *  - number : any numeric value
 *  - text   : any text value
 *  - json   : any valid json structure
 *
 * Run with the sequelize-cli, e.g.:
 *   npx sequelize-cli db:migrate
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('actuators', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      model_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'models',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      device_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
          model: 'devices',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      ref: {
        type: Sequelize.STRING,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('set', 'switch', 'number', 'text', 'json'),
        allowNull: false
      },
      property: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: ''
      },
      value: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      active: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      graph: {
        type: Sequelize.JSON,
        allowNull: true
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

    await queryInterface.addIndex('actuators', ['device_id', 'ref']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('actuators');
  }
};
