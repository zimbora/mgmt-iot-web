var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

const Table = "sensorsTemplate";

var self = module.exports = {

  getById : async (id, cb)=>{

    if(!id)
      return cb("id is null",null);

    var table = [];
    var query = `select * from ?? where id = ?`;
    table.push(Table,id);
    
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows[0]);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  add : async(model_id,ref,name,type,property,cb)=>{

    let obj = {
      model_id : model_id,
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

  list : async (modelId, cb)=>{

    if(!modelId)
      return cb("Add modelId to params",null);

    var table = [];
    var query = `select * from ?? where model_id = ?`;
    table.push(Table,modelId);
    
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
