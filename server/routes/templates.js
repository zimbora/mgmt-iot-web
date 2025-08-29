var path = require('path');
var express = require('express');
var httpStatus = require('http-status-codes');
var config = require('../../config/env');

var Template = require('../controllers/templates');

const router = express.Router();


// check read access
//router.use('/:template_id',Template.checkClientReadAccess,(req,res,next)=>{next()});

// GET /api/template/:template_id/resources - Get all resources for a template
router.route('/:template_id/resources')
  .get(Template.getTemplateResources);

// GET /api/template/:template_id/:resource_id - Get resource
router.route('/:template_id/:resource_id')
  .get(Template.getResource);

// check write access
//router.use('/:template_id',Template.checkClientWriteAccess,(req,res,next)=>{next()});

// POST /api/template/:template_id - Add a new resource
router.route('/:template_id')
  .post(Template.addResource);

// PUT /api/template/:template_id/:resource_id - Update a resource
router.route('/:template_id/:resource_id')
  .put(Template.updateResource);

// check owner access
//router.use('/:template_id',Template.checkOwnerAccess,(req,res,next)=>{next()});

router.route('/:template_id/:resource_id')
  .delete(Template.deleteResource);

// check admin access

// GET /api/templates - List all resources (admin/debug)
router.route('/')
  .get(Template.list);

module.exports = router;