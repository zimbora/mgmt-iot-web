var httpStatus = require('http-status-codes');
var Response = require('./response');
var LwM2MTemplate = require('../models/lwm2mTemplate');
var ParamsValidator = require('./params_validator');

var self = module.exports = {

  // Get all resources for a template
  getTemplateResources: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      
      if (!templateId) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Template ID is required");
      }

      LwM2MTemplate.getByTemplateId(templateId, (err, resources) => {
        if (err) {
          return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        
        // Parse JSON fields
        const parsedResources = resources.map(resource => {
          try {
            resource.description = typeof resource.description === 'string' ? 
              JSON.parse(resource.description) : resource.description;
          } catch (e) {
            resource.description = {};
          }
          try {
            resource.defaultData = resource.defaultData && typeof resource.defaultData === 'string' ? 
              JSON.parse(resource.defaultData) : resource.defaultData;
          } catch (e) {
            resource.defaultData = null;
          }
          return resource;
        });

        return Response.success(res, parsedResources);
      });
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Add a new resource
  addResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const { objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval } = req.body;

      // Validate required fields
      if (!templateId || !objectId || !description) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Template ID, Object ID, and description are required");
      }

      // Validate description structure
      if (!description.attributes || !description.attributes.type || !description.attributes.title) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Description must contain attributes with type and title");
      }

      LwM2MTemplate.add(
        templateId,
        objectId,
        objectInstanceId,
        resourceId,
        description,
        defaultData,
        observe,
        readInterval,
        (err, result) => {
          if (err) {
            return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
          }
          return Response.success(res, result);
        }
      );
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Update an existing resource
  updateResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;
      const updateData = req.body;

      if (!templateId || !resourceId) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      // Validate description structure if provided
      if (updateData.description && updateData.description.attributes) {
        const attrs = updateData.description.attributes;
        if (attrs.type && !['string', 'float', 'integer', 'boolean'].includes(attrs.type)) {
          return Response.error(res, httpStatus.BAD_REQUEST, "Invalid description type. Must be string, float, integer, or boolean");
        }
      }

      LwM2MTemplate.update(resourceId, updateData, (err, result) => {
        if (err) {
          return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return Response.success(res, result);
      });
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Delete a resource
  deleteResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;

      if (!templateId || !resourceId) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      LwM2MTemplate.delete(resourceId, (err, result) => {
        if (err) {
          return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return Response.success(res, result);
      });
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Get a specific resource
  getResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;

      if (!templateId || !resourceId) {
        return Response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      LwM2MTemplate.getById(resourceId, (err, resource) => {
        if (err) {
          return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        
        if (!resource) {
          return Response.error(res, httpStatus.NOT_FOUND, "Resource not found");
        }

        return Response.success(res, resource);
      });
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // List all resources (for admin/debugging)
  list: async (req, res) => {
    try {
      LwM2MTemplate.list((err, resources) => {
        if (err) {
          return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return Response.success(res, resources);
      });
    } catch (error) {
      return Response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
};