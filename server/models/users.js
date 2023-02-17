var mysql = require('mysql2');
var db = require('../controllers/db');

var self = module.exports = {

  add : (user,pwd,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "INSERT INTO ?? (??,??,??) VALUES (?,?,?)";
        let table = ["users","idusers","password","level",user,pwd,level];
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

  delete : (user,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "DELETE FROM ?? where ?? = ?";
        let table = ["users","idusers",user];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          if(err){
            db.close_db_connection(conn);
            return cb(err,null);
          }else{
            return cb(null,rows);
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

  update : (user,pwd,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        let query = "UPDATE ?? set ?? = ?, ??=? where ?? = ?";
        let table = ["users","password",pwd,"level",level,"idusers",user];
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
        var query = `select * from users`;
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

  addIfNotRegistered : (user,pwd,level,cb)=>{

    db.getConnection((err,conn) => {
      if(err)
        cb(err,null)
      else{
        var query = `select * from users where idusers = ?`;
        var table = [user];
        query = mysql.format(query,table);
        conn.query(query,function(err,rows){
          db.close_db_connection(conn);
          if(err) return cb(err,null);
          else if(rows != null && rows.length == 0){
            self.add(user,pwd,level,(err,res)=>{
              return cb(err,res);
            })
          } else return cb(null,rows);
        });
      }
    });
  }
};
