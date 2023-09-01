var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  getId : async(type)=>{

     return new Promise((resolve,reject) => {
      var query = `select id from users where type = ?`;
      var table = [type];
      query = mysql.format(query,table);

      db.queryRow(query)
      .then(rows => {
        if(rows.length > 0) return resolve(rows[0].id);
        return resolve(null);
      })
      .catch(error => {
        return resolve(null);
      })
    });
  },

  add : async(type,pwd,level,cb)=>{

    let obj = {
      type : type,
      password : pwd,
      level: level,
      createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("users",obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  delete : async (type,cb)=>{

    let filter = {
      type : type,
    }

    db.delete("users",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  update : async (id,type,pwd,level,cb)=>{

    let obj = {
      password : pwd,
      level : level,
      type : type,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : id
    };

    db.update("users",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (cb)=>{

    var query = `select * from users`;
    var table = [];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  addIfNotRegistered : async (type,pwd,level,cb)=>{

    var query = `select * from users where type = ?`;
    var table = [type];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0){
        self.add(type,pwd,level,(err,res)=>{
          return cb(err,res);
        })
      }else{
        return cb("User already registered",null);
      }
    })
    .catch(error => {
      return cb(error,null);
    })
  }
};
