var mysql = require('mysql2');
var db = require('../controllers/db');

module.exports =  {

  addClientPermission : (deviceid,clientid,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "INSERT INTO ?? (??) VALUES (?)";
        let table = ["devices","uid",deviceid,user];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  deleteClientPermission : (deviceid,clientid,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ?";
        let table = ["permissions","clients_idclients",deviceid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          }
          else{
            let query = "DELETE FROM ?? where ?? = ?";
            let table = ["devices","uid",deviceid];
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

  updateClientPermission : (deviceid,clientid,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ? where ?? = ?";
        let table = ["clients","users_idusers",user,"idclients",deviceid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // list all devices
  list : (cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select uid,model,fw_version,app_version,status from ??`;
        var table = ["devices"];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // list associated devices
  listAssociated : (user_id,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select uid,model,fw_version,app_version,status from ?? inner join permissions where permissions.clients_idclients = ? and permissions.devices_uid = devices.uid`;
        var table = ["devices", user_id];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // get info of device
  getInfo : (deviceID,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select project,model,fw_version,app_version,status,fw_settings,fw_release from devices where uid = ?`;
        var table = [deviceID]
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // get autorequests of device
  getAutorequests : (deviceID,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select autorequests from devices where uid = ?`;
        var table = [deviceID]
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // get alarms of device
  getAlarms : (deviceID,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select alarms from devices where uid = ?`;
        var table = [deviceID]
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // get jscode of device
  getJSCode : (deviceID,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select js_program from devices where uid = ?`;
        var table = [deviceID]
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  // get clients with access to this device
  getClientsWithAccess : (deviceID,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select clients_idclients,level from permissions inner join devices where permissions.devices_uid = ? and permissions.devices_uid = devices.uid`;
        var table = [deviceID]
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  updateDeviceRelease : (deviceid,release,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ? where ?? = ?";
        let table = ["devices","fw_release",release,"uid",deviceid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },
};
