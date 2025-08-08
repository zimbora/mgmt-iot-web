var path = require('path');
var express = require('express');

var Project = require('../controllers/projects');
var Sensor = require('../controllers/sensors');
var Template = require('../controllers/templates');

const router = express.Router();

router.use('/:project_id',Project.checkAccess,(req,res,next)=>{next()});

router.use((req,res,next) => {
  //log.debug("firmware route");
  //console.log("current dir",__dirname);
  next();
});

router.route('/:project_id')
  .get(Project.get)
  .delete(Project.delete)
  .put(Project.update)

router.route('/:project_id/permissions')
  .get(Project.listPermissions)
  .post(Project.grantPermission)
  .put(Project.updatePermission)
  .delete(Project.removePermission)

router.route('/:project_id/sensors')
  .get(Sensor.list)

router.route('/:project_id/sensor')
  //.get(Sensor.get)
  //.delete(Sensor.delete)
  .put(Sensor.update)
  .post(Sensor.add)

router.route('/:project_id/option')
  .put(Project.updateOption)

router.route('/:project_id/templates')
  .get(Template.list)

router.route('/:project_id/template')
  .post(Template.add)

router.route('/:project_id/template/:template_id')
  .delete(Template.delete)

module.exports =  router;
