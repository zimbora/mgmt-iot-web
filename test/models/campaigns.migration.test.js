const migration = require('../../migrations/20261017000000-create-fota-campaigns');

describe('FOTA campaigns Sequelize migration', () => {
  it('creates reversible campaign snapshots with unique device membership', async () => {
    const qi = { createTable: jest.fn(), addIndex: jest.fn(), dropTable: jest.fn() };
    const Sequelize = {
      INTEGER: { UNSIGNED: 'unsigned' }, STRING: 'string', TEXT: 'text', DATE: 'date', BOOLEAN: 'boolean',
      ENUM: (...values) => values
    };
    await migration.up(qi, Sequelize);
    expect(qi.createTable.mock.calls.map(call => call[0])).toEqual(['fota_campaigns', 'fota_campaign_devices']);
    const campaign = qi.createTable.mock.calls[0][1];
    const devices = qi.createTable.mock.calls[1][1];
    expect(campaign.firmware_id.allowNull).toBe(false);
    expect(campaign.variant_id.allowNull).toBe(true);
    expect(devices.campaign_id.references).toEqual({ model: 'fota_campaigns', key: 'id' });
    expect(devices.campaign_id.onDelete).toBe('CASCADE');
    expect(qi.addIndex).toHaveBeenCalledWith('fota_campaign_devices', ['campaign_id', 'device_id'], { unique: true });
    await migration.down(qi);
    expect(qi.dropTable.mock.calls.map(call => call[0])).toEqual(['fota_campaign_devices', 'fota_campaigns']);
  });
});
