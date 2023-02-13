var path = require('path');
const fs = require('fs')
var mysql = require('mysql2');
var db = require('../controllers/db');
var CryptoJS = require("crypto-js");

module.exports =  {

  getFirmwareToken : (fw_token,fwId,cb)=>{

    db.getConnection((err,conn) => {
      if(err) cb(err,null)
      else{
        var query = `select * from ?? where token = ? and filename = ?`;
        var table = ["firmwares",fw_token,fwId];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(false,rows);
        });
      }
    });
  },

  list : (cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ??`;
        var table = ["firmwares"];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  listByModel : (model,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ?? where fwModel_name = ?`;
        var table = ["firmwares",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  add : (filename,originalname,fw_version,app_version,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "select * from ?? where ?? = ? and ?? = ? and ?? = ?";
        let table = ["firmwares","fw_version",fw_version,"app_version",app_version,"fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null)
          }else if(rows.length > 0){
            db.close_db_connection(conn);
            return cb("this version already exists for this model, try increase it",null)
          }else{

            var SHA256 = require("crypto-js/sha256");
            let message = originalname+"\º~"+fw_version+app_version;
            let key = String(Date.now()/3621)
            var token = CryptoJS.HmacSHA256(message, key).toString();
            //let token = CryptoJS.AES.encrypt(originalname,version).toString();

            let query = "INSERT INTO ?? (??,??,??,??,??,??) VALUES (?,?,?,?,?,?)";
            let table = ["firmwares","filename","originalname","fw_version","app_version","fwModel_name","token",filename,originalname,fw_version,app_version,model,token];
            query = mysql.format(query,table);
            conn.query(query,function(err,rows){
              db.close_db_connection(conn);
              if(err) cb(err,null);
              else cb(null,rows);
            });
          }
        });
      }
    });

  },

  delete : (id,cb)=>{

    var filename = "";
    db.getConnection((err,conn) => {
      if(err) cb(err,null)
      else{

        let query = "select * FROM ?? where ?? = ?";
        let table = ["firmwares","id",id];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          }else if(rows.length == 0){
            db.close_db_connection(conn);
            return cb(null,null);
          }else{
            filename = rows[0].filename;
            try {
              let query = "DELETE FROM ?? where ?? = ?";
              let table = ["firmwares","id",id];
              query = mysql.format(query,table);
              conn.query(query,function(err,rows){
                db.close_db_connection(conn);
                if(err) return cb(err,null);
                else{
                  try{
                    let file_path = path.join(__dirname, "../"+config.public_path+"/firmwares/"+filename);
                    fs.unlinkSync(file_path)
                  }catch(e){
                    console.log(e);
                  }
                  return cb(null,rows);
                }
              });
            } catch(err) {
              console.error(err)
            }

          }
        });
      }
    });

  },

  update : (clientid,user,cb)=>{
    /*
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ?, ?? = ? where ?? = ?";
        let table = ["clients","users_idusers",user,"token",password,"idclients",clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
    */
  },

  updateRelease : (id,release,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ? where ?? = ?";
        let table = ["firmwares","fw_release",release,"id",id];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  listModels : (cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ??`;
        var table = ["fwModel",];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  listModelsWithClientPermission : (clientid,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ?? inner join ?? where permissionsFW.clients_idclients = ? and permissionsFW.fwModel_name = fwModel.name`;
        var table = ["fwModel","permissionsFW",clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  addModel : (clientid,model,description,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{

        let query = "INSERT INTO ?? (??,??,??) VALUES (?,?,?)";
        let table = ["fwModel","name","description","owner",model,description,clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            cb(err.sqlMessage,null);
          }else{
            let query = "INSERT INTO ?? (??,??) VALUES (?,?)";
            let table = ["permissionsFW","clients_idclients","fwModel_name",clientid,model];
            query = mysql.format(query,table);
            conn.query(query,function(err,rows){
              db.close_db_connection(conn);
              if(err){
                // delete previous row
                cb(err.sqlMessage,null);
              }else cb(null,rows);
            });
          }
        });
      }
    });
  },

  deleteModel : (clientid,model,cb)=>{

    // do it with promises

    // delete permissionsFW
    // delete firmwares
    // delete fwModel

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ?";
        let table = ["permissionsFW","fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          }
          else{
            let query = "DELETE FROM ?? where ?? = ?";
            let table = ["fwModel","name",model];
            query = mysql.format(query,table);
            conn.query(query,function(err,rows){
              if(err) return cb(err,null);
              else return cb(null,rows);
            });
          }
        });
      }
    });
  },

  listModelPermission : (model,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select id,clients_idclients from ?? where ?? = ?`;
        var table = ["permissionsFW","fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  grantModelPermission : (clientid,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "select * from ?? where ?? = ? and ?? = ?";
        let table = ["permissionsFW","clients_idclients",clientid,"fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          } else if(rows.length > 0){
            db.close_db_connection(conn);
            return cb("This client already has permission for this model",null);
          } else{
            let query = "INSERT INTO ?? (??,??) VALUES (?,?)";
            let table = ["permissionsFW","clients_idclients","fwModel_name",clientid,model];
            query = mysql.format(query,table);
            conn.query(query,function(err,rows){
              db.close_db_connection(conn);
              if(err) cb(err,null);
              else cb(null,rows);
            });
          }
        });
      }
    });
  },

  removeModelPermission : (id,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ? and ?? = ?";
        let table = ["permissionsFW","id",id,"fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) return cb(err,null);
          else return cb(null,rows);
        });
      }
    });
  },

  checkModelOwnership : (clientid,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ?? where ?? = ? and ?? = ?`;
        var table = ["fwModel","owner",clientid,"name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,false);
          else if(rows.length > 0) cb(null,true);
          else cb(null,false);
        });
      }
    });
  },

  checkModelAccess : (clientid,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from ?? where ?? = ? and ?? = ?`;
        var table = ["permissionsFW","clients_idclients",clientid,"fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,false);
          else if(rows.length > 0) cb(null,true);
          else cb(null,false);
        });
      }
    });
  },

};
