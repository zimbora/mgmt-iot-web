
var device = require('../models/devices');

//var Joi = require('joi');
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
      device.list((err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }else{
      device.listAssociated(req.user.id, (err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  // get device info
  getInfo : (req, res, next)=>{
    device.getInfo(req.params.device_id,(err,rows)=>{
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
