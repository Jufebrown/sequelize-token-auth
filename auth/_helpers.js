const bcrypt = require('bcryptjs');
const {User} = require('../models');


function createUser(req) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return User
    .create({
      id: null,
      username: req.body.username,
      password: hash
    })
    .then((data) => {
      return data.dataValues;
    });
}

function getUser(username) {
  return User.findOne({where: {username: username}})
    .then((data) => {
      return data.dataValues;
    });
}

function comparePass(userPassword, databasePassword) {
  const bool = bcrypt.compareSync(userPassword, databasePassword);
  if (!bool) throw new Error('bad pass silly monkey');
  else return true;
}

module.exports = {
  createUser,
  getUser,
  comparePass
};