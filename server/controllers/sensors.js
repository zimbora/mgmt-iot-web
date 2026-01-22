var Sensor = require('../models/sensors');
var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');
var config = require('../../config/env');

module.exports = {

  add : (req, res, next)=>{

    const val = Joi.object({
      ref: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().required(),
      property: Joi.string().allow('', null),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Sensor.add(
        req.params?.model_id,
        req.params?.device_id,
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
      sensor_id: Joi.number().required(),
      property: Joi.string().required(),
      value: Joi.string().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Sensor.update(req.body.sensor_id,req.body.property,req.body.value,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      sensor_id: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Sensor.delete(req.body.sensor_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{  
    Sensor.list(req.params?.model_id,req.params?.device_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

}
