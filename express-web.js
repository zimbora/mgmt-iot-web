var path = require('path');
var express = require('express');
const session = require('express-session');
var expressValidation = require('express-validation');
var useragent = require('express-useragent');
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
var httpStatus = require('http-status-codes');
const fs = require('fs');
const async = require('async');

var auth = require('./server/controllers/auth');
var routes = require('./server/routes');
var validate = require('./server/controllers/params_validator');
var user = require('./server/controllers/users');
var client = require('./server/controllers/clients');
var firmware = require('./server/controllers/firmwares');
var model = require('./server/controllers/models');

var Device = require('./server/models/devices');
var User = require('./server/models/users');
var Client = require('./server/models/clients');
var Project = require('./server/models/projects');
var Model = require('./server/models/models');
var Firmware = require('./server/models/firmwares');

var serveIndex = require('serve-index'); // well known

const app = express();

var config = require('./config/env');

app.use(useragent.express());
app.use(bodyParser.json());

app.use(session({
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);

app.get('/api/firmware/:fwId/download',auth.fw_check_token,firmware.get)

app.use('/api', auth.api_check_authentication,routes);

app.use('/api', (req,res) => {
  res.status(httpStatus.BAD_GATEWAY)
    .json({
      status: "error",
      message: 'path not available'
    });
});

app.set('view engine', 'ejs');  // set the view engine to ejs

app.use('*/assets', express.static(path.join(__dirname, config.public_path+'/assets')))

app.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  //log.debug("platform:",req.device.platform);
  log.debug(fullUrl);
  next();
});

app.post('/login',validate.body([{
    param_key: 'user',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  },{
    param_key: 'password',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  }]),auth.authenticate,auth.generateToken,auth.respondJWT);

app.post('/login/google/user',validate.body([{
    param_key: 'token',
    required: true,
    type: 'string',
    validator_functions: [(param) => {return param.length > 1}]
  }]),auth.authenticate_google,auth.generateToken,auth.respondJWT);

app.use(auth.check_authentication,(req,res,next)=>{
  if(!req.user){
    log.warn("not authenticated")
    //res.render(path.join(__dirname, config.public_path+'/views/pages/login'));
    res.render(path.join(__dirname, config.public_path+'/views/pages/login'),{googleclientID:config.googleClientId});
  }else{
    next()
  }
});

app.use('*/js',express.static(path.join(__dirname, config.public_path+'/js')))
app.use('*/lib',express.static(path.join(__dirname, config.public_path+'/lib')))
app.use('*/files',express.static(path.join(__dirname, config.public_path+'/files')))

app.get('*/moment.js',(req,res)=>{
  //fs.readFile(config.public_path+"/js/moment.js", function(err, data) {
  fs.readFile("node_modules/moment/dist/moment.js", function(err, data) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error loading module');
    } else {
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(data);
    }
  });
});

app.get('/logout',(req,res)=>{
  let host = req.protocol + '://' + req.get('host');
  auth.deauth(req,res,(req,res)=>{
    res.redirect(host +'/home');
  });
});

// --- HOME ---
app.get('/home',(req,res)=>{

  let clients = [];
  let users = [];
  let projects = [];
  let models = [];
  let firmwares = [];

  if(req.user.level >= 4){
    User.list((err,rows)=>{
      users = rows
    });
    Client.list((err,rows)=>{
      clients = rows
    });
    Project.list((err,rows)=>{
      projects = rows;
    });
    Model.list((err,rows)=>{
      models = rows;
    });
    Firmware.list((err,rows)=>{
      firmwares = rows
    });
  }else{
    Model.listWithClientPermission(req.user.client_id,(err,rows)=>{
      models = rows;
    });
    Firmware.listWithClientPermission(req.user.client_id,(err,rows)=>{
      firmwares = rows
    });
  }

  setTimeout(()=>{
    Client.getMqttCredentials(req.user.client_id,(err,mqtt)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/dashboard'),{
          user:req.user,
          mqtt:mqtt,
          users:users?.length,
          clients:clients?.length,
          projects:projects?.length,
          models:models?.length,
          firmwares:firmwares?.length,
          container:config.container,
          page:'Dashboard'
        });
    });
  },100);

});

// --- users ---
/*
app.get('/users',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/users_list',{user:req.user,page:'Users'}));
});

app.get('/user/:user_id',(req,res)=>{
  res.json({'msg':'In development'});
});
*/

// --- mqtt users ---
app.get('/users',(req,res)=>{
  if(req.user.level >= 4)
    res.render(path.join(__dirname, config.public_path+'/views/pages/users_list'),{user:req.user,page:'Users'});
});
// --- ----- ---

// --- mqtt clients ---
app.get('/clients',(req,res)=>{
  if(req.user.level >= 4)
    res.render(path.join(__dirname, config.public_path+'/views/pages/clients_list'),{user:req.user,page:'Clients'});
});

app.get('/client/:client_id',(req,res)=>{
  if(req.user.level >= 4){
    if(req.originalUrl.endsWith("/"))
      res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "access");
    else
      res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/access");
  }
});

app.get('/client/:client_id/access',(req,res,next)=>{
//app.get('/client/:client_id/access',(req,res,next)=>{
  if(req.user.level >= 4)
    res.render(path.join(__dirname, config.public_path+'/views/pages/client/access'),{user:req.user,page:'Access'});
});

// --- firmwares ---
app.get('/models',(req,res)=>{
  if(req.user.level >= 2){
    if(req.user.level >= 4){
      Model.list((err,models)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/models_list'),{user:req.user,models:models,page:'Models'});
      });
    }else{
      Model.listWithClientPermission(req.user.client_id,(err,models)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/models_list'),{user:req.user,models:models,page:'Models'});
      });
    }
  }
});

// --- models ---
app.use('/model/:model_id',(req,res,next)=>{
  console.log("model_id:",req.params.model_id);
  Model.getModelById(req.params.model_id,(err,model)=>{
    req.model = model.name;
    next();
  })

})

app.get('/model/:model_id/devices',(req,res)=>{
  if(req.user.level >= 2){
    if(req.user.level >= 4){
      Device.list(req.params.model_id,(err,devices)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/model/devices'),{model:req.model,devices:devices,user:req.user,page:'Devices'});
      })
    }else{
      Device.list(req.params.model_id,req.user.client_id,(err,devices)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/model/devices'),{model:req.model,devices:devices,user:req.user,page:'Devices'});
      })
    }
  }
});

app.get('/model/:model_id/firmwares',(req,res)=>{
  if(req.user.level >= 2){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/firmwares'),{model:req.model,user:req.user,page:'Firmwares'});
  }
});

app.get('/model/:model_id/access',model.checkOwnership,(req,res)=>{
  if(req.user.level >= 2){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/access'),{model:req.model,user:req.user,page:'Access'});
  }
});

// --- devices ---

app.get('/devices',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/devices_list'),{user:req.user,page:'Devices'});
});

app.use('/device/:device_id',client.checkDeviceAccess,(req,res,next)=>{next()});

app.get('/device/:device_id',(req,res)=>{
//app.get('/device/:device_id',(req,res)=>{
  if(req.originalUrl.endsWith("/"))
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "dashboard");
  else
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/dashboard");
});

//app.get('/device/:device_id/dashboard',(req,res)=>{

app.get('/device/:device_id/settings',(req,res)=>{
  let device = null;
  let devices = [];
  let mqtt = null;
  async.waterfall([
    (cb)=>{
      Device.getInfo(req.params.device_id,(err,row)=>{
        device = row;
        cb(err);
      });
    },
    (cb)=>{
      Client.getMqttCredentials(req.user.client_id,(err,row)=>{
        mqtt = row;
        cb(err);
      });
    },
    (cb)=>{
      if(req.user.level <= 4){
        Device.list(device.model_id,req.user.client_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }else{
        Device.list(device.model_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }
    },
  ],(err)=>{
    if(!err && device != null && mqtt != null)
      res.render(path.join(__dirname, config.public_path+'/views/pages/device/settings'),{device:device,devices:devices,mqtt:mqtt,user:req.user,page:'Settings'});
    else
      res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/devices");
  })
});

app.get('/device/:device_id/access',(req,res)=>{
  Device.getInfo(req.params.device_id,(err,device)=>{
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/access'),{device:device,user:req.user,page:'Access'});
  });
});

app.get('/device/:device_id/autorequests',(req,res)=>{
  let device = null;
  let devices = [];
  let mqtt = null;
  async.waterfall([
    (cb)=>{
      Device.getInfo(req.params.device_id,(err,row)=>{
        device = row;
        cb(err);
      });
    },
    (cb)=>{
      Client.getMqttCredentials(req.user.client_id,(err,row)=>{
        mqtt = row;
        cb(err);
      });
    },
    (cb)=>{
      if(req.user.level <= 4){
        Device.list(device.model_id,req.user.client_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }else{
        Device.list(device.model_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }
    },
  ],(err)=>{
    if(device != null && mqtt != null)
        res.render(path.join(__dirname, config.public_path+'/views/pages/device/autorequests'),{device:device,devices:devices,mqtt:mqtt,user:req.user,page:'Autorequests'});
      else
        res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/devices");
  });
});

app.get('/device/:device_id/alarms',(req,res)=>{
  let device = null;
  let devices = [];
  let mqtt = null;
  async.waterfall([
    (cb)=>{
      Device.getInfo(req.params.device_id,(err,row)=>{
        device = row;
        cb(err);
      });
    },
    (cb)=>{
      Client.getMqttCredentials(req.user.client_id,(err,row)=>{
        mqtt = row;
        cb(err);
      });
    },
    (cb)=>{
      if(req.user.level <= 4){
        Device.list(device.model_id,req.user.client_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }else{
        Device.list(device.model_id,(err,rows)=>{
          devices = rows;
          cb(err);
        });
      }
    },
  ],(err)=>{
    if(device != null && mqtt != null)
        res.render(path.join(__dirname, config.public_path+'/views/pages/device/alarms'),{device:device,devices:devices,mqtt:mqtt,user:req.user,page:'Alarms'});
      else
        res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/devices");
  });
});

app.get('/device/:device_id/jscode',(req,res)=>{
  Device.getInfo(req.params.device_id,(err,device)=>{
    Client.getMqttCredentials(req.user.client_id,(err,mqtt)=>{
      if(device != null && mqtt != null)
        res.render(path.join(__dirname, config.public_path+'/views/pages/device/jscode'),{device:device,mqtt:mqtt,user:req.user,page:'JSCODE'});
      else
        res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/devices");
    })
  });
});

if(typeof middleware !== 'undefined')
  app.use(middleware);
else{
  app.use((req,res,next)=>{
    res.redirect(req.protocol + '://' + req.get('host') +'/home');
  });
}
/*

app.use((err, req, res, next) => {
  if (err instanceof expressValidation.ValidationError) {
    res.status(err.status).json(err);
  } else {
    res.status(500)
      .json({
        status: err.status,
        message: err.message
      });
  }
});
*/

module.exports = app;
