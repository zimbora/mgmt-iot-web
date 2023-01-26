
var web = require('./express-web');

var device = require('./server/models/devices.js');

module.exports = {

  init : (config)=>{

    var db = require('./server/controllers/db');
    db.connect(config,() => {
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
