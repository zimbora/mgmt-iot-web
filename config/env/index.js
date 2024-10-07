
var key = {}
try{
  key = require("./keys");
}catch(e){
  key = {
    gauthweb : ""
  }
}

module.exports = {
  public_path:'server/public',
  jwtSecret: process.env.JWT_SECRET || 'my-api-secret',
  jwtDuration: process.env.JWT_DURATION || '2 hours',
  googleClientId: process.env.GOOGLE_CLIENT_ID || key.gauthweb,
  container:{
    db: process.env.DB_CONTAINER_NAME || 'mgmt-iot-devices_db_1'
  },
  /*
  when a new user is registered with a google account a new a mqtt client will be
  created with email prefix as the client id and the following credentials for mqtt account
  */
  new_client : {
    user_type: process.env.USER_TYPE || "client",
    user_pwd: process.env.USER_PWD || "client_pwd",
    user_lvl: process.env.USER_LVL || 3
  },
  ftp : {
    enabled: process.env.FTP_ENABLE || true,
    port: process.env.FTP_PORT || 3021,
    user_default: process.env.FTP_USER_DEFAULT || "anonymous",
    pwd_default: process.env.FTP_USER_DEFAULT || "anonymous",
  }
}
