# sequelize-token-auth

## Summary:
This is a walkthrough for buiding a node/express app that uses json web tokens for auth and a postgres database and sequelize orm. The app is built with tests and is heavily influenced by Michael Herman's tutorial: http://mherman.org/blog/2016/10/28/token-based-authentication-with-node/#.We-bnWSnEWp

There is an angular front end that connects to this app at: https://github.com/Jufebrown/angular-token-auth

If you want to clone and run the code in this repo, you will need to run ```npm i``` to install the dependencies. Also you will need to add a .env file to the root directory with the appropriate contents. Please check the .env-example or read the section on creating the .env below.

## Tutorial Start:

### Install Dependencies
```
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.18.2",
    "cors": "^2.8.4",
    "dotenv": "^4.0.0",
    "express": "^4.16.2",
    "jwt-simple": "^0.5.1",
    "moment": "^2.19.1",
    "pg": "^7.3.0",
    "sequelize": "^4.15.0"
  },
  "devDependencies": {
    "mocha": "^4.0.1",
    "chai": "^4.1.2",
    "chai-http": "^3.0.0"
  }
```
- bcrypt hashes passwords
- body-parser gives you access to the request body
- cors deals with cross origin requests
- dotenv is for setting environment variables
- express is for setting up routing and the http listener
- jwt-simple is for the json web tokens - as Michael Herman say in his tutorial - use something more robust in an actual production app
- moment is for timestamping our tokens
- pg is the postgres database
-  sequelize is our orm
- mocha, chai, and chai-http are for testing

### Adding Scripts
Now that there is a package.json file add these scripts to the file for future ease:
```
  "scripts": {
    "db:reset": "sequelize db:migrate:undo:all && sequelize db:migrate",
    "start": "node bin/seq-tok",
    "test": "nodemon --exec \"mocha --recursive\" -R list"
  },
  ```

### Database
Time to create the database. Open psql in your terminal and run 
```
  CREATE DATABASE seq_tok;
  CREATE DATABASE seq_tok_test;
```
This makes a database for development and a database for testing.

### Quick express app

1. Back in your project directory:
``` 
$ mkdir bin
$ touch bin/seq_tok
$ touch app.js
```
2. In the new seq_tok file:
```
'use strict';

require('../app');
```
3. In the app.js file:
```
'use strict';

require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes/');

const app = express();

app.set('models', require('./models'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

app.use('/api/v1/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if(app.get('env') === 'development' || app.get('env') === 'test') {
  app.use((err,req,res,next) => {
    console.log('error', err);
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

//default to production
app.use((err,req,res,next) => {
  console.log('error', err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on port ${port} in env: ${process.env.NODE_ENV}`);
});

module.exports = app;
```
This requires in most of the modules we installed as dependencies and sets them up. It also sets up a listener, routes and some error handling for the middleware stack that we'll be adding.

You should comment out the ```app.use('/api/v1/', routes);``` line until we've added them.

### Sequelize setup
1. In the project directory:
```
$ sequelize init
```
2. Adjust the config.json file that is created:
```
 "development": {
   "database": "seq_tok",
   "host": "127.0.0.1",
   "dialect": "postgres"
 },
 "test": {
   "database": "seq_tok_test",
   "host": "127.0.0.1",
   "dialect": "postgres"
 },
```

### Let's create a Users table in our database
1. Make sure you have sequelize-cli installed globally and run (all one line):
```
sequelize model:create --name User --attributes username:string,password:string,admin:boolean
```
This will create folders for models and migrations and the model and migration file for User.

2. Modify the migration.
```
username: {
  allowNull: false,
  type: Sequelize.STRING
},
password: {
  allowNull: false,
  type: Sequelize.STRING
},
admin: {
  allowNull: false,
  defaultValue: false,
  type: Sequelize.BOOLEAN
},
```
3. Run migrations.
```
$ sequelize db:migrate
```
Check in psql to make sure the table columns are correct.
 
### Begin building auth
1. At the project root:
```
$ mkdir auth
$ touch auth/local.js
```
2. In the local.js file:
```
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
```
3. Generate secret key
- Either use https://github.com/broofa/node-uuid or if you have python (most mac users do) follow these steps in your terminal:
```
$ python
>>> import os
>>> os.random(24)
b'\x174\xddi\xd0\xbd\x0124!~\xda\x8bF\x90\x83\x9f\xa6,/\x11(\xcd\xf7'
>>>
```
- Add your secret key to the .env file
```
TOKEN_SECRET=\x174\xddi\xd0\xbd\x0124!~\xda\x8bF\x90\x83\x9f\xa6,/\x11(\xcd\xf7
```
### Let's test encode token.
1. Make a test folder and test file.
  ```
    $ mkdir test
    $ touch mkdir/auth.local.test.js
  ```
2. Write a test for encodeToken in auth.local.test.js:
```
'use strict';

process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();
const server = require('../app');
const localAuth = require('../auth/local');

describe('auth: local', () => {
  describe('encodeToken()', () => {
    it('should return a token', (done) => {
      const results = localAuth.encodeToken({id: 1});
      should.exist(results);
      results.should.be.a('string');
      done();
    });
  });
});
```
3. Run the test. It should pass.

### Add decodeToken function.
1. In local.js:
```
//decodes token
function decodeToken(token, callback) {
  const payload = jwt.decode(token, process.env.TOKEN_SECRET);
  const now = moment().unix();
  // check if the token has expired
  if (now > payload.exp) callback('Token has expired.');
  else callback(null, payload);
}

module.exports = {
  encodeToken,
  decodeToken
};
```
2. Write test in auth.local.test.js
```
describe('decodeToken()', () => {
  it('should return a payload', (done) => {
    const token = localAuth.encodeToken({id: 1});
    should.exist(token);
    token.should.be.a('string');
    localAuth.decodeToken(token, (err, res) => {
      should.not.exist(err);
      res.sub.should.eql(1);
      done();
    });
  });
});
```
3. Run tests. They should pass.

### TDD for a new user route
1. Make a new test file
```
$ touch test/routes.auth.test.js
```
2. Add db sync call in beforeEach.
```
'use strict';

process.env.NODE_ENV = 'test';

const app = require('../app');
const chai = require('chai');
const should = chai.should();
const server = require('../app');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('routes : auth', () => {
  beforeEach(() => {
    return app.get('models').sequelize.sync({force: true});   
  });
```
3. Add a describe block to test posting a new user.
```
describe('POST /auth/register', () => {
  it('should register a new user', (done) => {
    chai.request(server)
      .post('/api/v1/auth/register')
      .send({
        username: 'jufe',
        password: 'password'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        res.body.should.include.keys('status', 'token');
        res.body.status.should.eql('success');
        done();
      });
  });
});
```
4. Test should fail.
5. Start code to make tests pass
- ```$ mkdir routes```
- ```$ touch routes/index.js```
- In index.js:
```
'use strict';

// requirements and variable declarations
const { Router } = require('express');
const router = Router();

router.use(require('./auth'));

module.exports = router;
```
-```$ touch routes/auth.js```
- In auth.js:
```
const express = require('express');
const router = express.Router();
const {registerUser} = require('../controllers/authCtrl');

router.post('/auth/register', registerUser);

module.exports = router;
```
- ```$ mkdir controllers```
- ```$ touch controllers/authCtrl.js```
- In authCtrl.js:
```
const express = require('express');
const router = express.Router();

const localAuth = require('../auth/local');
const authHelpers = require('../auth/_helpers');

router.post('/auth/register', (req, res, next)  => {
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
});

module.exports = router;
```
- ```$ touch auth/_helpers.js```
- In _helpers.js:
```
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

```
- Test should pass.

### TDD Login route
1. Write the test (in routes.auth.test.js):
```
describe('POST/login', () => {
  it('should login a user', (done) => {
    chai.request(server)
      .post('/api/v1/auth/login')
      .send({
        username: 'aidan',
        password: 'password123'
      })
      .end((err, res) => {
        should.not.exist(err);
        res.redirects.length.should.eql(0);
        res.status.should.eql(200);
        res.type.should.eql('application/json');
        res.body.should.include.keys('status', 'token');
        res.body.status.should.eql('success');
        should.exist(res.body.token);
        done();
      });
  });
});
```
2. Modify beforeEach on tests so there is a user to login.
```
const bcrypt = require('bcryptjs');
	const {User} = app.get('models');
	
	beforeEach(() => {
    return app.get('models').sequelize.sync({force: true})
      .then(() => {
        const salt = bcrypt.genSaltSync();
        const hash = bcrypt.hashSync('password123', salt);
        User
          .create({
            id: null,
            username: 'aidan',
            password: hash
          });
      });
});
```
3. Test should fail.
4. Begin code to make test pass:
- Add a login route to routes/auth.js
```
const {registerUser, loginUser} = require('../controllers/authCtrl');
...
router.post('/auth/login', loginUser);
```
- Add loginUser() to authCtrl.js:
```
module.exports.loginUser = (req, res, next) => {
 const username = req.body.username;
 const password = req.body.password;
 return authHelpers.getUser(username)
  .then((response) => {
    authHelpers.comparePass(password, response.password);
    return response;
  })
  .then((response) => { return localAuth.encodeToken(response); })
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
```
- Add getUser and comparePass to _helpers.js
```
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
```
- Tests should pass.
5. Add test for an unregistered user (in routes.auth.test.js):
```
it('should not login an unregistered user', (done) => {
    chai.request(server)
      .post('/api/v1/auth/login')
      .send({
        username: 'sid',
        password: 'viscous'
      })
      .end((err, res) => {
        should.exist(err);
        res.status.should.eql(500);
        res.type.should.eql('application/json');
        res.body.status.should.eql('error');
        done();
      });
  });
```
6. Tests should still pass.
### TDD for user route
1. Write test (in routes.auth.test.js):
```
describe('GET /user', () => {
  it('should return a success', (done) => {
    chai.request(server)
      .post('/api/v1/auth/login')
      .send({
        username: 'aidan',
        password: 'password123'
      })
      .end((error, response) => {
        should.not.exist(error);
        chai.request(server)
          .get('/api/v1/auth/user')
          .set('authorization', 'Bearer ' + response.body.token)
          .end((err, res) => {
            should.not.exist(err);
            res.status.should.eql(200);
            res.type.should.eql('application/json');
            res.body.status.should.eql('success');
            done();
          });
      });
  });
  it('should throw an error if a user is not logged in', (done) => {
    chai.request(server)
      .get('api/v1/auth/user')
      .end((err, res) => {
        should.exist(err);
        res.status.should.eql(400);
        res.type.should.eql('application/json');
        res.body.status.should.eql('Please log in');
        done();
      });
  });
});
```
2. Tests should fail.
3. Begin code to make tests pass.
- Add route to auth.js
```
const {registerUser, loginUser, getUser} = require('../controllers/authCtrl');
	const authHelpers = require('../auth/_helpers');
	…
router.get('/auth/user', authHelpers.ensureAuthenticated, getUser);
```
- Add ensureAuthenticated() to _helpers.js
```
const localAuth = require('./local.js');
function ensureAuthenticated(req, res, next) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({
      status: 'Please log in'
    });
  }
  // decode the token
  var header = req.headers.authorization.split(' ');
  var token = header[1];
  localAuth.decodeToken(token, (err, payload) => {
    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      // check if the user still exists in the db
      User.findOne({where: {id: parseInt(payload.sub)}})
        .then((user) => {
          next();
        })
        .catch((err) => {
          res.status(500).json({
            status: 'error'
          });
        });
    }
  });
}
module.exports = {
  createUser,
  getUser,
  comparePass,
  ensureAuthenticated
};
```
- Add getUser to authCtrl.js
```
module.exports.getUser = (req, res, next) => {
  res.status(200).json({
    status: 'success',
  });
};
```
- Tests should pass
## End of tutorial.













