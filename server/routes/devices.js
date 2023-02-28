var express = require('express');
var config = require('../../config/env');

var Device = require('../controllers/devices')
var Client = require('../controllers/clients')

const router = express.Router();

router.use((req,res,next) => {
  log.debug("devices route");
  next();
});

router.route("/permission",Client.checkAdminAccess)
  /** POST /api/device/permission **/
  .post(Device.addClientPermission)
  /** DELETE /api/device/permission **/
  .delete(Device.deleteClientPermission)
  /** PUT /api/device/permission **/
  .put(Device.updateClientPermission)

router.use('/:device_id',Client.checkDeviceAccess,(req,res,next)=>{next()});

// protected zone
router.route("/:device_id")

  .delete(Device.delete)

router.route("/:device_id/clients")

  .get(Device.getClientsWithAccess)

router.route("/:device_id/info")

  .get(Device.getInfo)

router.route("/:device_id/autorequests")

  .get(Device.getAutorequests)

router.route("/:device_id/alarms")

  .get(Device.getAlarms)

router.route("/:device_id/jscode")

  .get(Device.getJSCode)

router.route("/:device_id/release")
  .put(Device.updateDeviceRelease)

module.exports =  router;
