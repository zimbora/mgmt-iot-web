var express = require('express');
var config = require('../../config/env');

var Device = require('../controllers/devices')
var Client = require('../controllers/clients')
var Sensor = require('../controllers/sensors')

const router = express.Router();

router.use((req,res,next) => {
  log.debug("devices route");
  next();
});

// owner/admin access
router.route("/permission",Client.checkDevicePermissionsAccess)
  /** POST /api/device/permission **/
  .post(Device.addClientPermission)
  /** DELETE /api/device/permission **/
  .delete(Device.deleteClientPermission)
  /** PUT /api/device/permission **/
  .put(Device.updateClientPermission)

router.use('/:device_id',Client.checkDeviceReadAccess,(req,res,next)=>{next()});

// protected zone to read access
router.route("/:device_id/psk")

  .get(Device.getPreSharedKey)

// lwm2m
router.route("/:device_id/observations")
  .get(Device.getObservations)

router.route("/:device_id/observation")
  .get(Device.getObservationStatus)
  .put(Device.updateObservationStatus)

router.route("/:device_id/clients")

  .get(Device.getClientsWithAccess)

router.route("/:device_id/info")

  .get(Device.getInfo)

router.route("/:device_id/logs")

  .get(Device.getLogs)

router.route("/:device_id/project/info")

  .get(Device.getProjectInfo)

router.route("/:device_id/project/logs")

  .get(Device.getProjectLogs)

router.route("/:device_id/model/info")

  .get(Device.getModelInfo)

router.route("/:device_id/model/logs")

  .get(Device.getModelLogs)

router.route("/:device_id/fw/info")

  .get(Device.getFwInfo)

router.route("/:device_id/fw/logs")

  .get(Device.getFwLogs)

router.route("/:device_id/sensor")
  .post(Sensor.add)

router.route("/:device_id/sensors")
  .get(Sensor.list)

router.route("/:device_id/sensor/info")

  .get(Device.getSensorInfo)

router.route("/:device_id/sensor/logs")

  .get(Device.getSensorLogs)

router.route("/:device_id/autorequests")

  .get(Device.getAutorequests)

router.route("/:device_id/alarms")

  .get(Device.getAlarms)

router.route("/:device_id/jscode")

  .get(Device.getJSCode)

router.route("/:device_id/objects")

  .get(Device.getLwm2mObjects)

router.route("/:device_id/resources")

  .get(Device.getLwm2mResources)

router.use("/:device_id",Client.checkDeviceWriteAccess,(req,res,next)=>{next()})

// protected zone to write access
router.route("/:device_id/release")
  .put(Device.updateDeviceRelease)

router.route("/:device_id/trigger/fota")
  .post(Device.triggerFota)

router.route("/:device_id/settings")
  .put(Device.updateDeviceSettings)

router.route("/:device_id/project/field")
  .put(Device.updateDeviceProjectField)

router.route("/:device_id/field")
  .put(Device.updateDeviceField)

router.route("/:device_id/mqtt/message")
  .post(Device.sendMqttMessage)

// POST /api/template/:device_id - Add a new object
router.route('/:device_id/lwm2m/object')
  .post(Device.addObject);

// POST /api/template/:device_id - Add a new resource
router.route('/:device_id/lwm2m/resource')
  .post(Device.addResource);

// PUT /api/template/:device_id/:resource_id - Update a resource
router.route('/:device_id/lwm2m/object/:entry_id')
  .put(Device.updateObject);

// PUT /api/template/:device_id/:resource_id - Update a resource
router.route('/:device_id/lwm2m/resource/:entry_id')
  .put(Device.updateResource);

router.route('/:device_id/lwm2m/object/:entry_id')
  .delete(Device.deleteObject);

router.route('/:device_id/lwm2m/resource/:entry_id')
  .delete(Device.deleteResource);

// MQTT topics routes
router.route("/:device_id/mqtt/topics")
  .get(Device.getMqttTopics)

router.route('/:device_id/mqtt/topic')
  .post(Device.addMqttTopic);

router.route('/:device_id/mqtt/topic/:entry_id')
  .put(Device.updateMqttTopic)
  .delete(Device.deleteMqttTopic);
  
router.use('/:device_id',Client.checkDevicePermissionsAccess,(req,res,next)=>{next()});

// protected zone to owner or admin
router.route("/:device_id")

  .delete(Device.delete)


module.exports =  router;
