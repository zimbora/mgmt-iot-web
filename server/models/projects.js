var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

var tableName = "projects";
var tablePermissions = "projectPermissions";

var self = module.exports = {
  
  getById : async (project_id,cb)=>{

    var query = `select * from ?? where id = ?`;
    var table = [tableName,project_id];
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
      var query = `select id from ?? where name = ?`;
      var table = [tableName, name];
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

  add : async(name,description,uid_prefix,uid_length,cb)=>{

    let obj = {
      name : name,
      description : description,
      uidPrefix : uid_prefix,
      uidLength : uid_length,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }

    db.insert(tableName,obj)
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

    db.delete(tableName,filter)
    .then (rows => {
      let filter = {
        project_id : id,
      }
      db.delete(tablePermissions,filter)
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

    db.update(tableName,obj,filter)
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

    db.update(tableName,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (cb)=>{

    var query = `select * from ??`;
    var table = [tableName];
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

    var query = `select m.* from ?? as m inner join ?? as mp where mp.client_id = ? and mp.project_id = m.id`;
    var table = [tableName, tablePermissions, clientid];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  listPermissions : (projectId,cb)=>{

    var query = `select c.nick,p.id,p.client_id,p.level from ?? as p inner join clients as c where ?? = ? and p.client_id = c.id`;
    var table = [tablePermissions, "project_id",projectId];
    query = mysql.format(query,table);
    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  grantPermission : (clientId,level,projectId,cb)=>{

    let query = "select * from ?? where ?? = ? and ?? = ?";
    let table = [tablePermissions,"client_id",clientId,"project_id",projectId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows?.length > 0){
        return cb("This client already has permission for this project",null);
      }else{
        let obj = {
          client_id : clientId,
          project_id : projectId,
          level: level,
          createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
          updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }
        db.insert(tablePermissions,obj)
        .then (rows => {
          return cb(null,rows);
        })
        .catch(error => {
          console.log(error);
          return cb(error,null);
        });
      }
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  updatePermission : (clientId,level,projectId,cb)=>{

    let query = "select * from ?? where ?? = ? and ?? = ?";
    let table = [tablePermissions,"client_id",clientId,"project_id",projectId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      if(rows?.length > 0){
        let obj = {
          level: level,
          updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
        }
        let filter = {
          client_id : clientId,
          project_id : projectId,
        };

        db.update(tablePermissions,obj,filter)
        .then (rows => {
          return cb(null,rows);
        })
        .catch(error => {
          return cb(error,null);
        });
      }else{
        return cb("Client has no permission set for this project",null);
      }
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  removePermission : (clientId,projectId,cb)=>{

    let filter = {
      client_id : clientId,
      project_id : projectId,
    }

    db.delete(tablePermissions,filter)
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
    var table = [tableName,"createdBy",nick,"name",name];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  checkAccess : (clientId,projectId,cb)=>{

    var query = `select * from ?? where ?? = ? and ?? = ?`;
    var table = [tablePermissions,"client_id",clientId,"project_id",projectId];
    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getModels : (projectId,cb)=>{

    var query = `select * from ?? where ?? = ?`;
    var table = ["models","project_id",projectId];
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
