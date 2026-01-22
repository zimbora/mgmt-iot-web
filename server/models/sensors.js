var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  add : async(model_id,device_id,ref,name,type,property,cb)=>{

    let obj = {
      model_id : model_id,
      device_id : device_id,
      ref : ref,
      name : name,
      type: type,
      property: property ? property : '',
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }
    
    db.insert("sensors",obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  update : async (id,property,value,cb)=>{

    let obj = {
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };
    obj[property] = value;

    let filter = {
      id : id
    };

    db.update("sensors",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  delete : async (id,cb)=>{

    let filter = {
      id : id
    };

    db.delete("sensors",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (modelId, deviceId, cb)=>{

    if(!modelId && !deviceId)
      return cb("Add modelId or deviceId to params",null);

    var table = [];
    var query = `select * from sensors where `;
    if(deviceId){
      query += `device_id = ?`
      table.push(deviceId);
    }else if(modelId){
      query += `model_id = ?`
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

};
