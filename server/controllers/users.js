var User = require('../models/users');
var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');
var config = require('../../config/env');

module.exports = {

  add : (req, res, next)=>{

    const val = Joi.object({
      user: Joi.string().required(),
      pwd: Joi.string().required(),
      level: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      User.add(req.body.user,req.body.pwd,req.body.level,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      user: Joi.string().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      User.delete(req.body.user,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  update : (req, res, next)=>{

    const val = Joi.object({
      clientID: Joi.string().required(),
      user: Joi.string().required(),
      level: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      User.update(req.body.user,req.body.pwd,req.body.level,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },


  list : (req, res, next)=>{
    User.list((err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  getInfo : (req,res,next)=>{
    return next();
  },

}
