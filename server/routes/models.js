var path = require('path');
var express = require('express');

var Model = require('../controllers/models');
var Firmware = require('../controllers/firmwares');
var Sensor = require('../controllers/sensors');

// send file
var filePath = "";
if( process.env?.NODE_ENV.toLowerCase().includes("docker") ){
  filePath = "/mgmt-iot/devices/firmwares/";
}else{
  filePath = path.join(__dirname, "../public/firmwares/");
}

// set up multer
const multer = require('multer')
//var upload;
//const  upload = multer({ dest: path.join(__dirname, "../public/firmwares/") })
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("storage:",filePath);
    const uploadPath = path.join(filePath, req.params.fwId);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

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
  .post(upload.single('file'),Firmware.add)

router.route('/:model_id/firmware')
  .get(Firmware.get)
  .delete(Firmware.delete)
  .put(Firmware.updateRelease)

router.route('/:model_id/sensors')
  .get(Sensor.list)

router.route('/:model_id/sensor')
  //.get(Sensor.get)
  //.delete(Sensor.delete)
  .put(Sensor.update)
  .post(Sensor.add)

router.route('/:model_id/option')
  .put(Model.updateOption)

module.exports =  router;
