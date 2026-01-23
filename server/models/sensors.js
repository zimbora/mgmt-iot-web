var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

const Table = "sensors";

var self = module.exports = {

  getByRef : async(deviceId, ref, property, cb)=>{
    if(!deviceId)
      return cb("Add deviceId to params",null);

    if(!ref)
      return cb("ref not known",null);

    var table = [];
    var query = `select * from ?? where device_id = ? and ref = ?`;
    table.push(Table,deviceId,ref);

    if(property){
      query += " and property = ?"
      table.push(property);
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

    db.insert(Table,obj)
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

    db.update(Table,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updateObject : async (id,obj,cb)=>{

    obj['updatedAt'] = moment().utc().format('YYYY-MM-DD HH:mm:ss');

    let filter = {
      id : id
    };

    db.update(Table,obj,filter)
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

    db.delete(Table,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (deviceId, cb)=>{

    if(!deviceId)
      return cb("Add deviceId to params",null);

    var table = [];
    var query = `select * from ?? where device_id = ?`;
    table.push(Table,deviceId);
    
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
