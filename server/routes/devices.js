var express = require('express');
var config = require('../../config/env');

var Device = require('../controllers/devices')
var Client = require('../controllers/clients')

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

router.use("/:device_id",Client.checkDeviceWriteAccess,(req,res,next)=>{next()})

// protected zone to write access
router.route("/:device_id/release")
  .put(Device.updateDeviceRelease)

router.route("/:device_id/settings")
  .put(Device.updateDeviceSettings)

router.route("/:device_id/project/field")
  .put(Device.updateDeviceProjectField)

router.route("/:device_id/mqtt/message")
  .post(Device.sendMqttMessage)

router.use('/:device_id',Client.checkDevicePermissionsAccess,(req,res,next)=>{next()});

// protected zone to owner or admin
router.route("/:device_id")

  .delete(Device.delete)


module.exports =  router;
