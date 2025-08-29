var Template = require('../models/templates');

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
  }
};