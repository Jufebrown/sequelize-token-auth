const bcrypt = require('bcryptjs');
// const sequelize = require('sequelize');

function createUser(req) {
  const {user} = req.app.get('models');
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(req.body.password, salt);
  return user
    .create({
      username: req.body.username,
      password: hash
    })
    .returning('*');
}

module.exports = {
  createUser
};