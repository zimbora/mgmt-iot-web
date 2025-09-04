
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

  getProjectID : function(cb){
    let path = "project/"
    let indexB = location.pathname.indexOf(path);
    let indexF = location.pathname.lastIndexOf("/");
    let modelID = location.pathname.substring(indexB+path.length,indexF);
    return modelID;
  },

  getModelID : function(cb){
    let path = "model/"
    let indexB = location.pathname.indexOf(path);
    let indexF = location.pathname.lastIndexOf("/");
    let modelID = location.pathname.substring(indexB+path.length,indexF);
    return modelID;
  },

  // get all registered projects
  getProjects : function(cb){

    $.ajax({
      url : Settings.api+'/projects',type: 'GET',
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

  // get all registered models
  getModels : function(cb){

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

  // add fw project
  addProject : (name, description, uid_prefix, uid_length, cb)=>{
    fetch(Settings.api+"/projects", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        description: description,
        uid_prefix: uid_prefix,
        uid_length: uid_length
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

  // remove project
  removeProject : (projectId, cb)=>{
    fetch(Settings.api+"/projects", {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: projectId
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

  // --- projects ---
  project : {
    listPermissions : function(projectId,cb){
      $.ajax({
        url : Settings.api+"/project/"+projectId+"/permissions",type: 'GET',
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

    grantPermission : function(projectId,clientId,level,cb){
      fetch(Settings.api+"/project/"+projectId+"/permissions", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientId,
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

    removePermission : function(projectId,clientId,cb){
      fetch(Settings.api+"/project/"+projectId+"/permissions", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientId,
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

  // --- requests related to a device ---

  device: {

    addSensor: (deviceId,ref,name,type,cb)=>{
      fetch(Settings.api+"/device/"+deviceId+"/sensors", {
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

    getSensors: (deviceId, cb)=>{
      $.ajax({
        url : Settings.api+"/device/"+deviceId+"/sensors",type: 'GET',
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

    getLwm2mObjects: (deviceId, cb)=>{
      $.ajax({
        url : Settings.api+"/device/"+deviceId+"/objects",type: 'GET',
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

    getLwm2mResources: (deviceId, objectId, cb)=>{
      $.ajax({
        url : Settings.api+"/device/"+deviceId+"/resources",type: 'GET',
        data : {
          objectId
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

    lwm2m: {

      // Add new object
      addObject: (deviceId, object, cb) => {
        fetch(Settings.api + `/device/${deviceId}/lwm2m/object`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(object)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Update existing object
      updateObject: (deviceId, entryId, object, cb) => {
        fetch(Settings.api + `/device/${deviceId}/lwm2m/object/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(object)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Delete object
      deleteObject: (deviceId, entryId, cb) => {
        fetch(Settings.api + `/device/${deviceId}/lwm2m/object/${entryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Add new resource
      addResource: (deviceId, resourceData, cb) => {
        console.log(Settings.api + `/device/${deviceId}/lwm2m/resource`);
        fetch(Settings.api + `/device/${deviceId}/lwm2m/resource`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resourceData)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Update existing resource
      updateResource: (deviceId, entryId, resourceData, cb) => {
        fetch(Settings.api + `/device/${deviceId}/lwm2m/resource/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resourceData)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Delete resource
      deleteResource: (deviceId, entryId, cb) => {
        fetch(Settings.api + `/device/${deviceId}/lwm2m/resource/${entryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      }
    },
    
  },
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

  triggerFota : (deviceID, cb)=>{
    fetch(Settings.api+"/device/"+deviceID+"/trigger/fota", {
      method: 'POST',
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

  addDevice: (deviceData, cb)=>{
    fetch(Settings.api+"/devices", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectName: deviceData.projectName,
        modelName: deviceData.modelName,
        templateId: deviceData.templateId,
        uid: deviceData.uid,
        name: deviceData?.name,
        protocol: deviceData.protocol,
        psk: deviceData?.psk
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

  // get all available mqtt clients with an email registered
  getHumanClients : function(cb){

    $.ajax({
      url : Settings.api+'/clientsHuman',type: 'GET',
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
  addModel : (name, project_id, description, cb)=>{
    fetch(Settings.api+"/models", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name,
        project_id: project_id,
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
  removeModel : (modelId,cb)=>{
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
  grantFWModelPermission : (model,clientId,level,cb)=>{
    fetch(Settings.api+"/model/"+model+"/permissions", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clientId: clientId,
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
  
  // add template
  addTemplate : (tag, name, project_id, cb)=>{
    fetch(Settings.api+"/project/"+project_id+"/template", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tag: tag,
        name: name
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

  // delete template
  deleteTemplate : (templateId, project_id, cb)=>{
    fetch(Settings.api+"/project/"+project_id+"/template/"+templateId, {
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
  },

  // LWM2M Objects and Resources API
  
  lwm2m: {

    // Get objects
    getObjects: (cb) => {
      fetch(Settings.api + "/lwm2m/objects", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data, cb);
      })
      .catch(function (error) {
        return parseError(error, cb);
      });
    },

    // Get resources
    getResources: (objectId, cb) => {
      const url = new URL(Settings.api + "/lwm2m/resources");
      url.searchParams.append('objectId', objectId); // Add objectId as a query parameter

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data, cb);
      })
      .catch(function (error) {
        return parseError(error, cb);
      });
    },

  },

  template: {

    list: (projectId, cb) => {
      const url = new URL(Settings.api + "/templates");
      if(projectId)
        url.searchParams.append('projectId', projectId); // Add projectId as a query parameter

      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      })
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        return parseResponse(data, cb);
      })
      .catch(function (error) {
        return parseError(error, cb);
      });
    },

    lwm2m: { // LWM2M Template Resources API

      // Get template objects
      getObjects: (templateId, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/objects`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Get template resources
      getResources: (templateId, objectId, cb) => {
        const url = new URL(`${Settings.api}/template/${templateId}/lwm2m/resources`);
        if (objectId) {
          url.searchParams.append('objectId', objectId);
        }
        fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          query: {
            objectId
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Add new object
      addObject: (templateId, object, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/object`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(object)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Update existing object
      updateObject: (templateId, entryId, object, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/object/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(object)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Delete object
      deleteObject: (templateId, entryId, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/object/${entryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Add new resource
      addResource: (templateId, resourceData, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/resource`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resourceData)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Update existing resource
      updateResource: (templateId, entryId, resourceData, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/resource/${entryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(resourceData)
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      },

      // Delete resource
      deleteResource: (templateId, entryId, cb) => {
        fetch(Settings.api + `/template/${templateId}/lwm2m/resource/${entryId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          return parseResponse(data, cb);
        })
        .catch(function (error) {
          return parseError(error, cb);
        });
      }
    },
  },
  


};

function parseResponse(data,cb){
  if(!data?.Error && !data?.error) cb(null,data.Result);
  else if(data?.Error) cb(data?.Message,null)
  else cb(data?.error,null);
}

function parseError(error,cb){
  console.log(error)
  cb(error.error)
}
