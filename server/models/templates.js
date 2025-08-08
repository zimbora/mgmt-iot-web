var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var tableName = "templates";

var self = module.exports = {
  
  getById : async (template_id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = [tableName,template_id];
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

  list : async (projectId,cb)=>{

    var query = `select * from ??`
    var table = [tableName];
    
    if(projectId){
      query += ` where project_id = ? `
      table.push(projectId)
    }

    query += `order by createdAt desc`;
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  add : async(tag,name,client_id,project_id,cb)=>{

    let obj = {
      tag : tag,
      name : name,
      client_id : client_id,
      project_id : project_id,
      createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    db.insert(tableName,obj)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  delete : async(template_id,cb)=>{

    let filter = {id:template_id};

    db.delete(tableName,filter)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  update : async(template_id,tag,name,cb)=>{

    let obj = {
      tag : tag,
      name : name,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {id:template_id};

    db.update(tableName,obj,filter)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  }
};