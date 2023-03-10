var express = require('express');
var authCtrl = require('../controllers/auth');

const router = express.Router();

router.route('/token')
  /** POST /api/auth/token Get JWT authentication token */
  .post(authCtrl.authenticate,
    authCtrl.generateToken,
    authCtrl.respondJWT);

module.exports =  router;
