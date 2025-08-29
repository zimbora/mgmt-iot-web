var path = require('path');
var express = require('express');
var httpStatus = require('http-status-codes');
var config = require('../../config/env');

var Response = require('../controllers/response');
var Template = require('../controllers/templates');

const router = express.Router();

// GET /api/template/:template_id/resources - Get all resources for a template
router.route('/:template_id/resources')
  .get(Template.getTemplateResources);

// POST /api/template/:template_id - Add a new resource
router.route('/:template_id')
  .post(Template.addResource);

// PUT /api/template/:template_id/:resource_id - Update a resource
router.route('/:template_id/:resource_id')
  .put(Template.updateResource);

// DELETE /api/template/:template_id/:resource_id - Delete a resource
router.route('/:template_id/:resource_id')
  .delete(Template.deleteResource);

// GET /api/template/:template_id/:resource_id - Get a specific resource
router.route('/:template_id/:resource_id')
  .get(Template.getResource);

// GET /api/templates - List all resources (admin/debug)
router.route('/')
  .get(Template.list);

module.exports = router;