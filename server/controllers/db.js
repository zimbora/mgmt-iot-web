var mysql = require('mysql2');

var config = require('../../config/env');
var httpStatus = require('http-status-codes');
var response = require('./response');

var pool;

var self = module.exports = {


  connect : (config, cb)=>{
    pool      =    mysql.createPool({
        connectionLimit : config.db.conn_limit,
        host     : config.db.host,
        port     : config.db.port,
        user     : config.db.user,
        password : config.db.pwd,
        database : config.db.name,
        debug    : false
    });
    pool.getConnection(function(err,connection){
        if(err) {
          log.error("ISSUE WITH MYSQL \n" + err);
          process.exit(1);
        } else {
          setInterval(function(){self.pingMySQL(connection);}, 3600000); // 1 hour
          connection.on('error', function(err) {
            log.error("Mysql error: "+err.code); // 'ER_BAD_DB_ERROR'
          });
          cb();
        }
    });
  },

  getConnection : (cb)=>{
    pool.getConnection(function(err, connection) {
      cb(err,connection);
    });
  },

  pingMySQL : (connection)=>{
    connection.ping(function (err) {
      if (err) throw err;
      log.debug(String(Date.now())+'Server responded to ping');
    });
  },

  get_non_persistent_db_connection : (db_name,cb)=>{
    let pool2      =    mysql.createPool({
        connectionLimit : config.db.conn_limit,
        host     : config.db.host,
        user     : config.db.user,
        password : config.db.pwd,
        database : db_name,
        debug    :  false,
        multipleStatements: true
    });
    pool2.getConnection(function(err,connection){
      cb(err,connection);
    });
  },

  close_db_connection : (connection)=>{
    if(connection != null){
      connection.destroy();
    }
  },

  getLoad : (req,res,next)=>{

    getLoad((err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  queryRow : async (query)=>{
    return new Promise((resolve,reject) => {

        self.getConnection((err,conn)=>{
          if(err) return reject(err);

          conn.query(query,function(err,rows){
            self.close_db_connection(conn);
            if(err) return reject(err)
            else return resolve(rows);
          });
        });
      });
  },

  insert : async(table,data)=>{

    return new Promise((resolve,reject) => {
      self.getConnection((err,conn)=>{
        if(err) return reject(err);

        let query = "";
        let values = [];

        if(typeof data === "object"){
          const keys = Object.keys(data);
          values = Object.values(data);
          const placeholders = values.map(() => '?').join(', ');
          query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
        }else{
          return reject("data passed is not an object");
        }

        query = mysql.format(query,values);

        conn.query(query,function(err,rows){
          self.close_db_connection(conn);
          if(err) return reject(err)
          else return resolve(rows);
        });
      });
    });
  },

  update : async (table, data, filter) => {

    return new Promise((resolve, reject) => {
      self.getConnection((err, conn) => {
        if (err) return reject(err);

        let query = "";
        let values = [];

        if (typeof data === "object") {
          const keys = Object.keys(data);
          values = Object.values(data);
          query = `UPDATE ${table} SET ${keys.map(key => `${key} = ?`).join(', ')}`;
        } else {
          return reject("data passed is not an object");
        }

        if (typeof filter === "object") {
          const filterKeys = Object.keys(filter);
          const filterValues = Object.values(filter);
          query += ` WHERE ${filterKeys.map(key => `${key} = ?`).join(' AND ')}`;
          values.push(...filterValues);
        } else {
          return reject("filter passed is not an object");
        }

        query = mysql.format(query, values);

        conn.query(query, function (err, rows) {
          self.close_db_connection(conn);
          if (err) return reject(err);
          else return resolve(rows);
        });
      });
    });
  },

  delete : async(table,filter)=>{

    return new Promise((resolve,reject) => {

      self.getConnection((err,conn)=>{
        if(err) return reject(err);

        let query = "";
        if(typeof filter === "object"){
          let values = [];
          query = `DELETE FROM ${table} WHERE `;
          for (let key in filter){
            if(values.length > 0)
              query += " AND ";
            query += key + " = ?"
            values.push(filter[key]);
          }
          query = mysql.format(query,values);
        }else{
          return reject("filter passed is not an object");
        }

        conn.query(query,function(err,rows){
          self.close_db_connection(conn);
          if(err) return reject(err)
          else return resolve(rows);
        });
      });
    });
  },
}

function getLoad(cb){

  self.getConnection((err,conn) => {
    if(err) cb(err,null)
    else{
      /*
      var query = `SELECT @@version,@@max_connections,@@sql_select_limit,@@performance_schema_events_transactions_history_size,@@innodb_io_capacity,@@innodb_io_capacity_max,@@innodb_buffer_pool_load_now,@@innodb_buffer_pool_load_at_startup,@@innodb_api_trx_level;`;
      */
      var query = `SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME IN ('Bytes_sent', 'Bytes_received');`
      var table = [];
      query = mysql.format(query,table);
      conn.query(query,function(err,rows){
        self.close_db_connection(conn);
        if(err) cb(err,null);
        else if(rows.length > 0){
          let sum = Number(rows[0].VARIABLE_VALUE) + Number(rows[1].VARIABLE_VALUE)
          cb(null,sum);
        }
        else cb(null,null);
      });
    }
  });
}
