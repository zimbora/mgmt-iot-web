var path = require('path');
const fs = require('fs')
var mysql = require('mysql2');
var db = require('../controllers/db');
var CryptoJS = require("crypto-js");
const moment = require('moment');

module.exports =  {

  getFirmwareToken : (fw_token,filename,cb)=>{

    var query = `select * from ?? where token = ? and filename = ?`;
    var table = ["firmwares",fw_token,filename];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  list : (cb)=>{

    var query = `select * from ??`;
    var table = ["firmwares"];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  listByModel : (modelId,cb)=>{

    var query = `select * from ?? where fwModel_id = ?`;
    var table = ["firmwares",modelId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  add : async (filename,originalname,fw_version,app_version,modelId,cb)=>{

    let query = "select * from ?? where ?? = ? and ?? = ? and ?? = ?";
    let table = ["firmwares","fw_version",fw_version,"app_version",app_version,"fwModel_id",modelId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0){
        return cb("this version already exists for this model, try increase it",null)
      }else{
        var SHA256 = require("crypto-js/sha256");
        let message = originalname+"\º~"+fw_version+app_version;
        let key = String(Date.now()/3621)
        var token = CryptoJS.HmacSHA256(message, key).toString();

        let obj = {
          filename : filename,
          originalname : originalname,
          fw_version : fw_version,
          app_version : app_version,
          fwModel_id : modelId,
          token : token,
          createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
        }

        db.insert("firmwares",obj)
        .then( rows => {
          return cb(null,rows);
        })
        .catch( error => {
          return cb(error, null);
        })
      }
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  delete : (id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = ["firmwares",id];
    query = mysql.format(query,table);

    var filename = "";
    db.queryRow(query)
    .then(rows => {
      if(rows.length == 0) return cb(null,rows);
      else{
        filename = rows[0].filename;
        let filter = {
          id : id
        }
        db.delete("firmwares",filter)
        .then (rows => {
          let file_path = path.join(__dirname, "../"+config.public_path+"/firmwares/"+filename);
          fs.unlinkSync(file_path)
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
  /*
  update : (firmwareId,cb)=>{

    let obj = {
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : firmwareId
    };

    db.update("firmwares",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },
  */
  updateRelease : (firmwareId,release,cb)=>{

    let obj = {
      fw_release : release,
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : firmwareId
    };

    db.update("firmwares",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  listModels : (cb)=>{

    var query = `select * from ??`;
    var table = ["fwModels",];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  listModelsWithClientPermission : (clientid,cb)=>{

    var query = `select * from ?? inner join ?? where permissionsFW.client_id = ? and permissionsFW.fwModel_id = fwModels.id`;
    var table = ["fwModels","permissionsFW",clientid];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getModelInfo : async (model_id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = ["fwModels",model_id];
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

  addModel : async (nick,model,description,cb)=>{

    let obj = {
      name : model,
      description : description,
      createdBy: nick,
      createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("fwModels",obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  deleteModel : (clientid,modelId,cb)=>{

    let filter = {
      id : modelId,
    }

    db.delete("fwModels",filter)
    .then (rows => {
      return cb(null,rows);
      let filter = {
        id : modelId,
      }
      db.delete("fwModels",filter)
      .then (rows => {
        return cb(null,rows);
        let filter = {
          id : modelId,
        }
      })
      .catch(error => {
        return cb(error,null);
      });
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  listModelPermission : (modelId,cb)=>{

    var query = `select c.nick,p.id,p.client_id from permissionsFW as p inner join clients as c where ?? = ? and p.client_id = c.id`;
    var table = ["fwModel_id",modelId];
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  grantModelPermission : (clientId,modelId,cb)=>{

    let query = "select * from ?? where ?? = ? and ?? = ?";
    let table = ["permissionsFW","client_id",clientId,"fwModel_id",modelId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0){
        return cb("This client already has permission for this model",null);
      }else{
        let obj = {
          client_id : clientId,
          fwModel_id : modelId,
          createdAt : moment().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt : moment().format('YYYY-MM-DD HH:mm:ss')
        }
        db.insert("permissionsFW",obj)
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

  removeModelPermission : (clientId,modelId,cb)=>{

    let filter = {
      client_id : clientId,
      fwModel_id : modelId,
    }

    db.delete("permissionsFW",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  checkModelOwnership : (nick,name,cb)=>{

    var query = `select * from ?? where ?? = ? and ?? = ?`;
    var table = ["fwModels","createdBy",nick,"name",name];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  checkModelAccess : (clientId,modelId,cb)=>{

    var query = `select * from ?? where ?? = ? and ?? = ?`;
    var table = ["permissionsFW","client_id",clientId,"fwModel_id",modelId];
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
