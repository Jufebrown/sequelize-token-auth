const bcrypt = require('bcryptjs');

function createUser(req) {
  const {User} = req.app.get('models');
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

module.exports = {
  createUser
};