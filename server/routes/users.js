var express = require('express');

const router = express.Router();

router.use((req,res,next) => {
  log.debug("users route");
  next();
});


module.exports =  router;
