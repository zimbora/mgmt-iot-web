const mysql = require('mysql2');
const moment = require('moment');
const async = require('async');
const db = require('../controllers/db');
const Devices = require('./devices');

const timestamp = () => moment.utc().format('YYYY-MM-DD HH:mm:ss');
const invalid = message => Object.assign(new Error(message), { status: 400 });

module.exports = {
  options: async modelId => {
    const variants = await db.queryRow(mysql.format('SELECT id, name FROM variants WHERE model_id = ?', [modelId]));
    const devices = await db.queryRow(mysql.format('SELECT id, uid, variant_id FROM devices WHERE model_id = ?', [modelId]));
    const firmwares = await db.queryRow(mysql.format(
      'SELECT id, variant_id, version, app_version, build_release FROM firmwares WHERE model_id = ?', [modelId]));
    return { variants, devices, firmwares };
  },

  list: modelId => db.queryRow(mysql.format(
    'SELECT * FROM fota_campaigns WHERE model_id = ? ORDER BY id DESC', [modelId])),

  targets: (modelId, campaignId) => db.queryRow(mysql.format(
    `SELECT d.* FROM fota_campaign_devices d
     INNER JOIN fota_campaigns c ON c.id = d.campaign_id WHERE c.model_id = ? AND c.id = ?`,
    [modelId, campaignId])),

  create: async (modelId, data) => {
    const connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => err ? reject(err) : resolve(conn));
    });
    const conn = connection.promise();
    try {
      await conn.beginTransaction();
      const [models] = await conn.query('SELECT id FROM models WHERE id = ? AND fw_enabled = 1', [modelId]);
      if (!models.length) throw invalid('Firmware updates are not enabled for this model');
      if (data.variant_id !== null) {
        const [variants] = await conn.query('SELECT id FROM variants WHERE id = ? AND model_id = ?', [data.variant_id, modelId]);
        if (!variants.length) throw invalid('Variant does not belong to this model');
      }
      const order = ['app_version', 'version'].map(column =>
        `CAST(SUBSTRING_INDEX(${column}, '.', 1) AS UNSIGNED) DESC,
         CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(${column}, '.', 2), '.', -1) AS UNSIGNED) DESC,
         CAST(SUBSTRING_INDEX(${column}, '.', -1) AS UNSIGNED) DESC`).join(', ');
      const [firmwares] = await conn.query(
        `SELECT * FROM firmwares WHERE model_id = ? AND variant_id <=> ? AND build_release = ?
         ${data.firmware_id === 'latest' ? '' : 'AND id = ?'}
         ORDER BY ${order}, id DESC LIMIT 1 FOR UPDATE`,
        [modelId, data.variant_id, data.build_release, ...(data.firmware_id === 'latest' ? [] : [data.firmware_id])]);
      const firmware = firmwares[0];
      if (!firmware) throw invalid('No matching firmware for this model, variant and release');
      const [devices] = await conn.query(
        `SELECT id, uid FROM devices WHERE model_id = ? AND variant_id <=> ?
         ${data.all_devices ? '' : 'AND id IN (?)'} FOR UPDATE`,
        [modelId, data.variant_id, ...(data.all_devices ? [] : [data.device_ids])]);
      if (!devices.length) throw invalid('Select at least one matching device');
      if (!data.all_devices && devices.length !== data.device_ids.length) {
        throw invalid('All selected devices must belong to this model and variant');
      }
      const now = timestamp();
      const [result] = await conn.query('INSERT INTO fota_campaigns SET ?', {
        name: data.name, model_id: modelId, variant_id: data.variant_id,
        firmware_id: firmware.id, version: firmware.version, app_version: firmware.app_version,
        build_release: firmware.build_release, all_devices: data.all_devices,
        status: 'dispatching', createdAt: now, updatedAt: now
      });
      await conn.query(
        'INSERT INTO fota_campaign_devices (campaign_id, device_id, uid, status, createdAt, updatedAt) VALUES ?',
        [devices.map(device => [result.insertId, device.id, device.uid, 'pending', now, now])]);
      await conn.commit();
      return { id: result.insertId, firmware_id: firmware.id, device_count: devices.length };
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  dispatch: async campaign => {
    try {
      const targets = await db.queryRow(mysql.format(
        'SELECT device_id FROM fota_campaign_devices WHERE campaign_id = ? AND status = ?', [campaign.id, 'pending']));
      await async.eachLimit(targets, 5, async target => {
        let status;
        let message;
        try {
          message = await new Promise((resolve, reject) => {
            Devices.triggerFota(target.device_id, null, null, (err, result) =>
              err ? reject(err) : resolve(result), campaign.firmware_id);
          });
          status = message === 'no new version available' ? 'skipped' : 'sent';
        } catch (err) {
          status = 'failed';
          message = err.message || String(err);
        }
        await db.update('fota_campaign_devices', { status, message, updatedAt: timestamp() },
          { campaign_id: campaign.id, device_id: target.device_id });
      });
      await db.update('fota_campaigns', { status: 'finished', updatedAt: timestamp() }, { id: campaign.id });
    } catch (err) {
      await db.update('fota_campaigns', { status: 'failed', updatedAt: timestamp() }, { id: campaign.id });
      throw err;
    }
  }
};
