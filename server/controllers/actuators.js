var Actuator = require('../models/actuators');
var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');
var config = require('../../config/env');

module.exports = {

  add : (req, res, next)=>{

    const val = Joi.object({
      ref: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid(...Actuator.TYPES).required(),
      property: Joi.string().allow('', null),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Actuator.add(
        null, // no model_id for device-level actuator creation
        req.params.device_id,
        req.body.ref,
        req.body.name,
        req.body.type,
        req.body?.property,
        (err,rows)=>{
          if(!err) response.send(res,rows);
          else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
        }
      );
    }
  },

  update : (req, res, next)=>{

    const val = Joi.object({
      actuator_id: Joi.number().required(),
      property: Joi.string().required(),
      value: Joi.any().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
      return;
    }

    if(req.body.property !== 'value'){
      Actuator.update(req.body.actuator_id,req.body.property,req.body.value,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
      return;
    }

    // writing the actuator value must respect its configured type
    Actuator.getById(req.body.actuator_id,(err,actuator)=>{
      if(err) return response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      if(!actuator) return response.error(res,httpStatus.NOT_FOUND,'actuator not found');

      const error = Actuator.validateValue(actuator.type,req.body.value);
      if(error) return response.error(res,httpStatus.BAD_REQUEST,error);

      Actuator.update(req.body.actuator_id,'value',req.body.value,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    });
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      actuator_id: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Actuator.delete(req.body.actuator_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{
    Actuator.list(req.params?.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

}
