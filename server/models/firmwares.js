var path = require('path');
const fs = require('fs')
var mysql = require('mysql2');
var db = require('../controllers/db');
var CryptoJS = require("crypto-js");

module.exports =  {

  getFirmwareToken : (api_token,cb)=>{

    return cb(false,false);
    /*
    db.getConnection((err,conn) => {
      if(err) cb(err,null)
      else{
        var query = `select users.level,users.idusers,clients.idclients from ?? inner join clients where clients.api_token = ? and users.idusers = clients.users_idusers`;
        var table = ["users",api_token];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(false,rows);
        });
      }
    });
    */
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

  add : (filename,originalname,version,model,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "select * from ?? where ?? = ? and ?? = ?";
        let table = ["firmwares","version",version,"fwModel_name",model];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null)
          }else if(rows.length > 0){
            db.close_db_connection(conn);
            return cb("this version already exists for this model, try increase it",null)
          }else{
            let query = "INSERT INTO ?? (??,??,??,??) VALUES (?,?,?,?)";
            let table = ["firmwares","filename","originalname","version","fwModel_name",filename,originalname,version,model];
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

            try {
              let file_path = path.join(__dirname, "../"+config.public_path+"/firmwares/"+rows[0].filename);
              fs.unlinkSync(file_path)
              console.log("file removed");
              let query = "DELETE FROM ?? where ?? = ?";
              let table = ["firmwares","id",id];
              query = mysql.format(query,table);
              conn.query(query,function(err,rows){
                db.close_db_connection(conn);
                if(err) return cb(err,null);
                else return cb(null,rows);
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
        let table = ["firmwares","release",release,"id",id];
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
