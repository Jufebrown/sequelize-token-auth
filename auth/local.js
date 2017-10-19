'use strict';

const moment = require('moment');
const jwt = require('jwt-simple');

// encodes token
function encodeToken(user) {
  const payload = {
    // expiration date of token. moment is an npm module
    exp: moment().add(14, 'days').unix(),
    // time token is generated
    iat: moment().unix(),
    // subject of token
    sub: user.id
  };
  // set TOKEN_SECRET in .env file
  return jwt.encode(payload, process.env.TOKEN_SECRET);
}

module.exports = {
  encodeToken
};