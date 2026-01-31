var path = require('path');
var express = require('express');

var Model = require('../controllers/models');
var Firmware = require('../controllers/firmwares');
var SensorTemplate = require('../controllers/sensorsTemplate');

// send file
var filePath = "";
if( process.env?.NODE_ENV?.toLowerCase().includes("docker") ){
  filePath = "/mgmt-iot/devices/firmwares";
}else{
  filePath = path.join(__dirname, "../public/firmwares");
}

// set up multer
const multer = require('multer')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("storage:",filePath);
    cb(null, filePath);
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, file.originalname);
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
  .post(async (req, res, next) => {

    const filename = req.file ? req.file.originalname : null;

    // Before calling uploadSingle, check if the filename exists
    if (filename) {
      const filePathToCheck = path.join(filePath, filename);
      const exists = await fileExists(filePathToCheck);

      if (exists) {
        return res.status(400).json({ success: false, message: 'File with the same name already exists.' });
      }
    }

    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        // Multer-specific errors (e.g., file too large)
        return res.status(400).json({ success: false, message: err.message });
      } else if (err) {
        // Other errors
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

router.route('/:model_id/option')
  .put(Model.updateOption)

module.exports =  router;
