var Lwm2m = require('../models/lwm2m');

var Joi = require('joi');
var httpStatus = require('http-status-codes');
var response = require('./response');

module.exports = {

  getObjects : (req,res,next)=>{

    Lwm2m.getObjects((err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  getResources : (req,res,next)=>{

    const val = Joi.object({
      objectId: Joi.number(),
    }).validate(req.query);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Lwm2m.getResources(req.query?.objectId,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },
}