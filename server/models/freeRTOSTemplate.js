var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  // Get template entries by template ID
  getById: async (templateId, cb) => {
    var query = `SELECT * FROM freeRTOSTemplate WHERE template_id = ?`;
    var table = [templateId];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      if (rows.length > 0) {
        // Parse JSON fields
        const resources = rows.map(row => {
          try {
            row.description = JSON.parse(row.description);
          } catch (e) {
            row.description = {};
          }
          try {
            row.defaultData = row.defaultData ? JSON.parse(row.defaultData) : null;
          } catch (e) {
            row.defaultData = null;
          }
          return row;
        });
        return cb(null, resources);
      }
      return cb(null, []);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Get all topics for a specific template
  getTopics: async (templateId, cb) => {
    var query = `SELECT * FROM freeRTOSTemplate WHERE template_id = ? ORDER BY topic`;
    var table = [templateId];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      // Parse JSON fields
      const topics = rows.map(row => {
        try {
          row.description = JSON.parse(row.description);
        } catch (e) {
          row.description = {};
        }
        try {
          row.defaultData = row.defaultData ? JSON.parse(row.defaultData) : null;
        } catch (e) {
          row.defaultData = null;
        }
        return row;
      });
      return cb(null, topics);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Add a new topic
  addTopic: async (templateId, topic, description, defaultData, publishInterval, cb) => {
    let obj = {
      template_id: templateId,
      topic: topic,
      description: JSON.stringify(description),
      defaultData: defaultData ? JSON.stringify(defaultData) : null,
      publishInterval: publishInterval,
      createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    db.insert("freeRTOSTemplate", obj)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Update an existing topic
  updateEntry: async (entryId, updateData, cb) => {
    let obj = {
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    // Add fields that are being updated
    if (updateData.topic !== undefined) {
      obj.topic = updateData.topic;
    }
    if (updateData.description !== undefined) {
      obj.description = JSON.stringify(updateData.description);
    }
    if (updateData.defaultData !== undefined) {
      obj.defaultData = updateData.defaultData ? JSON.stringify(updateData.defaultData) : null;
    }
    if (updateData.publishInterval !== undefined) {
      obj.publishInterval = updateData.publishInterval;
    }

    let filter = {
      id: entryId
    };

    db.update("freeRTOSTemplate", obj, filter)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Delete a topic
  deleteEntry: async (entryId, cb) => {
    let filter = {
      id: entryId
    };

    db.delete("freeRTOSTemplate", filter)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // List all topics (for debugging/admin purposes)
  list: async (cb) => {
    var query = `SELECT * FROM freeRTOSTemplate ORDER BY template_id, topic`;
    var table = [];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      // Parse JSON fields for each row
      const topics = rows.map(row => {
        try {
          row.description = JSON.parse(row.description);
        } catch (e) {
          row.description = {};
        }
        try {
          row.defaultData = row.defaultData ? JSON.parse(row.defaultData) : null;
        } catch (e) {
          row.defaultData = null;
        }
        return row;
      });
      return cb(null, topics);
    })
    .catch(error => {
      return cb(error, null);
    });
  }
};