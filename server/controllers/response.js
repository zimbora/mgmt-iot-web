var httpStatus = require('http-status-codes');

function error(res,error_code,message){
  res.status(error_code)
    .json({
      Error: true,
      Message: message,
      Result : null
    });
}

function send(res,data){
  res.status(httpStatus.OK)
    .json({
      Error : false,
      Message : "Success",
      Result : data
    });
}

module.exports =  {error,send};
