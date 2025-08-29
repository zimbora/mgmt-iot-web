$ = {}
const mqtt = require('mqtt')
const FtpSrv = require('ftp-srv');
const crc = require('crc');
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

const ftpPath = './server/public/'

module.exports = {

  init : (settings)=>{

    $.config = settings;
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

    // --- FTP Server ---
    
    // Init ftp server
    const ftpServer = new FtpSrv({
      url: "ftp://127.0.0.1:" + settings?.ftp?.port,
      anonymous: false,
      blacklist: ['STOR'],
      tls: false,
      pasv_url: settings?.ftp?.pasv_url,
      pasv_min: settings?.ftp?.pasv_min,
      pasv_max: settings?.ftp?.pasv_max,
    });

    if( settings?.ftp && settings?.ftp?.enabled ){
      ftpServer.listen().then(() => { 
        console.log(`FTP Server is running on port: ${settings?.ftp?.port}`);
      });
    }
    
    ftpServer.on('login', ({ ftpConnection, username, password }, resolve, reject) => {
      // You can implement your own user authentication here
      console.log('username:',username);
      console.log('password:',password);

      if(username !== settings?.ftp?.user_default && settings?.ftp?.pwd_default !== 'anonymous'){
        return reject(new errors.GeneralError('Invalid username or password', 401));
      }

      resolve({ root: path.join(__dirname, './server/public/') });
    });

    if( settings?.ftp?.upload){
      ftpServer.on('STOR', async (conn) => {
          const filePath = path.join(__dirname, './server/public/', conn.args[0]);
          const fileStream = fs.createWriteStream(filePath);
          conn.stream.pipe(fileStream);

          fileStream.on('finish', () => {
              console.log(`File uploaded: ${filePath}`);
          });
          
          conn.stream.on('data', (chunk) => {
              const crcValue = crc.crc16xmodem(chunk);
              console.log(`CRC16 for the received chunk: ${crcValue.toString(16)}`);
          });
      });
    }

    if( settings?.ftp?.download){
      ftpServer.on('RETR', async (conn) => {
          const filePath = path.join(__dirname, ftpPath, conn.args[0]);
          const fileStream = fs.createReadStream(filePath);
        
          // Calculate CRC16 for the file content
          let fileCRC = crc.crc16xmodem();
          fileStream.on('data', (chunk) => {
              fileCRC.update(chunk);
          });

          fileStream.on('end', () => {
              console.log(`CRC16 for the file ${conn.args[0]}: ${fileCRC.digest().toString('hex')}`);
          });

          conn.stream.pipe(fileStream);
      });
    }

    ftpServer.on('client-error', ({connection, context, error}) => { 
      console.log("client error: ",error);
    });

    ftpServer.on('server-error', ({error}) => { 
      console.log("server error: ",error);
    });

    ftpServer.on('disconnect', ({connection, id, newConnectionCount}) => { 
      console.log("disconnected id: ",id);
    });
    
    // --- ----- ---
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
