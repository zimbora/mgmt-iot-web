var Settings = {
  url : window.location.protocol+"//"+window.location.hostname+":"+window.location.port, //"http://10.168.1.69:4000",
  //url : window.location.protocol+"//"+window.location.hostname, //"http://10.168.1.69:4000",
  api : window.location.protocol+"//"+window.location.hostname+":"+window.location.port+"/api", //"http://10.168.1.69:4000/api"
  //api : window.location.protocol+"//"+window.location.hostname+"/api", //"http://10.168.1.69:4000/api"
  mqtt : {
    host : location.hostname,
    port : 8888,
    clientID : "clientId",
    user : "admin",
    password : "admin"
  }
};
