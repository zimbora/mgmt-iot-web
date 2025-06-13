var express = require('express');
var httpStatus = require('http-status-codes');

var Client = require('../controllers/clients')

const router = express.Router();

router.route("/id")

  .get(Client.findGoogleClient)

router.use("/:client_id",Client.checkDeviceReadAccess,(req,res,next) => {
  next();
});

router.route("/:client_id/devices")

  .get(Client.getDevices)


router.use("/:client_id",Client.checkDevicePermissionsAccess,(req,res,next) => {
  next();
});

router.route("/:client_id/permissions")

  .post(Client.addPermission)
  .delete(Client.removePermission)
  .put(Client.updatePermission)

module.exports =  router;
