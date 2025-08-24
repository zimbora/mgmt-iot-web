var Model = require('../models/models');
var Client = require('../models/clients');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');


module.exports = {

  get : (req,res,next)=>{

    Model.getModelById(req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  add : (req, res, next)=>{

    const val = Joi.object({
      name: Joi.string().required(),
      project_id: Joi.number().required(),
      description: Joi.string().optional()
    }).validate(req.body);

    if(req.user.level != 5){
      return response.error(res,httpStatus.BAD_REQUEST,"You have no permission to add a new model");
    }

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.getId(req.body.name)
      .then(existingId => {
        if(existingId) {
          response.error(res,httpStatus.BAD_REQUEST,"Model with this name already exists");
        } else {
          Model.add(req.body.name, req.body.project_id, req.body.description,(err,rows)=>{
            if(!err) response.send(res,rows);
            else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
          });
        }
      })
      .catch(err => {
        response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      model_id: Joi.number().required()
    }).validate(req.params);

    if(user.level != 5){
      return response.error(res,httpStatus.BAD_REQUEST,"You have no permission to delete the model");
    }

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.delete(req.params.model_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  update : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required(),
      description: Joi.string().required().allow(""),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.update(req.body.id,req.body.description,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  updateOption : (req, res, next)=>{

    const val = Joi.object({
      option: Joi.string().required(),
      enable: Joi.boolean().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.updateOption(req.params.model_id,req.body.option,req.body.enable,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{
    Model.list((err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  listPermissions : (req, res, next)=>{

    Model.listPermissions(req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  grantPermission : (req, res, next)=>{

    const val = Joi.object({
      clientId: Joi.string().required(),
      level: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.grantPermission(req.body.clientId,req.body.level,req.params.model_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  removePermission : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.removePermission(req.body.id,req.params.model_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  checkOwnership : (req, res, next)=>{
    if(Client.isAdmin(req.user.level))
      return next();
    else{
      Model.checkOwnership(req.user.client_id,req.params.model_id,(err,access)=>{
        if(err) res.json({"Error" : true, "Message" : err, "Result" : null});
        else if(!access) res.json({"Error" : true, "Message" : "Not allowed", "Result" : null});
        else next();
      });
    }
  },

  checkAccess : (req, res, next)=>{
    if(Client.isAdmin(req.user.level))
      return next();
    else{
      Model.checkAccess(req.user.client_id,req.params.model_id,(err,access)=>{
        if(err) res.json({"Error" : true, "Message" : err, "Result" : null});
        else if(!access) res.json({"Error" : true, "Message" : "Not allowed", "Result" : null});
        else next();
      });
    }
  },

  getLatestFirmware : async (req, res, next) => {
    try {
      const modelId = req.params.model_id;
      const acceptRelease = req.query.accept_release || 'prod'; // Default to 'prod' if not specified
      
      // Import Firmware model
      const Firmware = require('../models/firmwares');
      
      // Get latest versions using existing functions
      const latestVersion = await Firmware.getLatestVersion(modelId, acceptRelease);
      const latestAppVersion = await Firmware.getLatestAppVersion(modelId, acceptRelease);
      
      const result = {
        latest_version: latestVersion ? latestVersion.version : null,
        latest_app_version: latestAppVersion ? latestAppVersion.app_version : null
      };
      
      response.send(res, result);
    } catch (err) {
      response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err);
    }
  },
};
