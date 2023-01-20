var path = require('path');
var express = require('express');
var config = require('../../config/env');

// set up multer
const multer = require('multer')
const upload = multer({ dest: path.join(__dirname, "../../"+config.public_path + "/firmwares/") })

var Firmware = require('../controllers/firmwares')

const router = express.Router();

router.use((req,res,next) => {
  //log.debug("firmware route");
  next();
});

router.route('/:model_id',Firmware.checkModelAccess)
  .get(Firmware.list)
  .post(upload.single('file'),Firmware.add)
  .delete(Firmware.delete)
  .put(Firmware.update)

router.route('/:model_id/release',Firmware.checkModelAccess)
  .put(Firmware.updateRelease);

router.route('/:model_id/permission',Firmware.checkModelAccess)
  .get(Firmware.listModelPermission)
  .post(Firmware.grantModelPermission)
  .delete(Firmware.removeModelPermission)

module.exports =  router;
