var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports =  {

  addClientPermission : async (deviceId,clientId,level,cb)=>{

    let obj = {
      client_id : clientId,
      device_id : deviceId,
      level : level,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
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
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
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

  // front end
  // list all devices matching modelId which client as access
  list : async (modelId, clientId, cb)=>{
    
    let query = `select d.*,p.name as project,m.name as model from devices as d
                inner join projects as p on p.id = d.project_id
                inner join models as m on m.id = d.model_id`;
    let table = [];

    if(clientId != null)
      query += " inner join modelPermissions as mp on mp.model_id = m.id"

    if(modelId != null){
      query += " where m.id = ?"
      table.push(modelId);
    }
    
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // list all devices matching modelId and updated after updatedAt
  listSynch : async (modelId, updatedAt, cb)=>{
    
    let query = `select d.*,p.name as project,m.name as model from devices as d
                inner join projects as p on p.id = d.project_id
                inner join models as m on m.id = d.model_id`;
    let table = [];

    if(modelId != null){
      query += " where m.id = ?"
      table.push(modelId);
    }
    if(updatedAt != null){
      query += " and d.updatedAt > ?";
      table.push(updatedAt);
    }
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

    // list all devices permissions matching modelId and updated after updatedAt 
  permissionsSynch : async (updatedAt, cb)=>{
    
    let query = `select * from permissions where level > 3`;
    let table = [];

    if(updatedAt != null){
      query += " and updatedAt > ?";
      table.push(updatedAt);
    }
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // !! list associated devices - deprecated
  listAssociated : async (clientId,cb)=>{

    let query = `select d.*,p.name as project,m.name as model from devices as d
                inner join projects as p on p.id = d.project_id
                inner join models as m on m.id = d.model_id
                inner join permissions where permissions.client_id = ? and permissions.device_id = d.id`;
    let table = [clientId];
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

      let query = `select p.name from devices as d inner join projects as p on d.project_id = p.id and d.id = ?`;
      let table = [deviceId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].name);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  getModel : async (deviceId) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select m.name from devices as d inner join models as m on d.model_id = m.id and d.id = ?`;
      let table = [deviceId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].name);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  getUID: async (deviceId) =>{
    return new Promise( (resolve,reject)=>{
      let query = `select uid from devices where id = ?`;
      let table = [deviceId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].uid);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  // not needed for now
  getModelTable : async (model) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select model_table from models where name = ?`;
      let table = [model]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].model_table);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  getModelTableById : async (modelId) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select model_table from models where id = ?`;
      let table = [modelId]
      query = mysql.format(query,table);
      db.queryRow(query)
      .then(rows => {
        if(rows?.length > 0)
          resolve(rows[0].model_table);
        else resolve(null);
      })
      .catch(error => {
        reject(error);
      })
    })
  },

  getProjectLogsTable : async (project) =>{

    return new Promise( (resolve,reject)=>{

      let query = `select logs_table from projects where name = ?`;
      let table = [project]
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

  getModelLogsTable : async (model) =>{

    return new Promise( (resolve,reject)=>{

      return resolve("sensor_logs");
      /*
      let query = `select logs_table from models where name = ?`;
      let table = [model]
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
      */
    })
  },

  getInfo : async (deviceId,cb)=>{

    let data = {};

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    data["project_name"] = project;
    data["model_name"] = model;

    /*
    let query = `SELECT d.uid as uid, d.status as status, d.model_id as model_id,d.tech as tech,
    d.version as version, d.app_version as app_version, d.accept_release as build_release, 
    d.local_settings, d.remote_settings, p.* FROM ?? 
    as p left join devices as d on d.id = p.device_id 
    where d.id = ?;`
    */

    try{

      let query = `SELECT * FROM ?? where id = ?;`
      let table = ["devices",deviceId]
      query = mysql.format(query,table);
      let res = await db.queryRow(query)
      if(res != null && res.length > 0)
        data['device'] = res[0];


      query = `SELECT * FROM ?? where device_id = ?;`
      table = [project,deviceId]
      query = mysql.format(query,table);
      res = await db.queryRow(query);
      if(res != null && res.length > 0){
        data["project"] = res[0];
      }

      query = `SELECT * FROM ?? where device_id = ?;`
      table = [model,deviceId]
      query = mysql.format(query,table);
      res = await db.queryRow(query);
      if(res != null && res.length > 0){
        data["model"] = res[0];
      }

      query = `SELECT * FROM ?? where device_id = ?;`
      table = ["fw",deviceId]
      query = mysql.format(query,table);
      res = await db.queryRow(query);
      if(res != null && res.length > 0){
        data["fw"] = res[0];
      }

      if(data['device']?.associatedDevice){
        query = `SELECT * FROM ?? where id = ?;`
        table = ["devices",data['device']?.associatedDevice]
        query = mysql.format(query,table);
        res = await db.queryRow(query);
        if(res != null && res.length > 0){
          data["associated"] = res[0];

          let subModel = await self.getModel(data['device']?.associatedDevice);
          if(subModel){
            query = `SELECT * FROM ?? where device_id = ?;`
            table = [subModel,data['device']?.associatedDevice]
            query = mysql.format(query,table);
            res = await db.queryRow(query);
            if(res != null && res.length > 0){
              data["associated"][subModel] = res[0];
            }          
          }
        }

      }
      
    }catch(error){
      return cb(error,null);
    }

    return cb(null,data);
  },

  getLogs : async (deviceId,sensor,cb)=>{

    let table = [];
    let query = "";

    if (sensor != null) {
      query = `SELECT ??,createdAt FROM ?? WHERE device_id = ? `;
      table.push(sensor);
    } else {
      query = `SELECT * FROM ?? WHERE device_id = ? `;
    }

    table.push("logs_devices");
    table.push(deviceId);
    if(sensor != null){
      query += `and ?? IS NOT NULL `
      table.push(sensor);
    }
    query += `ORDER BY createdAt DESC LIMIT 20;`

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getProjectInfo : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let query = `SELECT d.uid as uid, d.status as status, d.model_id as model_id,d.tech as tech,p.* FROM ?? as p left join devices as d on d.id = p.device_id where d.id = ?;`
    let table = [project,deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      rows[0]["project"] = project;
      rows[0]["model"] = model;

      return cb(null,rows[0]);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getProjectLogs : async (deviceId,sensor,cb)=>{

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let table = [];
    let query = `SELECT ??,createdAt FROM ?? where device_id = ? `
    if(sensor != null)
      table.push(sensor)
    else 
      table.push("*");
    table.push("logs_"+project);
    table.push(deviceId);
    if(sensor != null){
      query += `and ?? IS NOT NULL `
      table.push(sensor);
    }
    query += `ORDER BY createdAt DESC LIMIT 20;`

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getFwInfo : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let query = `Select * from ?? where device_id = ?;`
    let table = ["fw",deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows[0]);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getFwLogs : async (deviceId,sensor,cb)=>{

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let table = [];
    let query = "";

    if (sensor != null) {
      query = `SELECT ??,createdAt FROM ?? WHERE device_id = ? `;
      table.push(sensor);
    } else {
      query = `SELECT * FROM ?? WHERE device_id = ? `;
    }

    table.push("logs_fw");
    table.push(deviceId);
    if(sensor != null){
      query += `and ?? IS NOT NULL `
      table.push(sensor);
    }
    query += `ORDER BY createdAt DESC LIMIT 20;`

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getSensorInfo : async (deviceId,cb)=>{

    return cb("Not implemented",null);

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let query = `Select * from ?? where device_id = ?;`
    let table = ["sensors",deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows[0]);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getSensorLogs : async (deviceId,sensor,cb)=>{

    return cb("Not implemented",null);

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    let table = [];
    let query = "";

    if (sensor != null) {
      query = `SELECT ??,createdAt FROM ?? WHERE device_id = ? `;
      table.push(sensor);
    } else {
      query = `SELECT * FROM ?? WHERE device_id = ? `;
    }

    table.push("logs_sensor");
    table.push(deviceId);
    if(sensor != null){
      query += `and ?? IS NOT NULL `
      table.push(sensor);
    }
    query += `ORDER BY createdAt DESC LIMIT 20;`

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getModelInfo : async (deviceId,cb)=>{

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    if(model == "sniffer-gw"){
      model = "sniffer";
    }
    let query = `Select * from ?? where name = ?`;

    let table = ["models",model]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }

      return cb(null,rows[0]);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  getModelLogs : async (deviceId,sensor,cb)=>{

    let project = await self.getProject(deviceId);
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null);

    let model = await self.getModel(deviceId);
    if(model == null)
      return cb(null,null);

    if(model == "sniffer-gw"){
      model = "sniffer";
    }

    let table = [];
    let query = "";

    if (sensor != null) {
      query = `SELECT ??,createdAt FROM ?? WHERE device_id = ? `;
      table.push(sensor);
    } else {
      query = `SELECT * FROM ?? WHERE device_id = ? `;
    }

    table.push("logs_"+model);
    table.push(deviceId);
    if(sensor != null){
      query += `and ?? IS NOT NULL `
      table.push(sensor);
    }
    query += `ORDER BY createdAt DESC LIMIT 20;`

    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0 ){
        return cb(null,null);
      }
      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    })
  },

  // get registered sensors for model
  getSensors : async (deviceId,modelId,cb)=>{

    let model_table = await self.getModelTableById(modelId);

    if(model_table == null)
      return cb(null,null)

    let query = `SELECT * FROM ?? where device_id = ?`;
    let table = [model_table,deviceId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0)
        return cb(null,null);
      else
        return cb(null,rows[0]);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  /*
  // get sensor logs of device
  getSensorLogs : async (deviceId,sensor,cb)=>{

    let model = await self.getModel(deviceId);
    let model_table = await self.getModelTable(model);
    let logs_table = await self.getModelLogsTable(model,deviceId);

    if(logs_table == null)
      return cb("No table with logs is associated to the device",null)

    let query = `SELECT * FROM (SELECT value,createdAt FROM ?? WHERE sensor_id = ? and device_id = ? ORDER BY createdAt DESC limit 1000)  AS sub ORDER BY createdAt ASC;`
    let table = [logs_table,sensor,deviceId]
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },
  */

  delete : async (deviceId,cb)=>{

    let project_table = await self.getProject(deviceId);
    let project_logs_table = await self.getProjectLogsTable(project_table);

    let model = await self.getModel(deviceId);
    let model_table = await self.getModelTable(model);
    let model_logs_table = await self.getModelLogsTable(model);


    let filter = {
      device_id : deviceId,
    }


    if(project_table != null)
      if( await db.tableExists(model_table)){
        await db.delete(project_table,filter);
      }
    if(project_logs_table != null)
      if( await db.tableExists(model_table)){
        await db.delete(project_logs_table,filter);
      }
    if(model_table != null){
      if( await db.tableExists(model_table)){
        await db.delete(model_table,filter);
      }
    }
    if(model_logs_table != null){
      if( await db.tableExists(model_table)){
        await db.delete(model_logs_table,filter);
      }
    }
    await db.delete("permissions",filter);

    // this must be executed only after all previous delete calls
    filter = {
      id : deviceId,
    }

    db.delete("devices",filter)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // get autorequests of device
  getAutorequests : async (deviceId,cb)=>{

    let project = await self.getProject(deviceId);

    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

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
    
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

    let query = `select alarms from ?? where id = ?`;
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
    
    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

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

    let obj = {
      accept_release : release,
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : Number(deviceId)
    };

    db.update("devices",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      console.error(error)
      return cb(error,null);
    });
  },

  updateDeviceSettings : async (deviceId,settings,cb)=>{

    let project = await self.getProject(deviceId);

    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

    let obj = {
      settings : settings,
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
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

  updateDeviceProjectField : async (deviceId,field,data,cb)=>{

    let project = await self.getProject(deviceId);

    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

    let obj = {
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };
    obj[field] = data;

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

  sendMqttMessage : async (deviceId,topic,payload,qos,retain,cb)=>{

    let project = await self.getProject(deviceId);

    if(project == null)
      return cb(`no project found for deviceId ${deviceId}`,null)

    let uid = await self.getUID(deviceId);
    if(uid == null)
      return cb(`no uid found for deviceId ${deviceId}`,null)
    
    let publishTopic = `${project}/${uid}/${topic}`;

    if(publishTopic.endsWith("get")){
      // response comes without "get"
      rcvTopic = publishTopic.split('/');
      responseTopic = rcvTopic.slice(0,-1).join('/');
    }else if(publishTopic.endsWith("set")){
      // check for unpublish topic
      responseTopic = publishTopic;
    }
    
    try{
      //$.mqttClient.publish(fullTopic,payload,qos,retain);
      let res = await publishAndWaitForResponse(publishTopic, payload, responseTopic, qos, retain);
      return cb(null,res);
    }catch(error){
      return cb(error,null);
    }

  }

};

async function publishAndWaitForResponse(publishTopic, messagePayload, responseTopic, qos, retain, timeout = 5000) {
  return new Promise((resolve, reject) => {
    // Handler for incoming messages
    const messageHandler = (topic, message) => {
      if (topic === responseTopic) {
        // Unsubscribe and clean up
        $.mqttClient.unsubscribe(responseTopic);
        $.mqttClient.off('message', messageHandler);
        resolve(message.toString()); // or parse as needed
      }
    };

    // Publish message
    $.mqttClient.publish(publishTopic, messagePayload, { qos, retain });

    // Subscribe to response topic
    $.mqttClient.subscribe(responseTopic, { qos }, (err) => {
      if (err) {
        return reject(err);
      }

      // Attach message handler
      $.mqttClient.on('message', messageHandler);

      // Optional: set a timeout to reject if no response received
      setTimeout(() => {
        $.mqttClient.off('message', messageHandler);
        $.mqttClient.unsubscribe(responseTopic);
        reject('Response timeout');
      }, timeout);
    });
  });
}
