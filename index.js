
var web = require('./express-web');

var config = require('./config/env');
var device = require('./server/models/devices.js');
const mqtt = require('mqtt')

var user = require('./server/models/users');
mgmt_iot_version = "";

'use strict';
const {Docker} = require('node-docker-api');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = {

  init : (config)=>{

    var db = require('./server/controllers/db');
    db.connect(config,() => {
      db_setup();
      mgmt_iot_version = config?.version ? config.version : "";
      web.listen(config.web_port, () => {
        log.info('Web Server started and listening on port: ' +config.web_port + ' ' + config.env);
      });
      log.info("connected to DB");
    });

    var host = config.mqtt.host;
    const client  = mqtt.connect({
      protocolId: config.mqtt.protocol,
      host: config.mqtt.host,
      port:config.mqtt.port,
      username:config.mqtt.user,
      password:config.mqtt.pwd,
      clientId: config.mqtt.client
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
                  client.publish(topic+"/network/rx",String(rx_bytes));
                  client.publish(topic+"/network/rx/str",rx_bytes+" kB/s");

                  let tx_bytes = stats.networks?.eth0?.tx_bytes/1000;
                  tx_bytes = Math.round((tx_bytes + Number.EPSILON) * 1000) / 1000
                  client.publish(topic+"/network/tx",String(tx_bytes));
                  client.publish(topic+"/network/tx/str",tx_bytes+" kB/s");

                  client.publish(topic+"/cpus/online",String(stats.cpu_stats.online_cpus));

                  let mem_usage = stats.memory_stats?.usage/1000000;
                  mem_usage = Math.round((mem_usage + Number.EPSILON) * 1000) / 1000
                  client.publish(topic+"/memory/usage",String(mem_usage));
                  client.publish(topic+"/memory/usage/str",mem_usage+" MB");

                  let cpu_usage = stats.cpu_stats?.cpu_usage?.total_usage/stats.cpu_stats?.system_cpu_usage;
                  cpu_usage = Math.round((cpu_usage + Number.EPSILON) * 1000) / 1000

                  client.publish(topic+"/cpu/usage",String(cpu_usage));
                  client.publish(topic+"/cpu/usage/str",cpu_usage+" %");

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

    client.on('connect', function () {
      console.log("mqtt connected to: ",host);
      /*
      client.subscribe("#", function (err) {
        if(err) console.log(err);
      })
      */
    })

    client.on('message', function (topic, message) {
      // message is Buffer
      console.log(topic.toString(),message.toString())
    })

    client.on('error', function (error) {
      console.log("error:",error)
    })

    client.on('close', function () {
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
