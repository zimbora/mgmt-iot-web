var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  // Get resources by ID
  getById: async (resourceId, cb) => {
    var query = `SELECT * FROM lwm2mTemplate WHERE template_id = ?`;
    var table = [resourceId];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      if (rows.length > 0) {
        // Parse JSON fields
        const resource = rows[0];
        try {
          resource.description = JSON.parse(resource.description);
        } catch (e) {
          resource.description = {};
        }
        try {
          resource.defaultData = resource.defaultData ? JSON.parse(resource.defaultData) : null;
        } catch (e) {
          resource.defaultData = null;
        }
        return cb(null, resource);
      }
      return cb(null, null);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Get all objects for a specific template
  getObjects: async (templateId, cb) => {

    var query = `SELECT * FROM lwm2mTemplate WHERE template_id = ? and objectInstanceId IS NULL and resourceId IS NULL ORDER BY objectId`;
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

  getResources : async (templateId, objectId, cb)=>{

    var query = `select * from ?? where template_id = ?`;
    var table = ["lwm2mTemplate",templateId];
    if(objectId != null){
      query += " and objectId = ?";
      table.push(objectId);
    }
    query += ` order by objectId, objectInstanceId, resourceId`
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // Add a new object
  addObject: async (templateId, objectId, description, defaultData, observe, readInterval, cb) => {
    let obj = {
      template_id: templateId,
      objectId: objectId,
      description: JSON.stringify(description),
      defaultData: defaultData ? JSON.stringify(defaultData) : null,
      observe: observe,
      readInterval: readInterval,
      createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    db.insert("lwm2mTemplate", obj)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Add a new resource
  addResource: async (templateId, objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval, cb) => {
    let obj = {
      template_id: templateId,
      objectId: objectId,
      objectInstanceId: objectInstanceId,
      resourceId: resourceId,
      description: JSON.stringify(description),
      defaultData: defaultData ? JSON.stringify(defaultData) : null,
      observe: observe,
      readInterval: readInterval,
      createdAt: moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    db.insert("lwm2mTemplate", obj)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Update an existing object
  updateEntry: async (entryId, updateData, cb) => {
    let obj = {
      updatedAt: moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    // Add fields that are being updated
    if (updateData.description !== undefined) {
      obj.description = JSON.stringify(updateData.description);
    }
    if (updateData.defaultData !== undefined) {
      obj.defaultData = updateData.defaultData ? JSON.stringify(updateData.defaultData) : null;
    }
    if (updateData.observe !== undefined) {
      obj.observe = updateData.observe;
    }
    if (updateData.readInterval !== undefined) {
      obj.readInterval = updateData.readInterval;
    }

    let filter = {
      id: entryId
    };

    db.update("lwm2mTemplate", obj, filter)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // Delete a resource
  deleteEntry: async (entryId, cb) => {
    let filter = {
      id: entryId
    };

    db.delete("lwm2mTemplate", filter)
    .then(rows => {
      return cb(null, rows);
    })
    .catch(error => {
      return cb(error, null);
    });
  },

  // List all resources (for debugging/admin purposes)
  list: async (cb) => {
    var query = `SELECT * FROM lwm2mTemplate ORDER BY template_id, objectId, objectInstanceId, resourceId`;
    var table = [];
    query = mysql.format(query, table);

    db.queryRow(query)
    .then(rows => {
      // Parse JSON fields for each row
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
    })
    .catch(error => {
      return cb(error, null);
    });
  }
};