const fs = require('fs');
const path = require('path');
var express = require('express');

var Model = require('../controllers/models');
var Firmware = require('../controllers/firmwares');
var SensorTemplate = require('../controllers/sensorsTemplate');
var ActuatorTemplate = require('../controllers/actuatorsTemplate');
var Variant = require('../controllers/variants');
const { ensureFirmwareDirectory, getFirmwarePath } = require('../utils/firmwareStorage');

const duplicateFilenameError = 'File with the same name already exists.';

// set up multer
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try{
      cb(null, ensureFirmwareDirectory());
    }catch(err){
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    try{
      const firmwarePath = getFirmwarePath(file.originalname);

      fs.open(firmwarePath, 'wx', (err, fd) => {
        if (err) {
          if (err.code == 'EEXIST')
            return cb(new Error(duplicateFilenameError));
          return cb(err);
        }

        fs.close(fd, (closeErr) => {
          if (closeErr) {
            return cb(closeErr);
          }

          cb(null, path.basename(file.originalname));
        });
      });
    }catch(err){
      cb(err);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fieldSize: 4 * 1024 * 1024, // 4MB, adjust as needed
  },
});

const router = express.Router();

router.use('/:model_id',Model.checkAccess,(req,res,next)=>{next()});

router.use((req,res,next) => {
  //log.debug("firmware route");
  //console.log("current dir",__dirname);
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
  .post((req, res, next) => {
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors (e.g., file too large)
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Other errors
        if (err.message === duplicateFilenameError) {
          return res.status(400).json({ success: false, message: err.message });
        }

        return res.status(500).json({ success: false, message: 'An unknown error occurred.' });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
      }

      next();
    });
  },(req,res,next)=>{Firmware.add(req,res,next)})

router.route('/:model_id/firmware')
  .get(Firmware.get)
  .delete(Firmware.delete)
  .put(Firmware.updateRelease)

router.route('/:model_id/firmware/latest')
  .get(Model.getLatestFirmware)

router.route('/:model_id/sensors')
  .get(SensorTemplate.list)

router.route('/:model_id/sensor')
  //.get(SensorTemplate.get)
  .delete(SensorTemplate.delete)
  .put(SensorTemplate.update)
  .post(SensorTemplate.add)

router.route('/:model_id/sensor/propagate')
  .post(SensorTemplate.propagate)

router.route('/:model_id/actuators')
  .get(ActuatorTemplate.list)

router.route('/:model_id/actuator')
  .delete(ActuatorTemplate.delete)
  .put(ActuatorTemplate.update)
  .post(ActuatorTemplate.add)

router.route('/:model_id/actuator/propagate')
  .post(ActuatorTemplate.propagate)

router.route('/:model_id/option')
  .put(Model.updateOption)

router.route('/:model_id/variants')
  .get(Variant.listByModel)
  .post(Variant.add)

router.route('/:model_id/variant/:variant_id')
  .get(Variant.get)
  .delete(Variant.delete)
  .put(Variant.update)

module.exports =  router;
