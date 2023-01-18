
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
  updateClient : (client,user,cb)=>{
    fetch(Settings.api+"/clients", {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientID: client,
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
};

function parseResponse(data,cb){
  if(!data.Error) cb(null,data.Result);
  else cb(data.Message,null);
}

function parseError(error,cb){
  console.log(error)
}
