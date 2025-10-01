var Template = require('../models/templates');
var LwM2MTemplate = require('../models/lwm2mTemplate');
var mqttTemplate = require('../models/mqttTemplate');

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
    
    const val = Joi.object({
      projectId: Joi.number(),
    }).validate(req.query);

    Template.list(req.query?.projectId,(err,rows)=>{
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

  // Get all objects for a template
  getObjects: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      
      if (!templateId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID is required");
      }

      LwM2MTemplate.getObjects(templateId, (err, objects) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }

        return response.send(res, objects);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Get all resources for a template
  getResources: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      const objectId = null;

      if (!templateId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID is required");
      }

      const val = Joi.object({
        objectId: Joi.number(),
      }).validate(req.query);

      if(val.error)
        return response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      
      LwM2MTemplate.getResources(templateId, req.query?.objectId || null, (err, resources) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
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

        return response.send(res, parsedResources);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Add a new object
  addObject: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;

      const val = Joi.object({
        objectId: Joi.number().required(),
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('json') // Allowed values
              .required(), // 'type' is required
            title: Joi.string().required(), // 'title' is required and must be a string
            readable: Joi.boolean().required(), // 'readable' is required and must be a boolean
            writable: Joi.boolean().required(), // 'writable' is required and must be a boolean
            observable: Joi.boolean().required(), // 'observable' is required and must be a boolean
          }).required(),
        }).optional(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.object().required()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').required(),
        readInterval: Joi.number().required(),
      }).validate(req.body);

      const { objectId, description, defaultData, observe, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        LwM2MTemplate.addObject(
          templateId,
          objectId,
          description,
          defaultData,
          observe,
          readInterval,
          (err, result) => {
            if (err) {
              return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
            }
            return response.send(res, result);
          }
        );
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Add a new resource
  addResource: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;

      const val = Joi.object({
        objectId: Joi.number().required(),
        objectInstanceId: Joi.number().required(),
        resourceId: Joi.number().required(),
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('string', 'integer', 'float', 'boolean', 'execute', 'time') // Allowed values
              .required(), // 'type' is required
            title: Joi.string().required(), // 'title' is required and must be a string
            readable: Joi.boolean().required(), // 'readable' is required and must be a boolean
            writable: Joi.boolean().required(), // 'writable' is required and must be a boolean
            observable: Joi.boolean().required(), // 'observable' is required and must be a boolean
          }).required(),
        }).optional(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.required()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').required(),
        readInterval: Joi.number().required(),
      }).validate(req.body);

      const { objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        LwM2MTemplate.addResource(
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
            return response.send(res, result);
          }
        );
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Update an existing object
  updateObject: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;
      const updateData = req.body;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      const val = Joi.object({
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('json') // Allowed values
              .required(), // 'type' is required
            title: Joi.string().required(), // 'title' is required and must be a string
            readable: Joi.boolean().required(), // 'readable' is required and must be a boolean
            writable: Joi.boolean().required(), // 'writable' is required and must be a boolean
            observable: Joi.boolean().required(), // 'observable' is required and must be a boolean
          }).required(),
        }).optional(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.required()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').optional(),
        readInterval: Joi.number().optional(),
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        LwM2MTemplate.updateEntry(entryId, updateData, (err, result) => {
          if (err) {
            return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
          }
          return response.send(res, result);
        });
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Update an existing resource
  updateResource: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;
      const updateData = req.body;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      const val = Joi.object({
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('string', 'integer', 'float', 'boolean') // Allowed values
              .required(), // 'type' is required
            title: Joi.string().required(), // 'title' is required and must be a string
            readable: Joi.boolean().required(), // 'readable' is required and must be a boolean
            writable: Joi.boolean().required(), // 'writable' is required and must be a boolean
            observable: Joi.boolean().required(), // 'observable' is required and must be a boolean
          }).required(),
        }).optional(), // The 'description' object itself is required
        defaultData: Joi.object({
          value: Joi.required()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').optional(),
        readInterval: Joi.number().optional(),
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        LwM2MTemplate.updateEntry(entryId, updateData, (err, result) => {
          if (err) {
            return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
          }
          return response.send(res, result);
        });
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Delete a object
  deleteObject: async (req, res, next) => {

    // check access to templateId - req.params.template_id
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      LwM2MTemplate.deleteEntry(entryId, (err, result) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.send(res, result);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Delete a resource
  deleteResource: async (req, res, next) => {

    // check access to templateId - req.params.template_id
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      LwM2MTemplate.deleteEntry(entryId, (err, result) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.send(res, result);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Get a specific resource
  getResource: async (req, res, next) => {
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

        return response.send(res, resource);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },
  
  /*
  // List all resources (for admin/debugging)
  listLwm2m: async (req, res, next) => {
    try {
      LwM2MTemplate.list((err, resources) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.send(res, resources);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
  */

  // ===== Mqtt Template Methods =====

  // Get all topics for a mqtt template
  getMqttTopics: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      
      if (!templateId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID is required");
      }

      mqttTemplate.getTopics(templateId, (err, topics) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }

        return response.send(res, topics);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Add a new mqtt topic
  addMqttTopic: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;

      const val = Joi.object({
        topic: Joi.string().required(),
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('string', 'integer', 'float', 'boolean', 'json') // Allowed data types
              .required(),
            title: Joi.string().required(),
            readable: Joi.boolean().required(),
            writable: Joi.boolean().required(),
          }).required(),
        }).optional(),
        defaultData: Joi.object({
          value: Joi.required()
        }).optional(),
        readInterval: Joi.number().min(0).optional(), // Publishing interval in seconds
      }).validate(req.body);

      const { topic, description, defaultData, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        mqttTemplate.addTopic(
          templateId,
          topic,
          description,
          defaultData,
          readInterval,
          (err, result) => {
            if (err) {
              return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
            }
            return response.send(res, result);
          }
        );
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Update an existing mqtt topic
  updateMqttTopic: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;
      const updateData = req.body;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      const val = Joi.object({
        topic: Joi.string().optional(),
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('string', 'integer', 'float', 'boolean', 'json')
              .required(),
            title: Joi.string().required(),
            readable: Joi.boolean().required(),
            writable: Joi.boolean().required(),
          }).required(),
        }).optional(),
        defaultData: Joi.object({
          value: Joi.required()
        }).optional(),
        readInterval: Joi.number().min(0).optional(),
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        mqttTemplate.updateEntry(entryId, updateData, (err, result) => {
          if (err) {
            return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
          }
          return response.send(res, result);
        });
      }
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Delete a mqtt topic
  deleteMqttTopic: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;
      const entryId = req.params.entry_id;

      if (!templateId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      mqttTemplate.deleteEntry(entryId, (err, result) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.send(res, result);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },

  // Get a specific mqtt topic
  getMqttTopic: async (req, res, next) => {
    try {
      const templateId = req.params.template_id;

      if (!templateId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID is required");
      }

      mqttTemplate.getById(templateId, (err, topics) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        
        if (!topics || topics.length === 0) {
          return response.error(res, httpStatus.NOT_FOUND, "No topics found for this template");
        }

        return response.send(res, topics);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  }
};
