
var api = {

  // uses local path to get device id
  getDeviceID : function(cb){
    let path = "device/"
    let indexB = location.pathname.indexOf(path);
    let indexF = location.pathname.lastIndexOf("/");
    let deviceID = location.pathname.substring(indexB+path.length,indexF);
    return deviceID;
  },

  // uses local path to get device id
  getClientID : function(cb){
    let path = "client/"
    let indexB = location.pathname.indexOf(path);
    let indexF = location.pathname.lastIndexOf("/");
    let clientID = location.pathname.substring(indexB+path.length,indexF);
    return clientID;
  },

  getModelID : function(cb){
    let path = "model/"
    let indexB = location.pathname.indexOf(path);
    let indexF = location.pathname.lastIndexOf("/");
    let modelID = location.pathname.substring(indexB+path.length,indexF);
    return modelID;
  },


  // --- models ---
  model : {
    updateOption : function(modelId,option,val,cb){
      fetch(Settings.api+"/model/"+modelId+"/option", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          option: option,
          enable: val,
        })
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data,cb);
      })
      .catch(function (error) {
        return parseError(error,cb);
      });
    },

    getSensors : function(modelId,cb){
      $.ajax({
        url : Settings.api+"/model/"+modelId+"/sensors",type: 'GET',
        data : {},
        success: function(data,status,xhr){
          parseResponse(data,cb);
        },
        error: (data,status,xhr)=>{
          parseError(data,cb);
        },
        dataType : "JSON"
      });
    },

    addSensor: (modelId,ref,name,type,cb)=>{
      fetch(Settings.api+"/model/"+modelId+"/sensor", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ref: ref,
          name: name,
          type: type
        })
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data,cb);
      })
      .catch(function (error) {
        return parseError(error,cb);
      });
    },

    updateSensor : function(modelId,sensorId,property,value,cb){
      fetch(Settings.api+"/model/"+modelId+"/sensor", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sensor_id: sensorId,
          property: property,
          value: value
        })
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data,cb);
      })
      .catch(function (error) {
        return parseError(error,cb);
      });
    },
  },

  // get all registered devices
  getDevices : function(cb){

    $.ajax({
      url : Settings.api+'/devices/list',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },

  // --- requests related to a device ---

  // get clients with access to the device
  getClientsWithAccessToDevice : function(deviceID,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/clients',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },

  getDeviceInfo : function(deviceID,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/info',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  getDeviceLogs : function(deviceID,sensor,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/logs',type: 'GET',
      data : {
        sensor:sensor
      },
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  getFwLogs : function(deviceID,sensor,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/fw/logs',type: 'GET',
      data : {
        sensor:sensor
      },
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  getSensorLogs : function(deviceID,sensor,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/sensor/logs',type: 'GET',
      data : {
        sensor:sensor
      },
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  // get clients with access to the device
  getDeviceAutorequests : function(deviceID,cb){
    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/autorequests',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },

  // get clients with access to the device
  getDeviceAlarms : function(deviceID,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/alarms',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },

  // get clients with access to the device
  getDeviceJSCode : function(deviceID,cb){

    $.ajax({
      url : Settings.api+'/device/'+deviceID+'/jscode',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },

  updateDeviceRelease : (deviceID,release, cb)=>{
    fetch(Settings.api+"/device/"+deviceID+"/release", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        release: release
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  updateDeviceSettings : (deviceID,settings,cb)=>{
    fetch(Settings.api+"/device/"+deviceID+"/settings", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        settings: settings
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  updateDeviceProjectField : (deviceID,field,data,cb)=>{
    fetch(Settings.api+"/device/"+deviceID+"/project/field", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        field: field,
        data: data
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  deleteDevice : (deviceID, cb)=>{

    fetch(Settings.api+"/device/"+deviceID, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // --- ----- ---

  // --- user ---

  // get all available mqtt users
  getUsers : function(cb){

    $.ajax({
      url : Settings.api+'/users',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },
  // add mqtt client
  addUser : (user,pwd,level,cb)=>{
    fetch(Settings.api+"/users", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user,
        pwd: pwd,
        level: level
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // delete mqtt client
  deleteUser : (user,cb)=>{
    fetch(Settings.api+"/users", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // update mqtt client
  updateUser : (user,pwd,level,cb)=>{
    fetch(Settings.api+"/users", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: user,
        pwd: pwd,
        level: level,
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // --- ----- ---

  // --- client ---

  // get all available mqtt clients
  getClients : function(cb){

    $.ajax({
      url : Settings.api+'/clients',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });

  },
  // add mqtt client
  addClient : (client,user,password,cb)=>{
    fetch(Settings.api+"/clients", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientID: client,
        user: user,
        password: password
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // delete mqtt client
  deleteClient : (client,cb)=>{
    fetch(Settings.api+"/clients", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientID: client
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // update mqtt client
  updateClient : (client,pwd,user,cb)=>{
    fetch(Settings.api+"/clients", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientID: client,
        password: pwd,
        user: user
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // get devices in which client has access
  getDevicesOfClient : function(clientID,cb){

    $.ajax({
      url : Settings.api+'/client/'+clientID+'/devices',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },
  // add permission to client to access device
  addPermission : (clientID,device,level,cb)=>{
    fetch(Settings.api+"/client/"+clientID+"/permissions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device: device,
        level: level
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // remove permission from client to access device
  removePermission : (clientID,device,cb)=>{
    fetch(Settings.api+"/client/"+clientID+"/permissions", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device: device
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  // update permission to client to access device
  updatePermission : (clientID,device,level,cb)=>{
    fetch(Settings.api+"/client/"+clientID+"/permissions", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        device: device,
        level: level
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  getMqttCredentials : (cb)=>{

    if(window.location.protocol == "https:"){
      Settings.mqtt.ssl = true;
      Settings.mqtt.port = 443;
    }

    $.ajax({
      url : Settings.api+'/mqtt/credentials',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  // --- ----- ---

  // --- firmwares ---

  // get all firmwares models
  getFWModels : function(cb){

    $.ajax({
      url : Settings.api+'/models',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  // get fw model info
  getFWModelInfo : function(modelId,cb){

    $.ajax({
      url : Settings.api+'/model/'+modelId,type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  // add fw model
  addFWModel : (model,description,cb)=>{
    fetch(Settings.api+"/models", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        description: description
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // remove fw model
  removeFWModel : (modelId,cb)=>{
    fetch(Settings.api+"/model/"+modelId, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // list FW Model Permission
  listFWModelPermission : (model,cb)=>{
    fetch(Settings.api+"/model/"+model+"/permissions", {
      method: 'GET',
      headers: {},
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // add FW Model Permission to client
  grantFWModelPermission : (model,clientID,cb)=>{
    fetch(Settings.api+"/model/"+model+"/permissions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientID: clientID
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // get all firmwares
  getFirmwares : function(model,cb){

    $.ajax({
      url : Settings.api+'/model/'+model+'/firmwares',type: 'GET',
      data : {},
      success: function(data,status,xhr){
        parseResponse(data,cb);
      },
      error: (data,status,xhr)=>{
        parseError(data,cb);
      },
      dataType : "JSON"
    });
  },

  // remove FW Model Permission from client
  removeFWModelPermission : (model,id,cb)=>{
    fetch(Settings.api+"/model/"+model+"/permissions", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // add permission to client to access device
  addFirmware : (modelID,file,fw_version,app_version,cb)=>{

    const formData = new FormData();

    formData.append('fw_version', fw_version);
    formData.append('app_version', app_version);
    formData.append('file', file);

    fetch(Settings.api+"/model/"+modelID+"/firmwares", {
      method: 'POST',
      body: formData
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  // remove permission from client to access device
  removeFirmware : (model,id,cb)=>{
    fetch(Settings.api+"/model/"+model+"/firmware", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },

  updateFwRelease : (model,id,release,cb)=>{

    fetch(Settings.api+"/model/"+model+"/firmware", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id,
        release: release,
      })
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  /*
  updateFirmware : (file,model,release,version,cb)=>{

    const formData = new FormData();

    formData.append('version', version);
    formData.append('file', file);

    fetch(Settings.api+"/model/"+model+"/firmware", {
      method: 'PUT',
      body: formData
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  },
  */
  getDBLoad : (cb)=>{
    fetch(Settings.api+"/db/load", {
      method: 'GET',
      headers: {},
    })
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      return parseResponse(data,cb);
    })
    .catch(function (error) {
      return parseError(error,cb);
    });
  }
};

function parseResponse(data,cb){
  if(!data.Error) cb(null,data.Result);
  else cb(data.Message,null);
}

function parseError(error,cb){
  console.log(error)
}
