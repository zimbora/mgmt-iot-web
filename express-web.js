var path = require('path');
var express = require('express');
const session = require('cookie-session');
var expressValidation = require('express-validation');
var useragent = require('express-useragent');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var httpStatus = require('http-status-codes');

var auth = require('./server/controllers/auth');
var routes = require('./server/routes');
var validate = require('./server/controllers/params_validator');
var user = require('./server/controllers/users');
var client = require('./server/controllers/clients');
var firmware = require('./server/controllers/firmwares');

var serveIndex = require('serve-index'); // well known

const app = express();

var config = require('./config/env');

app.use(useragent.express());
app.use(bodyParser.json());

app.use(session({secret: config.jwtSecret}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


app.get('api/firmware',firmware.get)

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

app.use(auth.check_authentication,(req,res,next)=>{
  if(!req.user){
    log.warn("not authenticated")
    //res.render(path.join(__dirname, config.public_path+'/views/pages/login'));
    res.render(path.join(__dirname, config.public_path+'/views/pages/login'));
  }else{
    next()
  }
});

app.use('*/js',express.static(path.join(__dirname, config.public_path+'/js')))
app.use('*/lib',express.static(path.join(__dirname, config.public_path+'/lib')))
app.use('*/files',express.static(path.join(__dirname, config.public_path+'/files')))

app.get('/logout',(req,res)=>{
  let host = req.protocol + '://' + req.get('host');
  auth.deauth(req,res,(req,res)=>{
    res.redirect(host +'/home');
  });
});

// --- HOME ---
app.get('/home',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/dashboard'),{user:req.user,page:'Dashboard'});
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
app.get('/firmwares',(req,res)=>{
  if(req.user.level >= 2)
    res.render(path.join(__dirname, config.public_path+'/views/pages/fw_models'),{user:req.user,page:'Firmwares'});
});

app.get('/firmware/:model_id/list',(req,res)=>{
  if(req.user.level >= 2)
    res.render(path.join(__dirname, config.public_path+'/views/pages/firmware/list'),{user:req.user,page:'FwList'});
});

app.get('/firmware/:model_id/access',firmware.checkModelOwnership,(req,res)=>{
  if(req.user.level >= 2)
    res.render(path.join(__dirname, config.public_path+'/views/pages/firmware/access'),{user:req.user,page:'FwAccess'});
});

// --- devices ---

app.get('/devices',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/devices_list'),{user:req.user,page:'Devices'});
});

app.use('/device/:device_id',client.checkDeviceAccess,(req,res,next)=>{next()});

app.get('/device/:device_id',(req,res)=>{
//app.get('/device/:device_id',(req,res)=>{
  if(req.originalUrl.endsWith("/"))
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "settings");
  else
    res.redirect(req.protocol + '://' + req.get('host') + req.originalUrl + "/settings");
});

//app.get('/device/:device_id/dashboard',(req,res)=>{

app.get('/device/:device_id/settings',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/settings'),{user:req.user,page:'Settings'});
});

app.get('/device/:device_id/access',(req,res)=>{
  console.log("access granted")
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/access'),{user:req.user,page:'Access'});
});

app.get('/device/:device_id/autorequests',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/autorequests'),{user:req.user,page:'Autorequests'});
});

app.get('/device/:device_id/alarms',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/alarms'),{user:req.user,page:'Alarms'});
});

app.get('/device/:device_id/jscode',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/jscode'),{user:req.user,page:'JSCODE'});
});

app.get('/device/:device_id/rs485',(req,res)=>{
  res.render(path.join(__dirname, config.public_path+'/views/pages/device/rs485'),{user:req.user,page:'RS485'});
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
