var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  // Get template entries by template ID
  getById: async (templateId, cb) => {
    var query = `SELECT * FROM mqttTemplate WHERE template_id = ?`;
    var table = [templateId];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Get all topics for a specific template
  getTopics: async (templateId, cb) => {
    var query = `SELECT * FROM mqttTemplate WHERE template_id = ? ORDER BY topic`;
    var table = [templateId];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Add a new topic
  addTopic: async (templateId, topic, description, defaultData, localData, readInterval, synch, cb) => {
    let obj = {
      template_id: templateId,
      topic: topic,
      description: JSON.stringify(description),
      defaultData: defaultData ? JSON.stringify(defaultData) : null,
      localData: localData ? JSON.stringify(localData) : defaultData,
      readInterval: readInterval,
      synch,
      createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    db.insert("mqttTemplate", obj)
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
    if (updateData.localData !== undefined) {
      obj.localData = updateData.localData ? JSON.stringify(updateData.defaultData) : null;
    }
    if (updateData.readInterval !== undefined) {
      obj.readInterval = updateData.readInterval;
    }

    if (updateData.synch !== undefined) {
      obj.synch = updateData.synch;
    }

    let filter = {
      id: entryId
    };

    db.update("mqttTemplate", obj, filter)
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

    db.delete("mqttTemplate", filter)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // List all topics (for debugging/admin purposes)
  list: async (cb) => {
    var query = `SELECT * FROM mqttTemplate ORDER BY template_id, topic`;
    var table = [];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  }
};