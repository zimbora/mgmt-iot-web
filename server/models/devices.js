var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports =  {

  addClientPermission : async (deviceId,clientId,level,cb)=>{

    let obj = {
      client_id : clientId,
      device_id : deviceId,
      level : level,
      createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    }

    return await db.insert("permissions",obj);

  },

  deleteClientPermission : async (deviceId,clientId,cb)=>{

    let filter = {
      device_id : deviceId,
      client_id : clientId,
    }

    db.delete("permissions",filter)
    .then (rows => {

      let filter = {
        device_id : deviceId
      }
      db.delete("devices",filter)
      .then (rows => {
        return cb(null,rows);
      })
      .catch(error => {
        return cb(error,null);
      });

    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updateClientPermission : async (deviceId,clientId,level,cb)=>{

    let obj = {
      level : level,
      token : password,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      device_id : deviceId,
      client_id : clientId
    };

    db.update("permissions",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  // list all devices
  list : async (cb)=>{

    let query = `select * from ??`;
    let table = ["devices"];
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // list associated devices
  listAssociated : async (clientId,cb)=>{

    let query = `select * from ?? inner join permissions where permissions.client_id = ? and permissions.device_id = devices.id`;
    let table = ["devices", clientId];
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getProject : async (deviceId) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select project from devices where id = ?`;
      let table = [deviceId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].project);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  getLogsTable : async (project,deviceId) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select logs_table from ?? where device_id = ?`;
      let table = [project,deviceId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].logs_table);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  // get info of device
  getInfo : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);

    if(null)
      return cb(null,null)

    let query = `select * from ?? as project inner join devices where device_id = ? and project.device_id = devices.id`;
    let table = [project,deviceId]
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0)
        return cb(null,rows[0]);
      else
        return cb(null,null);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get status logs of device
  getStatusLogs : async (deviceId,sensor,cb)=>{

    let project = await self.getProject(deviceId);

    let query = `SELECT * FROM (SELECT ??,createdAt FROM ?? WHERE ?? IS NOT NULL and device_id = ? ORDER BY createdAt DESC limit 100)  AS sub ORDER BY createdAt ASC;`
    let table = [sensor,"logs_"+project,sensor,deviceId]
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get sensor logs of device
  getSensorLogs : async (deviceId,sensor,cb)=>{

    let project = await self.getProject(deviceId);
    let logs_table = await self.getLogsTable(project,deviceId);

    if(logs_table == null)
      return cb("No table with logs is associated to the device",null)

    let query = `SELECT * FROM (SELECT ??,createdAt FROM ?? WHERE ?? IS NOT NULL and device_id = ? ORDER BY createdAt DESC limit 100)  AS sub ORDER BY createdAt ASC;`
    let table = [sensor,logs_table,sensor,deviceId]
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  delete : async (deviceId,cb)=>{

    console.log("deviceId:",deviceId)
    let filter = {
      uid : deviceId,
    }

    db.delete("devices",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  // get autorequests of device
  getAutorequests : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);

    let query = `select ar from ?? where id = ?`;
    let table = [project,deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get alarms of device
  getAlarms : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);

    let query = `select js_program from ?? where id = ?`;
    let table = [project,deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get jscode of device
  getJSCode : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);

    let query = `select  from ?? where id = ?`;
    let table = [project,deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get clients with access to this device
  getClientsWithAccess : async (deviceId,cb)=>{

    var query = `select permissions.client_id as id,level,nick from permissions \
    inner join devices on permissions.device_id = devices.id \
    inner join clients on permissions.client_id = clients.id \
    where permissions.device_id = ?  `;

    var table = [deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  updateDeviceRelease : async (deviceId,release,cb)=>{

    let project = await self.getProject(deviceId);

    if(null)
      return cb(null,null)

    let obj = {
      fw_release : release,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      device_id : deviceId
    };

    db.update(project,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updateDeviceSettings : async (deviceId,settings,cb)=>{

    let project = await self.getProject(deviceId);

    if(null)
      return cb(null,null)

    let obj = {
      settings : settings,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      device_id : deviceId
    };

    db.update(project,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

};

