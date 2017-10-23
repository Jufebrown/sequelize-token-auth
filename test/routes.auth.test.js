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
  describe('POST/register', () => {
    it('should register a new user', (done) => {
      chai.request(server)
        .post('/api/v1/register')
        .send({
          username: 'geronimo',
          password: 'password1'
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
  
  describe('POST/login', () => {
    it('should login a user', (done) => {
      chai.request(server)
        .post('/api/v1/login')
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
});