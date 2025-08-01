var jwt = require('jsonwebtoken');
var httpStatus = require('http-status-codes');
const { OAuth2Client } = require('google-auth-library'); // gauth

var response = require('./response');
var config = require('../../config/env');
var User = require('../models/users');
var Client = require('../models/clients');
var Auth = require('../models/auth');
var Firmware = require('../models/firmwares');

function check_authentication(req, res, next) {

  Auth.check_authentication(req.session.token,(authenticated,user)=>{
    if(user && user.agent == req.get('User-Agent') && user.ip==req.ip){
      if(authenticated) {
        req.user = user;
      }
    }
    next()
  });
}

function api_check_authentication(req, res, next) {

  if(req.headers.hasOwnProperty('token')){
    Auth.check_token(req.headers['token'],(authenticated,user)=>{
      if(authenticated) {
        req.user = user;
        next()
      }else{
        res.status(401).json({
          error: 'Unauthorized'
        });
      }
    })
  }else{
    Auth.check_authentication(req.session.token,(authenticated,user)=>{
      if(authenticated) {
        req.user = user;
        next()
      }else{
        res.status(401).json({
          error: 'Unauthorized'
        });
      }
    });
  }
}

function authenticate_email(req, res, next) {

  User.findUserByEmail(req.body.email,req.body.password,(err,result)=>{
    if(err) res.json({message:"Failure"});
    else if(result == null) res.json({message:"wrong credentials"});
    else{
      req.user = result;
      next();
    }
  });
}

function authenticate(req, res, next) {

  if(req.body.password == "")
    return res.json({message:"Failure"});

  Client.get(req.body.user,req.body.password,(err,result)=>{
    if(err) res.json({message:"Failure"});
    else if(result == null) res.json({message:"User and password doesn't match"});
    else{
      req.user = result;
      next();
    }
  });
}

// web client
async function authenticate_google(req,res,next){

  let access_token = "";
  if(req.query.token != null)
    access_token = req.query.token;
  else if(req.body.token != null)
    access_token = req.body.token;

  // clientId has to be the same that was used in front end app
  //const clientId = "72512997406-nbev1bnp4lhv9uauejrdsjni7ev1s7f3.apps.googleusercontent.com";
  const clientId = config.googleClientId;
  const client = new OAuth2Client(clientId);

  try{
    const ticket = await client.verifyIdToken({
      idToken: access_token,
      audience: clientId
    });
    const data = ticket.getPayload();
    const userId = await User.getId(config.new_client.user_type);

    Client.findGoogleClient(data.email, (err,result)=>{
      if(err) res.json({message:"Failure"});
      else if(result == null){
        // register user
        Client.registerGoogleClient(userId,data,(err,result)=>{
          if(err){
            console.log(err);
            res.json({message:"Failure"});
          }
          else if(result == null) res.json({message:"Couldn't register user"});
          else{
            Client.findGoogleClient(data.email,(err,result)=>{
              if(err) res.json({message:"Failure"});
              else if(result == null) res.json({message:"Something went wrong during user registration"});
              else{
                req.user = result;
                next();
              }
            });
          }
        });
      }
      else{
        req.user = result;
        next();
       }
    });

  }catch(error){
    log.warn("Google Unauthorized");
    res.json({message:"Unauthorized"});
  }
}

function deauth(req, res, cb) {
  req.session.token = null;
  cb(res,res);
}

function generateToken(req, res, next) {
  if (!req.user) return next();

  const jwtPayload = {
    user_id : req.user.user_id,
    type: req.user.type,
    level: req.user.level,
    client_id : req.user.client_id,
    nick: req.user.nick,
    name: req.user.name,
    ip : req.ip,
    agent: req.get('User-Agent'),
    avatar: req.user.avatar,
  };
  const jwtData = {
    expiresIn: config.jwtDuration,
  };
  const secret = config.jwtSecret;

  req.session.token = jwt.sign(jwtPayload, secret, jwtData);

  //User.updateWsToken(req.user.client_id,req.session.token.substr(req.session.token.length-20,req.session.token.length),(error,res)=>{log.debug(error,res)});

  next();
}

function respondJWT(req, res) {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized'
    });
  } else {
    res.status(200).json({
      message:"Success",
      token:req.session.token
    });
  }
}

function fw_check_token(req,res,next){

  let token = req.headers.token || req.query.token;
  if(token == null)
    response.error(res,httpStatus.BAD_REQUEST,"No token defined");
  else{
    Firmware.getFirmwareToken(token,req.params.fwId,(err,rows)=>{
      if(err) response.error(res,httpStatus.INTERNAL_SERVER_ERROR,err);
      else if(rows == null || rows.length == 0) response.error(res,httpStatus.INTERNAL_SERVER_ERROR,"token not valid");
      else next();
    })
  }
}

module.exports = {
  check_authentication,
  api_check_authentication,
  authenticate_email,
  authenticate,
  authenticate_google,
  deauth,
  generateToken,
  respondJWT,
  fw_check_token
};
