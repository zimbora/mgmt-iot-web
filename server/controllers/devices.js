  
var device = require('../models/devices');
var client = require('../models/clients');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');


module.exports = {

  getId : async (req,res,next)=>{

    const val = Joi.object({
      uid: Joi.string().required(),
      project: Joi.string(),
    }).validate(req.query);

    device.getId(req.query.uid,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
    
  },

  getPreSharedKey : async (req, res, next)=>{
    
    device.getPreSharedKey(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
    
  },

  getObservations : async (req, res, next)=>{

    const projectName = await device.getProject(req.params.device_id)

    if(projectName != 'lwm2m'){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"Device is not classified in lwm2m project");
    }else{
      device.getObservations(req.params.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getObservationStatus : async (req, res, next)=>{

    const projectName = await device.getProject(req.params.device_id)

    if(projectName != 'lwm2m'){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"Device is not classified in lwm2m project");
    }else{

      const val = Joi.object({
        objectId: Joi.number().required(),
        objectInstanceId: Joi.number().required(),
        resourceId: Joi.number().required(),
      }).validate(req.query);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        device.getObservationStatus(req.params.device_id,req.query,(err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        });
      }
    }
  },

  updateObservationStatus : async (req, res, next)=>{

    const projectName = await device.getProject(req.params.device_id)

    if(projectName != 'lwm2m'){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"Device is not classified in lwm2m project");
    }else{

      const val = Joi.object({
        objectId: Joi.number().required(),
        objectInstanceId: Joi.number().required(),
        resourceId: Joi.number().required(),
        observing: Joi.boolean().truthy('true').falsy('false').required(),
        token: Joi.string().max(16).allow('', null), // ensures max length of 16 characters
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        device.updateObservationStatus(req.params.device_id,req.body,(err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        });
      }
    }
  },


  addClientPermission : (req, res, next)=>{

    const val = Joi.object({
      deviceID: Joi.string().required(),
      clientID: Joi.string().required(),
      level: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.addClientPermission(req.body.deviceID,req.body.clientID,req.body.level,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  deleteClientPermission : (req, res, next)=>{

    const val = Joi.object({
      deviceID: Joi.string().required(),
      clientID: Joi.string().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.deleteClientPermission(req.body.deviceID,req.body.clientID,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  updateClientPermission : (req, res, next)=>{

    const val = Joi.object({
      deviceID: Joi.string().required(),
      clientID: Joi.string().required(),
      level: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.updateClientPermission(req.body.deviceID,req.body.clientID,req.body.level,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
 },

  list : (req, res, next)=>{
    
    if(req.user.level >= 4){
      if(req.query?.updatedAt != null){
        device.listSynch( req.query?.modelId,req.query?.updatedAt, (err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        });
      }else{
        device.list( req.query?.modelId,null, (err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        });
      }
    }else{
      client.getDevices(req.user.client_id, (err,rows)=>{
      //device.listAssociated(req.user.client_id, (err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  permissions : (req, res, next)=>{

    if(req.user.level >= 4){
      device.permissionsSynch( req.query?.updatedAt, (err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      })
    }else{
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"No permission for this call");
    }
  },

  getInfo : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getInfo(req.params?.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getLogs : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getLogs(req.params?.device_id,req.query?.sensor,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getProjectInfo : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getProjectInfo(req.params?.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getProjectLogs : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getProjectLogs(req.params?.device_id,req.query?.sensor,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getModelInfo : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getModelInfo(req.params?.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getModelLogs : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getModelLogs(req.params?.device_id,req.query?.sensor,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },
  
  getFwInfo : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getFwInfo(req.params?.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getFwLogs : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getFwLogs(req.params?.device_id,req.query?.sensor,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getSensorInfo : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getSensorInfo(req.params?.device_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  getSensorLogs : (req, res, next)=>{

    const val = Joi.object({
      device_id: Joi.number().required(),
    }).validate(req.params);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.getSensorLogs(req.params?.device_id,req.query?.sensor,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  // add device
  add : (req, res, next)=>{
    const val = Joi.object({
      projectName: Joi.string().required(),
      templateId: Joi.number().optional(),
      modelName: Joi.string().required(),
      uid: Joi.string().required(),
      name: Joi.string(),
      protocol: Joi.string().valid('MQTT', 'LwM2M', 'mqtt', 'lwm2m').required(),
      psk: Joi.string(),
    }).validate(req.body);

    device.add(req.body,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // delete device
  delete : (req, res, next)=>{
    device.delete(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // get device alarms
  getAutorequests : (req, res, next)=>{
    device.getAutorequests(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // get device alarms
  getAlarms : (req, res, next)=>{
    device.getAlarms(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // get device jscode
  getJSCode : (req, res, next)=>{
    device.getJSCode(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  getLwm2mObjects : (req, res, next)=>{

    // check if project is 'lwm2m'
    device.getLwm2mObjects(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  getLwm2mResources : (req, res, next)=>{

    const val = Joi.object({
      objectId: Joi.number(),
    }).validate(req.query);

    device.getLwm2mResources(req.params.device_id,req.query?.objectId,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // get clients with access to this device
  getClientsWithAccess : (req, res, next)=>{
    device.getClientsWithAccess(req.params.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  // update type of release that should be used by this device
  updateDeviceRelease : (req, res, next)=>{

    const val = Joi.object({
      release: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.updateDeviceRelease(req.params.device_id,req.body.release,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  // trigger manual FOTA check
  triggerFota : (req, res, next)=>{

    // checks if device is using latest version and if not, updates no matter what..
    device.triggerFota(req.params.device_id,req.body?.version, req.body?.app_version,(err,msg)=>{
      if(!err) response.send(res,msg);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });

  },

  // update device settings
  updateDeviceSettings : (req, res, next)=>{

    const val = Joi.object({
      settings: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.updateDeviceSettings(req.params.device_id,req.body.settings,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  // update device almost any field
  updateDeviceProjectField : (req, res, next)=>{

    const val = Joi.object({
      field: Joi.required(),
      data: Joi.required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.updateDeviceProjectField(req.params.device_id,req.body.field,req.body.data,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  sendMqttMessage : (req,res,next)=>{

    const val = Joi.object({
      topic: Joi.string().required(),
      payload: Joi.string().allow(''), // allows empty string or any string
      qos: Joi.number().integer().min(0).max(2).required(),
      retain: Joi.number().integer().min(0).max(1).required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      device.sendMqttMessage(
        req.params.device_id,
        req.body.topic,
        req.body.payload,
        req.body.qos,
        Number(req.body.retain),
        (err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        }
      );
    }
  },

    // Add a new object
  addObject: async (req, res, next) => {
    try {
      const deviceId = req.params.device_id;

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
          value: Joi.object().optional()
        }).required(),
        observe: Joi.boolean().truthy('true').falsy('false').required(),
        readInterval: Joi.number().required(),
      }).validate(req.body);

      const { objectId, description, defaultData, observe, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        device.addObject(
          deviceId,
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
      const deviceId = req.params.device_id;

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
          value: Joi.optional()
        }).required(),
        observe: Joi.boolean().truthy('true').falsy('false').required(),
        readInterval: Joi.number().required(),
      }).validate(req.body);

      const { objectId, objectInstanceId, resourceId, description, defaultData, observe, readInterval } = req.body;

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        device.addResource(
          deviceId,
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
      const deviceId = req.params.device_id;
      const entryId = req.params.entry_id;
      const updateData = req.body;

      if (!deviceId || !entryId) {
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
          value: Joi.optional()
        }).optional(),
        observe: Joi.boolean().truthy('true').falsy('false').optional(),
        readInterval: Joi.number().optional(),
      }).validate(req.body);

      if(val.error){
        response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      }else{
        device.updateEntry(entryId, updateData, (err, result) => {
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
      const deviceId = req.params.device_id;
      const entryId = req.params.entry_id;
      const updateData = req.body;

      if (!deviceId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      const val = Joi.object({
        description: Joi.object({
          attributes: Joi.object({
            type: Joi.string()
              .valid('string', 'integer', 'float', 'boolean', 'json', 'time') // Allowed values
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
        device.updateEntry(entryId, updateData, (err, result) => {
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

    // check access to deviceId - req.params.device_id
    try {
      const deviceId = req.params.device_id;
      const entryId = req.params.entry_id;

      if (!deviceId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      device.deleteEntry(entryId, (err, result) => {
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

    // check access to deviceId - req.params.device_id
    try {
      const deviceId = req.params.device_id;
      const entryId = req.params.entry_id;

      if (!deviceId || !entryId) {
        return response.error(res, httpStatus.BAD_REQUEST, "Template ID and Entry ID are required");
      }

      device.deleteEntry(entryId, (err, result) => {
        if (err) {
          return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
        }
        return response.send(res, result);
      });
    } catch (error) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
  },
};
/*
function update(req, res, next) {

  const val = Joi.object({
    name: Joi.string().required(),
    level: Joi.number().required(),
    sniffers: Joi.required(),
    dimensions: Joi.required()
  }).validate(req.body);


  Map.update(req.map.id,req.body,(err,rows)=>{
    if(err) response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    else{
      Map.updateSniffers(req.map.id,req.body.sniffers,(err,rows)=>{
        if(err) response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        else next();
      });
    }
  });
}
*/
