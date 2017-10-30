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