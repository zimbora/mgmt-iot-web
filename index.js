$ = {}
const mqtt = require('mqtt')
const fs = require('fs');
const path = require('path');

var web = require('./express-web');

var config = require('./config/env');
var device = require('./server/models/devices.js');

var user = require('./server/models/users');
mgmt_iot_version = "";

'use strict';
const {Docker} = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = {

  init : (settings)=>{

    $.config = settings;
    
    // Setup global exception handlers to prevent application exit except in dev mode
    const isDev = settings?.environment === 'development';
    
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      
      if (isDev) {
        // In dev mode, let the application exit as normal
        process.exit(1);
      } else {
        // In production, prevent exit and continue running
        console.error('Application continuing despite uncaught exception...');
      }
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Promise Rejection at:', promise, 'reason:', reason);
      
      if (isDev) {
        // In dev mode, let the application exit as normal
        process.exit(1);
      } else {
        // In production, prevent exit and continue running
        console.error('Application continuing despite unhandled promise rejection...');
      }
    });
    
    var db = require('./server/controllers/db');
    db.connect(settings,() => {
      db_setup();
      mgmt_iot_version = settings?.version ? settings.version : "";
      web.listen(settings?.web?.port, () => {
        log.info('Web Server started and listening on port: ' +settings?.web?.port + ' ' + settings?.env);
      });
      log.info("connected to DB");
    });

    var host = settings?.mqtt?.host;
    $.mqttClient = mqtt.connect({
      protocolId: settings?.mqtt?.protocol,
      host: settings?.mqtt?.host,
      port:settings?.mqtt?.port,
      username:settings?.mqtt?.user,
      password:settings?.mqtt?.pwd,
      clientId: settings?.mqtt?.client
    })

    docker.container.list()
      .then(containers =>{

        containers.forEach(function (container) {
          let id = container.data.Image;
          console.log("id: ",id);

          container.status()
            .then(status => {

              status.stats()
              .then(stream => {

                stream.on('data', function (chunk) {
                  const stats = JSON.parse(chunk.toString());

                  let topic = 'docker/container'+stats.name

                  let rx_bytes = stats.networks?.eth0?.rx_bytes/1000
                  rx_bytes = Math.round((rx_bytes + Number.EPSILON) * 1000) / 1000
                  $.mqttClient.publish(topic+"/network/rx",String(rx_bytes));
                  $.mqttClient.publish(topic+"/network/rx/str",rx_bytes+" kB/s");

                  let tx_bytes = stats.networks?.eth0?.tx_bytes/1000;
                  tx_bytes = Math.round((tx_bytes + Number.EPSILON) * 1000) / 1000
                  $.mqttClient.publish(topic+"/network/tx",String(tx_bytes));
                  $.mqttClient.publish(topic+"/network/tx/str",tx_bytes+" kB/s");

                  $.mqttClient.publish(topic+"/cpus/online",String(stats.cpu_stats.online_cpus));

                  let mem_usage = stats.memory_stats?.usage/1000000;
                  mem_usage = Math.round((mem_usage + Number.EPSILON) * 1000) / 1000
                  $.mqttClient.publish(topic+"/memory/usage",String(mem_usage));
                  $.mqttClient.publish(topic+"/memory/usage/str",mem_usage+" MB");

                  let cpu_usage = stats.cpu_stats?.cpu_usage?.total_usage/stats.cpu_stats?.system_cpu_usage;
                  cpu_usage = Math.round((cpu_usage + Number.EPSILON) * 1000) / 1000

                  $.mqttClient.publish(topic+"/cpu/usage",String(cpu_usage));
                  $.mqttClient.publish(topic+"/cpu/usage/str",cpu_usage+" %");

                });

                stream.on('error', function (err) {
                  console.log(err);
                });

                stream.on('end', function () {
                  console.log('Stream ended');
                });
              })

            })


        });
      })
      .catch(error => console.log(error));

    $.mqttClient.on('connect', function () {
      console.log("mqtt connected to: ",host);
      /*
      $.mqttClient.subscribe("#", function (err) {
        if(err) console.log(err);
      })
      */
    })

    $.mqttClient.on('message', function (topic, message) {
      // message is Buffer
      console.log(topic.toString(),message.toString())
    })

    $.mqttClient.on('error', function (error) {
      console.log("error:",error)
    })

    $.mqttClient.on('close', function () {
      console.log("mqtt closed")
    })
    
  },

  path : ()=>{
    return __dirname+'/server/public/views';
  },

  deviceInfo : (deviceID,cb)=>{
    device.getInfo(deviceID,(err,rows)=>{
      return cb(err,rows);
    })
  },

  deviceLastValues : (deviceID,cb)=>{
    device.getLastValues(deviceID,(err,object)=>{
      return cb(err,object);
    })
  },
}

function db_setup(){
  let {user_type,user_pwd,user_lvl} = config.new_client;
  user.addIfNotRegistered(user_type,user_pwd,user_lvl,(err,res)=>{
    if(err){
      console.log(err);
      console.log("error registering user type:",user_type)
    }
  });
}
