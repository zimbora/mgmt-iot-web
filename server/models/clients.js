var mysql = require('mysql2');
var db = require('../controllers/db');
var CryptoJS = require("crypto-js");

module.exports =  {

  get : (id,pwd,cb)=>{

    db.getConnection((err,conn) => {
      if(err) cb(err,null)
      else{
        var query = `select users.level,users.idusers,clients.idclients from ?? inner join clients where clients.idclients = ? and clients.token = ? and users.idusers = clients.users_idusers`;
        var table = ["users",id,pwd];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else if(rows.length > 0) cb(null,rows[0]);
          else{
            if(id == "admin" && pwd == "admin"){
              admin(cb)
            }else cb(null,null)
          }
        });
      }
    });
  },

  getByApiToken : (api_token,cb)=>{

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
  },

  add : (clientid,user,password,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var SHA256 = require("crypto-js/sha256");
        //let api_token = CryptoJS.AES.encrypt('my top secret', 'secret key ultrasecret').toString();
        let message = clientid+"\º~"+password;
        let key = String(Date.now()/3621)
        var api_token = CryptoJS.HmacSHA256(message, key).toString();

        let query = "INSERT INTO ?? (??,??,??,??) VALUES (?,?,?,?)";
        let table = ["clients","idclients","users_idusers","token","api_token",clientid,user,password,api_token];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err) console.log(err)
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  delete : (clientid,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ?";
        let table = ["permissions","clients_idclients",clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          }
          else{
            let query = "DELETE FROM ?? where ?? = ?";
            let table = ["clients","idclients",clientid];
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

  update : (clientid,user,cb)=>{

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
  },

  list : (cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select idclients,timestamp,users_idusers,token,api_token from clients inner join users where users.idusers = clients.users_idusers`;
        var table = [];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  getDevices : (clientid,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select devices_uid,model,fw_version,app_version,status from ?? inner join ?? where ?? = ? and permissions.devices_uid = devices.uid`;
        var table = ["permissions","devices","clients_idclients",clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  addPermission : (clientid,device,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "INSERT INTO ?? (??,??,??) VALUES (?,?,?)";
        let table = ["permissions","clients_idclients","devices_uid","level",clientid,device,level];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err) console.log(err)
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  removePermission : (clientid,device,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ? and ?? = ?";
        let table = ["permissions","clients_idclients",clientid,"devices_uid",device];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) return cb(err,null);
          else return cb(null,rows);
        });
      }
    });
  },

  updatePermission : (clientid,device,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ?, ?? = ? where ?? = ?";
        let table = ["permissions","clients_idclients",clientid,"devices_uid",device];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,null);
          else cb(null,rows);
        });
      }
    });
  },

  checkDeviceAccess : (clientid,level,deviceid,cb)=>{

    if(level >= 4)
      return cb(null,true);
    else{
      db.getConnection((err,conn) => {
        if(err)
          cb(err,null)
        else{
          var query = `select * from ?? where ?? = ? and ?? = ?`;
          var table = ["permissions","clients_idclients",clientid,"devices_uid",deviceid];
          query = mysql.format(query,table);
          conn.query(query,function(err,rows){
            db.close_db_connection(conn);
            if(err) cb(err,false);
            else if(rows.length > 0) cb(null,true);
            else cb(null,false);
          });
        }
      });
    }
  },

  getMqttCredentials : (clientid,cb)=>{
    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select idclients,users.idusers,users.password from ?? inner join users where users.idusers = clients.users_idusers and clients.idclients = ?`;
        var table = ["clients",clientid];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) cb(err,false);
          else cb(false,rows);
        });
      }
    });
  }
};

// check if there is at least one admin registered. If not it creates a temporary one
function admin(cb){

  db.getConnection((err,conn) => {
    if(err) cb(err,null)
    else{
      var query = `select * from ?? inner join users where users.idusers = clients.users_idusers and users.level = 5`;
      var table = ["clients"];
      query = mysql.format(query,table);
      conn.query(query,function(err,rows){
        db.close_db_connection(conn);
        if(err) cb(err,null);
        else if(rows.length == 0){
          let fake_admin = {
            idusers : "admin",
            idclients : "admin",
            level : 5
          }
          cb(null,fake_admin);
        }else cb(null,null);
      });
    }
  });
}
