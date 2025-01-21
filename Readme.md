
# mgmt-iot IoT device management platform

mgmt-iot is a module to enable a web platform to configure and interact with IoT devices.
A special firmware has to be running on those IoT devices [esp32-freeRTOS2](https://github.com/zimbora/esp32-freeRTOS2).
For now, only esp32 architecture is supported.
It can be used with wifi or bg95 modem.
A link will be published here to download firmware, as soon as it is available

This module also relies on a dedicated mqtt broker.
This broker was developed to check authorizations before subscribe or publish calls.
Please check this [mqtt-broker-auth](https://github.com/zimbora/mqtt-broker-auth) for more information about mqtt broker operation
The purpose of this broker is to allow users to connect directly to devices in which they have permissions for that.

This module will enable the management of those permissions, as well as configure and interact with iot devices.

Furthermore, without any development a device can be configured to have it's own Autorequests, Alarms or even a dedicated JavaScript code running in real time.
JavaScript code can be changed at any time. The code is limited to some internal calls and JavaScript functions.

All devices will have the most recent available firmware version. They can be configured to receive any version (dev), beta versions (beta), stable versions (stable) or non updatable (critical).
Firmware download can be done over http or https, it depends on how this platform was setup. This download is made automatically and is protected with SHA256 tokens.

All devices are visible only to admin accounts. However, dedicated accounts can be created and configured to have access to one or more devices.

It is not need to use this platform to interact with devices, yet only mqtt clients with the right granted permissions can have access to devices.
Connecting to the mqtt broker auth service, any client can interact and acquire data in real time.

## MySql

For now it depends on mysql, so it is needed to have a mysql 8 running.
In mysql folder, there is a database that needs to be loaded in mysql.
After that, use the struct config to init platform device management.
Change values according to your setup

```
require("./middleware") // optional, execute it, only if you will work on a middleware
var iot = require('mgmt-iot');

let config = {
    env: process.env.NODE_ENV || 'development',
  db: {
    conn_limit: process.env.DB_CONN_LIMIT || 15,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'user',
    pwd: process.env.DB_PWD   || 'pwd',
    name: process.env.DB_NAME || 'mqtt-aedes',
  },
  mqtt: {
    protocol:process.env.MQTT_PROTOCOL || 'MQTT',
    host:process.env.MQTT_HOST || 'localhost',
    port:process.env.MQTT_PORT || '1883',
    user:process.env.MQTT_USER || 'user',
    pwd:process.env.MQTT_PWD || 'pwd',
    client:process.env.MQTT_CLIENT || 'client'
  },
  debug:{
    level: process.env.NODE_DEBUG || "trace"
  },
  domain: process.env.DOMAIN || "localhost",
  web_port: process.env.WEB_PORT || 80,
  public_path:  '../server/public',
  ftp: { // hard to setup with nginx as proxy, working locally
    enabled: process.env.FTP_ENABLE || false,
    port: process.env.FTP_PORT || 21,
    user_default: process.env.FTP_USER_DEFAULT || "anonymous",
    pwd_default: process.env.FTP_PWD_DEFAULT || "anonymous",
    pasv_url: process.env.FTP_PASV_URL || "127.0.0.1", // change it for your server DNS
    pasv_min: process.env.FTP_PASV_MIN || 30010, // min range tcp ports
    pasv_max: process.env.FTP_PASV_MAX || 30012, // max range tcp ports
    download: process.env.FTP_DOWNLOAD || true, // allow download
    upload: process.env.FTP_UPLOAD || false, // allow upload
  }
}

var iot = require('mgmt-iot');
iot.init(config);
global.iot_path = iot.path() // optional, use it to get files from module
```

And that's it, your program is ready to run

## MQTT

[mqtt-broker-auth](https://github.com/zimbora/mqtt-broker-auth)

Note: This module must be used with a special mqtt broker. So, in order to have it working properly you need to run mqtt-broker-auth also

## FTP

passive connections - hard to configure with nginx !!

## Adding features to this module

 A middleware can be defined to customize this iot platform. For each page not served in the module, it is possible to serve it with a middleware like it.

 Create a file with middleware.js

 Copy the following code

```
var express = require('express');
const middleware = express.Router();

// Pages not served by mgmt-iot module can be served by this middleware

// check all pages requested and not served by module
middleware.use((req,res,next) => {
  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  log.trace("route url: "+fullUrl);
  next();
});

// A special tab is implemented in iot platform, you can use it to implement a dedicated dashboard
middleware.get('/device/:device_id/dashboard',(req,res)=>{
  res.render('./server/public/views/pages/device/dashboard',{user:req.user,page:'Dashboard', path:global.iot_path});
});

// Other pages can be served as well

// In the end redirect user to the home page if no page was served before
middleware.use((req,res,next)=>{
  console.log("url not found");
  res.redirect(req.protocol + '://' + req.get('host') +'/home');
});

global.middleware = module.exports =  middleware;
```

## How it works

### Login
At any moment if no login account exists or doesn't have admin privileges, the following credentials can be used
- user: admin
- password : admin

They will always work and grant admin access, until a new account with admin privileges is registered

This can be done adding an user with level 5 and associate a client account to it

### Dashboard
Define DB_CONTAINER_NAME to get docker stats from that container and show on dashboard

### Google Auth
Google Login is also supported.
Define GOOGLE_CLIENT_ID env variable to set your google account id for your project.

When a new user is registered with a google account a new a mqtt client will be
created, using email prefix as the client id and the credentials set with env vars:
- USER_TYPE
- USER_PWD
- USER_LVL

for mqtt user and respective permissions.
