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

const packageJson = require(__dirname+'/package.json');
const packageVersion = packageJson.version;

var auth = require('./server/controllers/auth');
var routes = require('./server/routes');
var validate = require('./server/controllers/params_validator');
var user = require('./server/controllers/users');
var client = require('./server/controllers/clients');
var firmware = require('./server/controllers/firmwares');
var project = require('./server/controllers/projects');
var model = require('./server/controllers/models');

var Device = require('./server/models/devices');
var User = require('./server/models/users');
var Client = require('./server/models/clients');
var Project = require('./server/models/projects');
var Model = require('./server/models/models');
var Firmware = require('./server/models/firmwares');
var Sensor = require('./server/models/sensors');

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

//app.get('/api/firmware/:fwId/download',auth.fw_check_token,firmware.get)
app.get('/api/firmware/:fwId/download',firmware.get)

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
    req.user.mgmt_iot_web_version = packageVersion;
    req.user.mgmt_iot_version = mgmt_iot_version;
    next()
  }
});

app.use('*/js',express.static(path.join(__dirname, config.public_path+'/js')))
app.use('*/lib',express.static(path.join(__dirname, config.public_path+'/lib')))
app.use('*/files',express.static(path.join(__dirname, config.public_path+'/files')))

app.get('*/moment.js',(req,res)=>{
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

app.get('*/moment-locales.js',(req,res)=>{
  fs.readFile("node_modules/moment/min/moment-with-locales.js", function(err, data) {
    if (err) {
      res.writeHead(500, {'Content-Type': 'text/plain'});
      res.end('Error loading module');
    } else {
      res.writeHead(200, {'Content-Type': 'application/javascript'});
      res.end(data);
    }
  });
});

app.get('*/locale/*',(req,res)=>{
  fs.readFile("node_modules/moment/locale/pt.js", function(err, data) {
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


// --- projects ---
app.get('/projects',(req,res)=>{
  if(req.user.level >= 2){
    if(req.user.level >= 4){
      Project.list((err,projects)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/projects_list'),{user:req.user,projects:projects,page:'Projects'});
      });
    }else{
      Project.listWithClientPermission(req.user.client_id,(err,projects)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/projects_list'),{user:req.user,projects:projects,page:'Projects'});
      });
    }
  }
});

app.use('/project/:project_id',(req,res,next)=>{
  Project.getById(req.params.project_id,(err,project)=>{
    req.project = project;
    next();
  })
})

app.get('/project/:project_id/models',(req,res)=>{
  
  project.checkAccess(req,res,()=>{
    Project.getModels(req.params?.project_id,(err,models)=>{
      res.render(path.join(__dirname, config.public_path+'/views/pages/project/models'),{project:req.project,models:models,user:req.user,page:'ProjectModels'});
    })
  });
});

app.get('/project/:project_id/access',project.checkOwnership,(req,res)=>{
  if(req.user.level >= 4){
    res.render(path.join(__dirname, config.public_path+'/views/pages/project/access'),{project:req.project,user:req.user,page:'ProjectAccess'});
  }
});

app.get('/project/:project_id/settings',project.checkOwnership,(req,res)=>{
  if(req.user.level >= 4){
    res.render(path.join(__dirname, config.public_path+'/views/pages/project/settings'),{project:req.project,user:req.user,page:'ProjectSettings'});
  }
});

app.get('/project/:project_id/sensors',(req,res)=>{
  if(req.user.level >= 4 ){
    res.render(path.join(__dirname, config.public_path+'/views/pages/project/sensors'),{project:req.project,user:req.user,page:'ProjectSensors'});
  }
});

app.get('/project/:project_id/templates',(req,res)=>{
  
  project.checkAccess(req,res,()=>{
    Project.getTemplates(req.params?.project_id,(err,templates)=>{
      res.render(path.join(__dirname, config.public_path+'/views/pages/project/templates'),{project:req.project,templates:templates,user:req.user,page:'ProjectTemplates'});
    })
  });
});

app.get('/project/:project_id/templates/:template_id/edit',(req,res)=>{
  
  project.checkAccess(req,res,()=>{
    // For now, redirect back to templates list since edit functionality is not implemented
    res.redirect('/project/' + req.params.project_id + '/templates');
  });
});

// --- models ---
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

app.use('/model/:model_id',(req,res,next)=>{
  Model.getModelById(req.params.model_id,(err,model)=>{
    req.model = model;
    next();
  })

})

app.get('/model/:model_id/devices',(req,res)=>{
  if(req.user.level >= 2){
    if(req.user.level >= 4){
      Device.list(req.params.model_id,null,(err,devices)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/model/devices'),{model:req.model,devices:devices,user:req.user,page:'Devices'});
      })
    }else{
      Device.list(req.params.model_id,req.user.client_id,(err,devices)=>{
        res.render(path.join(__dirname, config.public_path+'/views/pages/model/devices'),{model:req.model,devices:devices,user:req.user,page:'Devices'});
      })
    }
  }
});

app.get('/model/:model_id/access',model.checkOwnership,(req,res)=>{
  if(req.user.level >= 4){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/access'),{model:req.model,user:req.user,page:'Access'});
  }
});

app.get('/model/:model_id/settings',model.checkOwnership,(req,res)=>{
  if(req.user.level >= 4){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/settings'),{model:req.model,user:req.user,page:'Settings'});
  }
});

app.get('/model/:model_id/sensors',(req,res)=>{
  if(req.user.level >= 4 ){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/sensors'),{model:req.model,user:req.user,page:'Sensors'});
  }
});

app.get('/model/:model_id/firmwares',(req,res)=>{
  if(req.user.level >= 4 && req.model?.fw_enabled){
    res.render(path.join(__dirname, config.public_path+'/views/pages/model/firmwares'),{model:req.model,user:req.user,page:'Firmwares'});
  }
});


// --- devices ---

app.get('/devices',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/devices_list'),{user:req.user,page:'Devices'});
});

app.use('/device/:device_id',client.checkDeviceReadAccess,(req,res,next)=>{

  if(! (req.originalUrl.endsWith(".js") || req.originalUrl.endsWith(".mjs")) ){
    collectData(req,(err,data)=>{
      req.user.data = data;
      next()
    });
  }else next()
});

app.get('/device/:device_id',(req,res)=>{
  if(req.originalUrl.endsWith("/"))
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "dashboard");
  else
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/dashboard");
});

//app.get('/device/:device_id/dashboard',(req,res)=>{

app.get('/device/:device_id/sensors',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.model){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/sensors'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'Sensors'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
});

app.get('/device/:device_id/settings',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.model){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/settings'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'Settings'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
});

app.get('/device/:device_id/access',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.model){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/access'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'Access'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
});

app.get('/device/:device_id/autorequests',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.modelFeat?.ar_enabled){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/autorequests'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'Autorequests'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
});

app.get('/device/:device_id/alarms',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.modelFeat?.alarms_enabled){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/alarms'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'Alarms'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
});

app.get('/device/:device_id/jscode',(req,res)=>{

  let data = req.user.data;
  if(data.device != null && data.mqtt != null && data.modelFeat?.js_code_enabled){
    res.render(path.join(__dirname, config.public_path+'/views/pages/device/jscode'),{
      project_name:data.project_name,
      model_name:data.model_name,
      device:data.device,
      project:data.project,
      model:data.model,
      modelFeat:data.modelFeat,
      fw:data.fw,
      sensors:data.sensors,
      mqtt:data.mqtt,
      user:req.user,
      page:'JSCODE'});
  }else{
    res.redirect(req.protocol + '://' + req.get('host') + "/devices");
  }
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

function collectData(req,callback){
  let data ={
    project_name:null,
    model_name:null,
    device:null,
    project:null,
    model:null,
    fw:null,
    sensors:null,
    associated:null,
    ar:null,
    alarms:null,
    mqtt:null,
  }

  async.waterfall([
    (next)=>{
      Device.getInfo(req.params.device_id,(err,row)=>{
        data.project_name = row?.project_name != null ? row.project_name : "";
        data.model_name = row?.model_name != null ? row.model_name : "";
        data.device = row?.device != null ? row.device : {};
        data.project = row?.project != null ? row.project : {};
        data.model = row?.model != null ? row.model : {};
        data.modelFeat = row?.modelFeat != null ? row.modelFeat : {};
        data.fw = row?.fw != null ? row.fw : {};
        data.associated = row?.associated != null ? row.associated : {};
        next(err);
      });
    },
    (next)=>{
      Device.getSensors(req.params.device_id,data.device?.model_id,(err,row)=>{
        data.sensors = row;
        if(err){
          log.warn(`warning - no table for model ${data.device?.model}`);
        }
        next();
      });
    },
    (next)=>{
      Client.getMqttCredentials(req.user.client_id,(err,row)=>{
        data.mqtt = row;
        next(err);
      });
    },
    
  ],(err)=>{
    if(err) log.error(err);
    return callback(err,data);
  })
}
