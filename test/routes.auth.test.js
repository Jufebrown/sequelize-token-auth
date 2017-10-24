'use strict';

process.env.NODE_ENV = 'test';

const app = require('../app');
const chai = require('chai');
const should = chai.should();
const server = require('../app');
const bcrypt = require('bcryptjs');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const {User} = app.get('models');

describe('routes : auth', () => {
  
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

  // tests register route
  describe('POST /auth/register', () => {
    it('should register a new user', (done) => {
      chai.request(server)
        .post('/api/v1/auth/register')
        .send({
          username: 'geronimo',
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

  // tests login route
  describe('POST /auth/login', () => {
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
  });

  describe('GET /auth/user', () => {
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
        .get('/api/v1/auth/user')
        .end((err, res) => {
          should.exist(err);
          res.status.should.eql(400);
          res.type.should.eql('application/json');
          res.body.status.should.eql('Please log in');
          done();
        });
    });
  });

});
