var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  getId : async(name)=>{

     return new Promise((resolve,reject) => {
      var query = `select id from projects where name = ?`;
      var table = [name];
      query = mysql.format(query,table);

      db.queryRow(query)
      .then(rows => {
        if(rows.length > 0) return resolve(rows[0].id);
        return resolve(null);
      })
      .catch(error => {
        console.log(error);
        return resolve(null);
      })
    });
  },

  add : async(namecb)=>{

    let obj = {
      name : name,
      createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("projects",obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  delete : async (id,cb)=>{

    let filter = {
      id : id,
    }

    db.delete("projects",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  update : async (id,description,cb)=>{

    let obj = {
      description : description,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : id
    };

    db.update("projects",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (cb)=>{

    var query = `select * from projects`;
    var table = [];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  }
};
