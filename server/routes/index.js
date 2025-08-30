var path = require('path');
var express = require('express');
var httpStatus = require('http-status-codes');
var config = require('../../config/env');

var users = require('./users');
var clients = require('./clients');
var devices = require('./devices');
var projects = require('./projects');
var models = require('./models');
//var firmwares = require('./firmwares');
var authRoutes = require('./auth');

var Response = require('../controllers/response');
var User = require('../controllers/users');
var Client = require('../controllers/clients');
var Device = require('../controllers/devices');
var Project = require('../controllers/projects');
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
      Message: "Success",
      Result:{
        status: "ok",
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

router.route('/clientsHuman')
  .get(Client.listHuman)

router.route('/devices')
  .get(Device.list)
  .post(Device.add)

router.route('/device/id')
  .get(Device.getId);

router.use('/device', devices);

router.route('/devices/list')
  .get(Device.list);

router.route('/devices/permissions')
  .get(Device.permissions);

router.use('/project', projects);

router.route('/projects')
  .get(Project.list)
  .post(Project.add)
  .delete(Project.delete)

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

// LWM2M Objects and Resources endpoints
router.route('/lwm2m/objects')
  .get((req, res) => {
    // For now, return mock data - in a real implementation this would come from a database
    const mockObjects = [
      { objectId: 0, name: 'LWM2M Security', description: 'Security object for bootstrap and registration' },
      { objectId: 1, name: 'LWM2M Server', description: 'Server object for device management' },
      { objectId: 2, name: 'Access Control', description: 'Access control for resources' },
      { objectId: 3, name: 'Device', description: 'Device information object' },
      { objectId: 4, name: 'Connectivity Monitoring', description: 'Network connectivity monitoring' },
      { objectId: 5, name: 'Firmware Update', description: 'Firmware update management' },
      { objectId: 6, name: 'Location', description: 'Device location information' },
      { objectId: 7, name: 'Connectivity Statistics', description: 'Network connectivity statistics' }
    ];
    
    Response.send(res, mockObjects);
  });

router.route('/lwm2m/resources')
  .get((req, res) => {
    const objectId = req.query.objectId;
    
    // Mock resources based on object ID - in a real implementation this would come from a database
    let mockResources = [];
    
    switch(parseInt(objectId)) {
      case 3: // Device object
        mockResources = [
          { resourceId: 0, name: 'Manufacturer', type: 'String', description: 'Human readable manufacturer name' },
          { resourceId: 1, name: 'Model Number', type: 'String', description: 'Model identifier string' },
          { resourceId: 2, name: 'Serial Number', type: 'String', description: 'Serial number of the device' },
          { resourceId: 3, name: 'Firmware Version', type: 'String', description: 'Current firmware version' },
          { resourceId: 9, name: 'Battery Level', type: 'Integer', description: 'Battery level 0-100%' },
          { resourceId: 10, name: 'Memory Free', type: 'Integer', description: 'Free memory in bytes' },
          { resourceId: 11, name: 'Error Code', type: 'Integer', description: 'Error code if any' },
          { resourceId: 13, name: 'Current Time', type: 'Time', description: 'Current UNIX time' },
          { resourceId: 16, name: 'Supported Binding', type: 'String', description: 'Supported binding and modes' }
        ];
        break;
      case 4: // Connectivity Monitoring
        mockResources = [
          { resourceId: 0, name: 'Network Bearer', type: 'Integer', description: 'Network bearer type' },
          { resourceId: 1, name: 'Radio Signal Strength', type: 'Integer', description: 'Signal strength in dBm' },
          { resourceId: 2, name: 'Link Quality', type: 'Integer', description: 'Link quality 0-100%' },
          { resourceId: 4, name: 'IP Addresses', type: 'String', description: 'List of IP addresses' },
          { resourceId: 5, name: 'Router IP Addresses', type: 'String', description: 'List of router IP addresses' },
          { resourceId: 8, name: 'Cell ID', type: 'Integer', description: 'Cell tower identifier' }
        ];
        break;
      case 5: // Firmware Update
        mockResources = [
          { resourceId: 0, name: 'Package', type: 'Opaque', description: 'Firmware package' },
          { resourceId: 1, name: 'Package URI', type: 'String', description: 'URI for firmware package' },
          { resourceId: 2, name: 'Update', type: 'Execute', description: 'Execute firmware update' },
          { resourceId: 3, name: 'State', type: 'Integer', description: 'Firmware update state' },
          { resourceId: 5, name: 'Update Result', type: 'Integer', description: 'Result of update operation' },
          { resourceId: 6, name: 'PkgName', type: 'String', description: 'Name of firmware package' },
          { resourceId: 7, name: 'PkgVersion', type: 'String', description: 'Version of firmware package' }
        ];
        break;
      case 6: // Location
        mockResources = [
          { resourceId: 0, name: 'Latitude', type: 'Float', description: 'Latitude coordinate' },
          { resourceId: 1, name: 'Longitude', type: 'Float', description: 'Longitude coordinate' },
          { resourceId: 2, name: 'Altitude', type: 'Float', description: 'Altitude in meters' },
          { resourceId: 3, name: 'Radius', type: 'Float', description: 'Uncertainty radius in meters' },
          { resourceId: 4, name: 'Velocity', type: 'Opaque', description: 'Velocity information' },
          { resourceId: 5, name: 'Timestamp', type: 'Time', description: 'Timestamp of location fix' }
        ];
        break;
      default:
        mockResources = [
          { resourceId: 0, name: 'Resource 0', type: 'String', description: 'Sample resource 0' },
          { resourceId: 1, name: 'Resource 1', type: 'Integer', description: 'Sample resource 1' }
        ];
    }
    
    Response.send(res, mockResources);
  });

// Template Resource Management
router.route('/template/:template_id/resource')
  .post((req, res) => {
    const templateId = req.params.template_id;
    const { objectId, resourceId } = req.body;
    
    // In a real implementation, this would insert into template_resources table
    // For now, just return success
    Response.send(res, { 
      message: 'Template resource added successfully',
      templateId,
      objectId,
      resourceId 
    });
  })
  .delete((req, res) => {
    const templateId = req.params.template_id;
    const { objectId, resourceId } = req.body;
    
    // In a real implementation, this would delete from template_resources table
    // For now, just return success
    Response.send(res, { 
      message: 'Template resource removed successfully',
      templateId,
      objectId,
      resourceId 
    });
  });

router.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  log.trace("route not found: "+fullUrl);
  Response.error(res,httpStatus.NOT_FOUND,"request not implemented");
});

module.exports =  router;
