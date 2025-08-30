var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {
  
  getObjects : async (cb)=>{

    var query = `select * from ??`;
    var table = ["lwm2mObjects"];
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

  getResources : async (objectId,cb)=>{

    var query = `select * from ??`;
    var table = ["lwm2mResources"];
    if(objectId){
      query += " where objectId = ?";
      table.push(objectId);
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
}