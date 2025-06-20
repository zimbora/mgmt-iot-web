var path = require('path');
var express = require('express');
var httpStatus = require('http-status-codes');
var config = require('../../config/env');

var users = require('./users');
var clients = require('./clients');
var devices = require('./devices');
var models = require('./models');
//var firmwares = require('./firmwares');
var authRoutes = require('./auth');

var Response = require('../controllers/response');
var User = require('../controllers/users');
var Client = require('../controllers/clients');
var Device = require('../controllers/devices');
var Model = require('../controllers/models');
var Firmware = require('../controllers/firmwares');
var Database = require('../controllers/db');

const router = express.Router();

router.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  req.device = {
    publicIP : req.header('x-forwarded-for') || req.connection.remoteAddress,
    platform : req.headers['user-agent']
  }
  log.trace("route url: "+fullUrl);
  next();
});

/** GET /api-status - Check service status **/
router.get('/api-status', (req, res) =>
  res.status(httpStatus.OK)
    .json({
      Error: false,
      Message: "",
      Result:{
        status: "ok"
      }
    })
);

//router.use('/user', User.checkUserOwnAccess,users);
router.use('/user', users);

router.route('/users',Client.checkAdminAccess)
  .get(User.list)
  .post(User.add)
  .delete(User.delete)
  .put(User.update)

router.use('/client', clients);

router.use('/clients',Client.checkAdminAccess,(req,res,next)=>{next()})

router.route('/clients')
  .get(Client.list)
  .post(Client.add)
  .delete(Client.delete)
  .put(Client.update)

router.use('/device', devices);

router.route('/devices/list')
  .get(Device.list);

router.route('/devices/permissions')
  .get(Device.permissions);

router.use('/model', models);

router.route('/models')
  .get(Model.list)
  .post(Model.add)


//router.use('/firmware',firmwares)

//router.use('/user/:user_id',users); // use it to access to other user content - only for admin
router.use('/auth', authRoutes);

router.route('/mqtt/credentials')
  .get(Client.getMqttCredentials);

router.route('/db/load')
  .get(Database.getLoad);

router.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  log.trace("route not found: "+fullUrl);
  Response.error(res,httpStatus.NOT_FOUND,"request not implemented");
});

module.exports =  router;
