'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fota_campaigns', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      model_id: { type: Sequelize.INTEGER, allowNull: false },
      variant_id: { type: Sequelize.INTEGER, allowNull: true },
      firmware_id: { type: Sequelize.INTEGER, allowNull: false },
      version: { type: Sequelize.STRING, allowNull: false },
      app_version: { type: Sequelize.STRING, allowNull: false },
      build_release: { type: Sequelize.STRING, allowNull: false },
      all_devices: { type: Sequelize.BOOLEAN, allowNull: false },
      status: { type: Sequelize.ENUM('dispatching', 'finished', 'failed'), allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('fota_campaigns', ['model_id']);
    await queryInterface.createTable('fota_campaign_devices', {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      campaign_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'fota_campaigns', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      device_id: { type: Sequelize.INTEGER, allowNull: false },
      uid: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'sent', 'skipped', 'failed'), allowNull: false },
      message: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('fota_campaign_devices', ['campaign_id', 'device_id'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('fota_campaign_devices');
    await queryInterface.dropTable('fota_campaigns');
  }
};
