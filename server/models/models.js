var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var self = module.exports = {

  getModelById : async (model_id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = ["models",model_id];
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

  getId : async(name)=>{

     return new Promise((resolve,reject) => {
      var query = `select id from models where name = ?`;
      var table = [name];
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

  add : async(namecb)=>{

    let obj = {
      name : name,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("models",obj)
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

    db.delete("models",filter)
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

    db.update("models",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updateOption : async (id,option,value,cb)=>{

    let obj = {
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };
    obj[option] = value;

    let filter = {
      id : id
    };

    db.update("models",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (cb)=>{

    var query = `select * from models`;
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

  listWithClientPermission : (clientid,cb)=>{

    var query = `select m.* from models as m inner join modelPermissions as mp where mp.client_id = ? and mp.model_id = m.id`;
    var table = [clientid];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  listPermissions : (modelId,cb)=>{

    var query = `select c.nick,p.id,p.client_id from modelPermissions as p inner join clients as c where ?? = ? and p.client_id = c.id`;
    var table = ["model_id",modelId];
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  grantPermission : (clientId,modelId,cb)=>{

    let query = "select * from ?? where ?? = ? and ?? = ?";
    let table = ["modelPermissions","client_id",clientId,"model_id",modelId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0){
        return cb("This client already has permission for this model",null);
      }else{
        let obj = {
          client_id : clientId,
          model_id : modelId,
          createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }
        db.insert("modelPermissions",obj)
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
    })
  },

  removePermission : (clientId,modelId,cb)=>{

    let filter = {
      client_id : clientId,
      model_id : modelId,
    }

    db.delete("modelPermissions",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  checkOwnership : (nick,name,cb)=>{

    return cb(null,null);

    // not available
    var query = `select * from ?? where ?? = ? and ?? = ?`;
    var table = ["models","createdBy",nick,"name",name];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  checkAccess : (clientId,modelId,cb)=>{

    var query = `select * from ?? where ?? = ? and ?? = ?`;
    var table = ["modelPermissions","client_id",clientId,"model_id",modelId];
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
