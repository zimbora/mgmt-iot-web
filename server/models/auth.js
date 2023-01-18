
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var mysql   = require("mysql2");

var config = require('../../config/env');
var Client = require('../models/clients');

module.exports = {
  check_authentication : (token,cb)=>{

    if(token == null) cb(false,"")
    else{
      if (typeof token == "string" && token.startsWith('Bearer '))
      token = token.slice(7, token.length); // Remove Bearer from string

      if (token) { // decode token
        jwt.verify(token, config.jwtSecret, function(err, decoded) { // verifies secret and checks exp
          if (err) cb(false,"")
          else{
            if(decoded.exp <= Math.round(Date.now()/1000)) cb(false,"")
            else cb(true,decoded);
          }
        });
      }else cb(false,"")
    }
  },

  check_token : (token,cb)=>{

    if(token == null) cb(false,"")
    else{
      if (typeof token == "string" && token.startsWith('Bearer '))
        token = token.slice(7, token.length); // Remove Bearer from string
      if (token) { // decode token
        Client.getByApiToken(token,(err,res)=>{
          if(!err && res != null && res.length > 0){
            cb(true,res[0]);
          }else if(err) cb(err,"")
          else cb(false,"")
        })
      }else cb(false,"")
    }
  },
}
