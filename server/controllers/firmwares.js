var path = require('path');
var Joi = require('joi');
var httpStatus = require('http-status-codes');
const fs = require('fs');
const crypto = require('crypto');
const crc = require('crc');

var response = require('./response');

var Firmware = require('../models/firmwares');
var Client = require('../models/clients');
var Model = require('../models/models');

module.exports = {

  add : (req, res, next)=>{

    if (!req.file || Object.keys(req.file).length === 0) {
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"No files were uploaded");
    }

    const { fw_version,app_version } = req.body;
    if(fw_version == null){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"fw version not defined");
    }
    if(app_version == null){
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"app version not defined");
    }

    let firmware = req.file;

    if(!firmware.hasOwnProperty("filename"))
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"filename not defined");
    if(!firmware.hasOwnProperty("originalname"))
      response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"originalname not defined");

    Firmware.add(firmware.filename,firmware.originalname,fw_version,app_version,req.params.model_id,(err,rows)=>{
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
    if(Client.isAdmin(req.user.level)){
      Firmware.list((err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }else{
      Firmware.listWithClientPermission(req.user.client_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  listByModel : (req, res, next)=>{

    if(Client.isAdmin(req.user.level)){
      Firmware.listByModel(req.params.model_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }else{
      Firmware.listByModelWithClientPermission(req.user.client_id,req.params.model_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  listModels : (req, res, next)=>{

    if(Client.isAdmin(req.user.level)){
      Model.list((err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }else{
      Model.listWithClientPermission(req.user.client_id,(err,rows)=>{
        if(!err) response.send(res,rows);
        else response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      });
    }
  },

  get : (req, res, next)=>{

    // send file
    var filePath = "";
    if( process.env?.NODE_ENV.toLowerCase().includes("docker") ){
      filePath = path.join("/mgmt-iot/devices/firmwares/"+req.params.fwId);
    }else{
      filePath = path.join(__dirname, "../public/firmwares/"+req.params.fwId);
    }
     
    const file = fs.readFileSync(filePath);
    const hash = crypto.createHash('md5').update(file).digest('hex');
    res.set('Content-MD5', hash);
    // Calculate CRC32
    const crc32 = crc.crc32(file).toString(16); // Convert to hexadecimal string
    res.set('Content-CRC32', crc32);
    // Calculate CRC16
    const crc16Modbus = crc.crc16modbus(file); // CRC16 Modbus calculation
    res.set('Content-CRC16', crc16Modbus.toString(16)); // Convert to hexadecimal string    
    res.sendFile(filePath);
    
  },

};
