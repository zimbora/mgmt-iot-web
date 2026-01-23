var SensorTemplate = require('../models/sensorsTemplate');
var Sensor = require('../models/sensors');
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
      type: Joi.string().required(),
      property: Joi.string().allow('', null),
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      SensorTemplate.add(
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
      sensor_id: Joi.number().required(),
      property: Joi.string().required(),
      value: Joi.string().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      SensorTemplate.update(req.body.sensor_id,req.body.property,req.body.value,(err,rows)=>{
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
      SensorTemplate.delete(req.body.sensor_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{  
    SensorTemplate.list(req.params?.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  propagate: async (req, res, next) => {
    const { error, value } = Joi.object({
      sensor_id: Joi.number().required(),
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
      const getSensorTemplateById = toPromise(SensorTemplate.getById, SensorTemplate);
      const listDevicesByModel = toPromise(Device.listByModel, Device);
      const getSensorByRef = toPromise(Sensor.getByRef, Sensor);
      const updateSensor = toPromise(Sensor.updateObject, Sensor);
      const addSensor = toPromise(Sensor.add, Sensor);

      const sensorT = await getSensorTemplateById(value.sensor_id);

      if (!sensorT) {
        return response.error(res, httpStatus.NOT_FOUND, 'sensor template not found');
      }

      const devices = await listDevicesByModel(sensorT.model_id);

      if (!devices || devices.length === 0) {
        return response.error(res, httpStatus.NOT_FOUND, 'no devices associated to this model');
      }

      // obj should be defined earlier with the data you want to update (kept as in your original snippet)
      const obj = req.body?.data || {}; // adjust as needed

      const results = await Promise.all(
        devices.map(async (device) => {
          // For each device, either update existing sensor or add a new one
          const sensors = await getSensorByRef(device.id, sensorT.ref, sensorT.property);

          if (sensors?.length) {
            const sensor = sensors[0];
            // !!!!!!
            // update is not working !!
            let obj = {
              active: sensorT.active,
              ref: sensorT.ref,
              name: sensorT.name,
              type: sensorT.type,
              property: sensorT.property
            }
            const rows = await updateSensor(sensor.id, obj);
            return rows?.[0] ?? null;
          } else {
            const rows = await addSensor(
              sensorT.model_id,
              device.id,
              sensorT.ref,
              sensorT.name,
              sensorT.type,
              sensorT.property
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
