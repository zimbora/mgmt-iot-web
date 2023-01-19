
var Joi = require('joi');
var httpStatus = require('http-status-codes');

var response = require('./response');

var Firmware = require('../models/firmwares');
var Client = require('../models/clients');

module.exports = {

  add : (req, res, next)=>{

    if (!req.file || Object.keys(req.file).length === 0) {
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"No files were uploaded");
    }

    const { version } = req.body;
    if(version == null){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"version not defined");
    }

    //const file = req.file;
    console.log(req.file)

    console.log("version:",version)

    let firmware = req.file;
    console.log("filename:",firmware.filename)
    console.log("firmware name:",firmware.originalname)
    console.log("version:",version)
    console.log("model:",req.params.model_id)

    Firmware.add(firmware.filename,firmware.originalname,version,req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    })


  },

  delete : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Firmware.delete(req.body.id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  update : (req, res, next)=>{
    /*
    const val = Joi.object({
      clientID: Joi.string().required(),
      user: Joi.string().required(),
      password: Joi.string().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Client.update(req.body.clientID,req.body.user,req.body.password,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
    */
    next();
  },

  updateRelease : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required(),
      release: Joi.string().required()
    }).validate(req.body);

    if(val.error){
      response.error(res,httpStatus.BAD_REQUEST,val.error.details[0].message)
    }else{
      Firmware.updateRelease(req.body.id,req.body.release,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  list : (req, res, next)=>{
    console.log("model:",req.params.model_id);
    Firmware.listByModel(req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  listModels : (req, res, next)=>{

    if(Client.isAdmin(req.user.level)){
      Firmware.listModels((err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }else{
      Firmware.listModelsWithClientPermission(req.user.id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }

  },

  get : (req, res, next)=>{

    // send file
    /*
    Firmware.getDevices(req.params.client_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
    */
  },

  addModel : (req,res,next)=>{
    const val = Joi.object({
      model: Joi.string().required(),
      description: Joi.string().required()
    }).validate(req.body);

    // check if user has permissions to create a model
    Firmware.addModel(req.user.id,req.body.model,req.body.description,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  deleteModel : (req,res,next)=>{
    const val = Joi.object({
      model: Joi.string().required()
    }).validate(req.body);

    // check if user has permissions to create a model
    Firmware.deleteModel(req.user.id,req.body.model,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  updateModel :(req,res,next)=>{
    response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"not supported");
  },


  listModelPermission : (req, res, next)=>{

    Firmware.listModelPermission(req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  grantModelPermission : (req, res, next)=>{

    const val = Joi.object({
      clientID: Joi.string().required(),
    }).validate(req.body);

    Firmware.grantModelPermission(req.body.clientID,req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  removeModelPermission : (req, res, next)=>{

    const val = Joi.object({
      id: Joi.number().required(),
    }).validate(req.body);

    Firmware.removeModelPermission(req.body.id,req.params.model_id,(err,rows)=>{
      if(!err) response.send(res,rows);
      else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
    });
  },

  checkModelOwnership : (req, res, next)=>{
    if(Client.isAdmin(req.user.level))
      return next();
    else{
      Firmware.checkModelOwnership(req.user.id,req.params.model_id,(err,access)=>{
        if(err) res.json({"Error" : true, "Message" : err, "Result" : null});
        else if(!access) res.json({"Error" : true, "Message" : "Not allowed", "Result" : null});
        else next();
      });
    }
  },

  checkModelAccess : (req, res, next)=>{
    if(Client.isAdmin(req.user.level))
      return next();
    else{
      Firmware.checkModelAccess(req.user.id,req.params.model_id,(err,access)=>{
        if(err) res.json({"Error" : true, "Message" : err, "Result" : null});
        else if(!access) res.json({"Error" : true, "Message" : "Not allowed", "Result" : null});
        else next();
      });
    }
  },

};
