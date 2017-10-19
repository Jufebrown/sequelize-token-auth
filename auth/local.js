'use strict';

const moment = require('moment');
const jwt = require('jwt-simple');

const encodeToken = (user) => {
  const payload = {
    exp: moment().add(14, 'days').unix(),
    iat: moment.unix(),
    sub: user.id
  };
  return jwt.encode(payload, process.env.TOKEN_SECRET);
}

module.exports = {
  encodeToken
};