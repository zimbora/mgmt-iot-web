'use strict';

/**
 * Sequelize migration to create the `actuatorsTemplate` table.
 *
 * This is the model-level (template) equivalent of `actuators`, used to
 * define the default actuators of a device model, the same way
 * `sensorsTemplate` does for sensors. See `20250101000000-create-actuators.js`
 * for the meaning of the `type`/`value` columns.
 *
 * Run with the sequelize-cli, e.g.:
 *   npx sequelize-cli db:migrate
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('actuatorsTemplate', {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      model_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: 'models',
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

    await queryInterface.addIndex('actuatorsTemplate', ['model_id', 'ref']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('actuatorsTemplate');
  }
};
