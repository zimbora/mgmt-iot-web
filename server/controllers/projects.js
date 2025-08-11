var Project = require('../models/projects');
var Client = require('../models/clients');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');

module.exports = {

  get : (req,res,next)=>{

    Project.getById(req.params.project_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  add : (req, res, next)=>{

    const val = Joi.object({
      name: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Project.add(req.body.name,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Project.delete(req.body.id,(err,rows)=>{
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
      Project.update(req.body.id,req.body.description,(err,rows)=>{
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
      Project.updateOption(req.params.project_id,req.body.option,req.body.enable,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{
    Project.list((err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  listPermissions : (req, res, next)=>{

    Project.listPermissions(req.params.project_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  grantPermission : (req, res, next)=>{

    const val = Joi.object({
      clientId: Joi.string().required(),
      level: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Project.grantPermission(req.body.clientId,req.body.level,req.params.project_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  updatePermission : (req, res, next)=>{

    const val = Joi.object({
      clientId: Joi.string().required(),
      level: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Project.grantPermission(req.body.clientId,req.body.level,req.params.project_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  removePermission : (req, res, next)=>{

    const val = Joi.object({
      clientId: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Project.removePermission(req.body.clientId,req.params.project_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  checkOwnership : (req, res, next)=>{
    if(Client.isAdmin(req.user.level))
      return next();
    else{
      Project.checkOwnership(req.user.client_id,req.params.project_id,(err,access)=>{
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
      Project.checkAccess(req.user.client_id,req.params.project_id,(err,access)=>{
        if(err) res.json({"Error" : true, "Message" : err, "Result" : null});
        else if(!access) res.json({"Error" : true, "Message" : "Not allowed", "Result" : null});
        else next();
      });
    }
  }
};
