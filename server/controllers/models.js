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
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Model.add(req.body.name,(err,rows)=>{
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
      Model.delete(req.body.id,(err,rows)=>{
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
      clientID: Joi.string().required(),
    }).validate(req.body);
    Model.grantPermission(req.body.clientID,req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  removePermission : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required(),
    }).validate(req.body);

    Model.removePermission(req.body.id,req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
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
};
