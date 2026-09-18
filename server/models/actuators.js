var mysql = require('mysql2');
var db = require('../controllers/db');
const moment = require('moment');

const Table = "actuators";

// Supported value types for an actuator.
//  - set    : stateless trigger, defaults to 1 when no value is provided
//  - switch : boolean-like value, only accepts 0/1
//  - number : any numeric value
//  - text   : any text value
//  - json   : any valid json structure
const TYPES = ['set', 'switch', 'number', 'text', 'json'];

const DEFAULT_VALUES = {
  set: 1
};

// Validates a value against the rules of the given actuator type.
// Returns null when valid, or an error message when invalid.
const validateValue = (type, value) => {
  if (!TYPES.includes(type)) {
    return `invalid type '${type}', expected one of: ${TYPES.join(', ')}`;
  }

  switch (type) {
    case 'switch':
      if (value !== 0 && value !== 1 && value !== '0' && value !== '1') {
        return "switch value must be 0 or 1";
      }
      break;
    case 'number':
      if (value === '' || value === null || value === undefined || isNaN(Number(value))) {
        return "number value must be numeric";
      }
      break;
    case 'text':
      if (typeof value !== 'string') {
        return "text value must be a string";
      }
      break;
    case 'json':
      try {
        if (typeof value === 'string') {
          JSON.parse(value);
        } else {
          JSON.stringify(value);
        }
      } catch (e) {
        return "json value must be a valid json structure";
      }
      break;
    case 'set':
    default:
      break;
  }

  return null;
};

var self = module.exports = {

  TYPES,
  DEFAULT_VALUES,
  validateValue,

  getById : async (id, cb)=>{

    if(!id)
      return cb("id is null",null);

    var table = [];
    var query = `select * from ?? where id = ?`;
    table.push(Table,id);

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows[0]);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  getByRef : async(deviceId, ref, property, cb)=>{
    if(!deviceId)
      return cb("Add deviceId to params",null);

    if(!ref)
      return cb("ref not known",null);

    var table = [];
    var query = `select * from ?? where device_id = ? and ref = ?`;
    table.push(Table,deviceId,ref);

    if(property){
      query += " and property = ?"
      table.push(property);
    }

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  add : async(model_id,device_id,ref,name,type,property,active,graph,cb)=>{
    if (typeof active === 'function') {
      cb = active;
      active = undefined;
    }
    if (typeof graph === 'function') {
      cb = graph;
      graph = undefined;
    }

    let obj = {
      model_id : model_id,
      device_id : device_id,
      ref : ref,
      name : name,
      type: type,
      property: property ? property : '',
      value: Object.prototype.hasOwnProperty.call(DEFAULT_VALUES,type) ? DEFAULT_VALUES[type] : null,
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    }
    if (active !== undefined) {
      obj.active = active;
    }

    if (graph !== undefined) {
      obj.graph = graph;
    }

    db.insert(Table,obj)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  update : async (id,property,value,cb)=>{

    let obj = {
      updatedAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };
    obj[property] = value;

    let filter = {
      id : id
    };

    db.update(Table,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  updateObject : async (id,obj,cb)=>{

    obj['updatedAt'] = moment().utc().format('YYYY-MM-DD HH:mm:ss');

    let filter = {
      id : id
    };

    db.update(Table,obj,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  delete : async (id,cb)=>{

    let filter = {
      id : id
    };

    db.delete(Table,filter)
    .then (rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    });
  },

  list : async (deviceId, cb)=>{

    if(!deviceId)
      return cb("Add deviceId to params",null);

    var table = [];
    var query = `select * from ?? where device_id = ?`;
    table.push(Table,deviceId);

    query = mysql.format(query,table);

    db.queryRow(query)
    .then(rows => {
      return cb(null,rows);
    })
    .catch(error => {
      return cb(error,null);
    })
  },

  // records a value write to logs_actuator so its history can be inspected
  addLog : async (device_id, actuator_id, value, cb)=>{

    let obj = {
      device_id : device_id,
      actuator_id : actuator_id,
      value: (value !== null && typeof value === 'object') ? JSON.stringify(value) : String(value),
      createdAt : moment().utc().format('YYYY-MM-DD HH:mm:ss')
    };

    try{
      const rows = await db.insert("logs_actuator",obj);
      if(cb) return cb(null,rows);
    }catch(error){
      if(cb) return cb(error,null);
      else console.error(error);
    }
  },

};
