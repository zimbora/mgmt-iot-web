var ActuatorTemplate = require('../models/actuatorsTemplate');
var Actuator = require('../models/actuators');
var Device = require('../models/devices');
var Joi = require('joi');
const moment = require('moment');
var httpStatus = require('http-status-codes');
var response = require('./response');
var config = require('../../config/env');


module.exports = {

  add : (req, res, next)=>{

    const val = Joi.object({
      ref: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid(...ActuatorTemplate.TYPES).required(),
      property: Joi.string().allow('', null),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      ActuatorTemplate.add(
        req.params.model_id,
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
    }else{
      ActuatorTemplate.update(req.body.actuator_id,req.body.property,req.body.value,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      actuator_id: Joi.number().required(),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      ActuatorTemplate.delete(req.body.actuator_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{
    ActuatorTemplate.list(req.params?.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  propagate: async (req, res, next) => {
    const { error, value } = Joi.object({
      actuator_id: Joi.number().required(),
    }).validate(req.body);

    if (error) {
      return response.error(res, httpStatus.BAD_REQUEST, error.details?.[0]?.message || 'Validation error');
    }

    // Helper to wrap callback-style APIs into promises
    const toPromise = (fn, ctx) => (...args) =>
      new Promise((resolve, reject) => {
        fn.call(ctx, ...args, (err, result) => (err ? reject(err) : resolve(result)));
      });

    try {
      const getActuatorTemplateById = toPromise(ActuatorTemplate.getById, ActuatorTemplate);
      const listDevicesByModel = toPromise(Device.listByModel, Device);
      const getActuatorByRef = toPromise(Actuator.getByRef, Actuator);
      const updateActuator = toPromise(Actuator.updateObject, Actuator);
      const addActuator = toPromise(Actuator.add, Actuator);

      const actuatorT = await getActuatorTemplateById(value.actuator_id);

      if (!actuatorT) {
        return response.error(res, httpStatus.NOT_FOUND, 'actuator template not found');
      }

      const devices = await listDevicesByModel(actuatorT.model_id);

      if (!devices || devices.length === 0) {
        return response.error(res, httpStatus.NOT_FOUND, 'no devices associated to this model');
      }

      const results = await Promise.all(
        devices.map(async (device) => {
          // For each device, either update existing actuator or add a new one
          const actuators = await getActuatorByRef(device.id, actuatorT.ref, actuatorT.property);

          if (actuators?.length) {
            const actuator = actuators[0];
            let obj = {
              ref: actuatorT.ref,
              name: actuatorT.name,
              type: actuatorT.type,
              property: actuatorT.property,
              active: actuatorT.active,
              graph: actuatorT.graph,
            }
            const rows = await updateActuator(actuator.id, obj);
            return rows?.[0] ?? null;
          } else {
            const rows = await addActuator(
              actuatorT.model_id,
              device.id,
              actuatorT.ref,
              actuatorT.name,
              actuatorT.type,
              actuatorT.property,
              actuatorT.active,
              actuatorT.graph,
            );
            return rows?.[0] ?? null;
          }
        })
      );

      // Filter out nulls and send a single response with all rows
      const payload = results.filter(Boolean);

      response.send(res,payload);

    } catch (err) {
      return response.error(res, httpStatus.INTERNAL_SERVER_ERROR, err?.message || err);
    }
  },

}
