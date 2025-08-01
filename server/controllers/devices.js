  
var device = require('../models/devices');
var client = require('../models/clients');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');


module.exports = {

  addClientPermission : (req, res, next)=>{

   const val = Joi.object({
     deviceID: Joi.string().required(),
     clientID: Joi.string().required(),
     level: Joi.number().required()
   }).validate(req.body);

   if(val.error){
     response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
   }else{
     Device.addClientPermission(req.body.deviceID,req.body.clientID,req.body.level,(err,rows)=>{
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
     Device.deleteClientPermission(req.body.deviceID,req.body.clientID,(err,rows)=>{
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
     Device.updateClientPermission(req.body.deviceID,req.body.clientID,req.body.level,(err,rows)=>{
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

  // delete device
  delete  : (req, res, next)=>{
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
  }
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
