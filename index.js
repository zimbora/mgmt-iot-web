
var web = require('./express-web');

var config = require('./config/env');
var device = require('./server/models/devices.js');
var user = require('./server/models/users');

module.exports = {

  init : (config)=>{

    var db = require('./server/controllers/db');
    db.connect(config,() => {
      db_setup();
      web.listen(config.web_port, () => {
        log.info('Web Server started and listening on port: ' +config.web_port + ' ' + config.env);
      });
      log.info("connected to DB");
    });
  },

  path : ()=>{
    return __dirname+'/server/public/views';
  },

  deviceInfo : (deviceID,cb)=>{
    device.getInfo(deviceID,(err,rows)=>{
      return cb(err,rows);
    })
  }
}

function db_setup(){
  let {user_type,user_pwd,user_lvl} = config.new_client;
  user.addIfNotRegistered(user_type,user_pwd,user_lvl,(err,res)=>{
    if(err) console.log("error registering user type:",config.user_type,err)
  });
}
