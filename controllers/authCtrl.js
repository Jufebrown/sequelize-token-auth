'use strict';
const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');


module.exports.registerUser = (req, res, next) => {
  return authHelpers.createUser(req)
    .then((user) => { return localAuth.encodeToken(user); })
    .then((token) => {
      res.status(200).json({
        status: 'success',
        token: token
      });
    })
    .catch((err) => {
      res.status(500).json({
        status: 'error'
      });
    });
};

