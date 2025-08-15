var mysql = require('mysql2');
var db = require('../controllers/db');
var CryptoJS = require("crypto-js");
const moment = require('moment');

var self = module.exports =  {

  get : async (nick,pwd,cb)=>{

    let query = `select u.id as user_id,u.level,u.type,c.id as client_id,c.nick,c.name,c.avatar from users as u inner join clients as c where c.nick = ? and c.token = ? and u.id = c.user_id`;
    let table = [nick,pwd];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0) return cb(null,rows[0]);

      if(id == "admin" && pwd == "admin")
        return admin(cb)
      else
        return cb("not registered or password is invalid",null);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getByApiToken : async (api_token,cb)=>{

    let query = `select u.id as user_id,u.level,u.type,c.id as client_id,c.nick,c.name,c.avatar from users as u inner join clients as c where c.api_token = ? and u.id = c.user_id`;
    let table = [api_token];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  add : async (nick,userId,password,cb)=>{

    var SHA256 = require("crypto-js/sha256");
    let message = nick+"\º~"+password;
    let key = String(Date.now()/3621)
    var api_token = CryptoJS.HmacSHA256(message, key).toString();
    
    // Generate MQTT password similar to API token
    let mqtt_message = nick+"_mqtt_"+password;
    let mqtt_key = String(Date.now()/3621 + 1000); // Slightly different key for MQTT
    var mqtt_password = CryptoJS.HmacSHA256(mqtt_message, mqtt_key).toString();

    let obj = {
      nick : nick,
      user_id : userId,
      token : password,
      api_token : api_token,
      mqtt_password : mqtt_password,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("clients",obj)
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

    db.delete("clients",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  update : async (id,userId,password,cb)=>{

    let obj = {
      user_id : userId,
      token : password,
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    let filter = {
      id : id
    };

    db.update("clients",obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (cb)=>{

    let query = `select c.id,c.nick,c.createdAt,c.updatedAt,c.user_id,c.token,c.api_token,c.mqtt_password,u.type from clients as c inner join users as u where u.id = c.user_id`;
    let table = [];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  listHuman : async (cb)=>{

    let query = `select c.id,c.nick,c.createdAt,c.updatedAt,c.user_id,c.token,c.api_token,c.mqtt_password,u.type from clients as c inner join users as u where c.gmail is NOT NULL and u.id = c.user_id`;
    let table = [];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  registerGoogleClient : async (userId,data,cb)=>{

    let index = data.email.indexOf("@");

    let nick = "";
    if(index > -1)
      nick = data.email.substring(0,index);
    else return cb("something is wrong with your email",null);

    self.add(nick,userId,"",(err,res)=>{
      if(err)
        return cb(err,null)

      let obj = {
        gmail: data.email,
        name: data.name,
        avatar: data.picture
      };

      let filter = {
        nick: nick
      };

      db.update("clients",obj,filter)
      .then( rows => {
        if(rows.affectedRows > 0) return cb(null,rows);
        else return cb(null,null);
      })
      .catch( error => {
        return cb(error,null);
      });

    })
  },

  findGoogleClient : async (email,cb)=>{

    let query = `select u.id as user_id,u.level,u.type,c.id as client_id,c.nick,c.name,c.avatar from users as u inner join clients as c where c.gmail = ? and u.id = c.user_id`;
    let table = [email];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0) return cb(null,rows[0]);
      else return cb(null,null);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getDevices : async (clientId,cb)=>{

    let query = `select d.*,p.name as project,m.name as model from devices as d
                inner join projects as p on p.id = d.project_id
                inner join models as m on m.id = d.model_id
                inner join permissions where permissions.client_id = ? and permissions.device_id = d.id
                and permissions.level > 3`;
    let table = [clientId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },
  
  addPermission : async (clientId,deviceId,level,cb)=>{

    let obj = {
      client_id : clientId,
      device_id : deviceId,
      level : level,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert("permissions",obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  removePermission : async (clientId,deviceId,cb)=>{

    let filter = {
      client_id : clientId,
      device_id : deviceId,
    }

    db.delete("permissions",filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updatePermission : async (clientId,deviceId,level,cb)=>{

    let obj = {
      level : level
    };

    let filter = {
      client_id : clientId,
      device_id : deviceId
    };

    db.update("permissions",obj,filter)
    .then (rows => {
      if(rows.affectedRows > 0) return cb(null,rows);
      else return cb(null,null);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  checkDeviceReadAccess : async (clientId,level,deviceId,cb)=>{

    if(level >= 1)
      return cb(null,true);
    else{

      let query = `select * from ?? where ?? = ? and ?? = ?`;
      let table = ["permissions","client_id",clientId,"device_id",deviceId];
      query = mysql.format(query,table);

      db.queryRow(query)
      .then(rows => {
        if(rows.length) return cb(null,true);
        else return cb(null,false);
      })
      .catch(error => {
        return cb(error,false);
      })
    }
  },

  checkDeviceWriteAccess : async (clientId,level,deviceId,cb)=>{

    if(level >= 2)
      return cb(null,true);
    else{

      let query = `select * from ?? where ?? = ? and ?? = ?`;
      let table = ["permissions","client_id",clientId,"device_id",deviceId];
      query = mysql.format(query,table);

      db.queryRow(query)
      .then(rows => {
        if(rows.length) return cb(null,true);
        else return cb(null,false);
      })
      .catch(error => {
        return cb(error,false);
      })
    }
  },

  checkDevicePermissionsAccess : async (clientId,level,deviceId,cb)=>{

    if(level >= 4)
      return cb(null,true);
    else{

      let query = `select * from ?? where ?? = ? and ?? = ?`;
      let table = ["permissions","client_id",clientId,"device_id",deviceId];
      query = mysql.format(query,table);

      db.queryRow(query)
      .then(rows => {
        if(rows.length) return cb(null,true);
        else return cb(null,false);
      })
      .catch(error => {
        return cb(error,false);
      })
    }
  },

  getMqttCredentials : async (clientId,cb)=>{

    let query = `select nick,users.type,users.password from clients inner join users where users.id = clients.user_id and clients.id = ?`;
    let table = [clientId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows.length > 0) return cb(null, rows[0]);
      else return cb(null,null);
    })
    .catch(error => {
      return cb(error,false);
    })
  },

  isAdmin : (level)=>{
    if(level >= 4)
      return true;
    else return false;
  },

};

// check if there is at least one admin registered. If not it creates a temporary one
async function admin(cb){

  var query = `select * from ?? inner join users where users.id = clients.user_id and users.level = 5`;
  var table = ["clients"];
  query = mysql.format(query,table);

  db.queryRow(query)
  .then(rows => {
    if(rows.length == 0){
      let fake_admin = {
        idusers : "admin",
        idclients : "admin",
        level : 5
      }
      cb(null,fake_admin);
    }else cb(null,null);
  })
  .catch(error => {
    return cb(error,false);
  })

}
