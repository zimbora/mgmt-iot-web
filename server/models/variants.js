var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  getById : async (variant_id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = ["variants",variant_id];
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

  getId : async(name,modelId)=>{

    return new Promise((resolve,reject) => {
      var query = `select id from variants where name = ? and model_id = ?`;
      var table = [name,modelId];
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

  add : async(name,model_id,description,cb)=>{

    var query = `select * from variants where name = ? and model_id = ?`;
    var table = [name, model_id];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0){
        return cb("Variant with this name already exists for this model",null);
      }else{
        let obj = {
          name : name,
          model_id: model_id,
          description: description || null,
          createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }

        db.insert("variants",obj)
        .then (rows => {
          return cb(null,rows);
        })
        .catch(error => {
          return cb(error,null);
        });
      }
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  delete : async (id,cb)=>{

    let filter = {
      id : id,
    }
    db.delete("variants",filter)
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
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : id
    };

    db.update("variants",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  listByModel : async (model_id,cb)=>{

    var query = `select * from ?? where model_id = ?`;
    var table = ["variants",model_id];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  list : async (cb)=>{

    var query = `select * from variants`;
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

};
