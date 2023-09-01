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

  listWithClientPermission : (clientId, cb)=>{

    var query = `select f.* from firmwares as f inner join modelPermissions as mp on mp.client_id = ? and mp.model_id = f.model_id`;
    var table = [clientId];
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

    var query = `select * from ?? where model_id = ?`;
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

  listByModelWithClientPermission : (clientId, modelId,cb)=>{

    var query = ` SELECT f.*
    FROM firmwares AS f
    INNER JOIN modelPermissions AS mp ON mp.model_id = f.model_id
    WHERE mp.client_id = ? AND f.model_id = ?`;

    var table = [clientId,modelId];
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
    let table = ["firmwares","fw_version",fw_version,"app_version",app_version,"model_id",modelId];
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
          model_id : modelId,
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

};
