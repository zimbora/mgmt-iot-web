var Template = require('../models/templates');
var LwM2MTemplate = require('../models/lwm2mTemplate');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');

module.exports = {

  get : (req,res,next)=>{

    Template.getById(req.params.template_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  list : (req,res,next)=>{

    Template.listByProject(req.params.project_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  add : (req, res, next)=>{

    const val = Joi.object({
      tag: Joi.string().required(),
      name: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Template.add(req.body.tag, req.body.name, req.user.client_id, req.params.project_id, (err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req,res,next)=>{

    Template.delete(req.params.template_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  update : (req, res, next)=>{

    const val = Joi.object({
      tag: Joi.string().required(),
      name: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Template.update(req.params.template_id, req.body.tag, req.body.name, (err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

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

      const val = Joi.object({
        objectId: Joi.number().required(),
        objectInstanceId: Joi.number().required(),
        resourceId: Joi.number().required(),
        description: Joi.object({
          type: Joi.string()
            .valid('string', 'integer', 'float', 'boolean') // Allowed values
            .required(), // 'type' is required
          title: Joi.string().required(), // 'title' is required and must be a string
          readable: Joi.boolean().optional(), // 'readable' is optional and must be a boolean
          writable: Joi.boolean().optional(), // 'writable' is optional and must be a boolean
          observable: Joi.boolean().optional(), // 'observable' is optional and must be a boolean
        }).required(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.optional()
        }).required(),
        observe: Joi.boolean().truthy('true').falsy('false').required(),
        readInterval: Joi.number().required(),
      }).validate(req.body);

      const { objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
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
              return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
            }
            return response.success(res, result);
          }
        );
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Update an existing resource
  updateResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;
      const updateData = req.body;

      if (!templateId || !resourceId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      const val = Joi.object({
        description: Joi.object({
          type: Joi.string()
            .valid('string', 'integer', 'float', 'boolean') // Allowed values
            .required(), // 'type' is required
          title: Joi.string().required(), // 'title' is required and must be a string
          readable: Joi.boolean().optional(), // 'readable' is optional and must be a boolean
          writable: Joi.boolean().optional(), // 'writable' is optional and must be a boolean
          observable: Joi.boolean().optional(), // 'observable' is optional and must be a boolean
        }).optional(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.optional()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').optional(),
        readInterval: Joi.number().optional(),
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        LwM2MTemplate.update(resourceId, updateData, (err, result) => {
          if (err) {
            return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
          }
          return response.success(res, result);
        });
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Delete a resource
  deleteResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;

      if (!templateId || !resourceId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      LwM2MTemplate.delete(resourceId, (err, result) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.success(res, result);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Get a specific resource
  getResource: async (req, res) => {
    try {
      const templateId = req.params.template_id;
      const resourceId = req.params.resource_id;

      if (!templateId || !resourceId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Resource ID are required");
      }

      LwM2MTemplate.getById(resourceId, (err, resource) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        
        if (!resource) {
          return response.error(res, httpStatus.NOT_FOUND, "Resource not found");
        }

        return response.success(res, resource);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // List all resources (for admin/debugging)
  list: async (req, res) => {
    try {
      LwM2MTemplate.list((err, resources) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.success(res, resources);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
};
