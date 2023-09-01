var path = require('path');
var express = require('express');

var Model = require('../controllers/models');
var Firmware = require('../controllers/firmwares');

// set up multer
const multer = require('multer')
//var upload;
const  upload = multer({ dest: path.join(__dirname, "../public/firmwares/") })
const router = express.Router();

router.use('/:model_id',Model.checkAccess,(req,res,next)=>{next()});

router.use((req,res,next) => {
  //log.debug("firmware route");
  //console.log("current dir",__dirname);
  //console.log("dest:",path.join(__dirname, "../public/firmwares/"));
  next();
});

router.route('/:model_id')
  .get(Model.get)
  .delete(Model.delete)
  .put(Model.update)

router.route('/:model_id/permissions')
  .get(Model.listPermissions)
  .post(Model.grantPermission)
  .delete(Model.removePermission)

router.route('/:model_id/firmwares')
  .get(Firmware.listByModel)
  .post(upload.single('file'),Firmware.add)

router.route('/:model_id/firmware')
  .get(Firmware.get)
  .delete(Firmware.delete)
  .put(Firmware.updateRelease)

router.route('/:model_id/option')
  .put(Model.updateOption)

module.exports =  router;
