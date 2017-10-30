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





