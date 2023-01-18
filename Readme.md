
# mgmt-iot IoT device management platform

mgmt-iot is a module to enable a web platform to configure and intereact with IoT devices.
A special firmware have to be running on those IoT devices.
For now, only esp32 architecture is supported.
It can be used with wifi or bg95 modem.
A link will be published here to download firmware, as soon as it is available

This module also relies on a dedicated mqtt broker.
This broker was developed to check authorizations before subscribe or publish calls.
Please check this [link](not available for now) for more information about mqtt broker operation
The purpose of this broker is to allow users to connect directly to devices in which they have permissions for that.

This module will enable the management of those permissions, as well as configure and interact with iot devices.

## MySql

For now it depends on mysql, so it is needed to have a mysql 8 running.
In mysql folder, there is a database that needs to be loaded in mysql.
After that, use the struct config to init platform device management.
Change values according to your setup

```
require("./middleware") // optional, execute it, only if you will work on a middleware
var iot = require('mgmt-iot');

let config = {
  db: {
    host:'localhost',
    user:'user',
    pwd:'user_pwd',
    name:'mqtt-aedes', // db name
  },
  debug:{
    level: "trace" // logs level (ignore it for now)
  },
  web_port : 24000, // http port to expose
}

var iot = require('mgmt-iot');
iot.init(config);
global.iot_path = iot.path() // optional, use it to get files from module
```

And that's it, your program is ready to run

## MQTT

Note: This module must be used with a special mqtt broker. So, in order to have it working properly you need to run mqtt-broker-auth also

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

At any moment if no login account exists or doesn't have admin privileges, the following credentials can be used
- user: admin
- password : admin

They will always work and grant admin access, until a new account with admin privileges is registered

This can be done adding an user with level 5 and associate a client account to it
