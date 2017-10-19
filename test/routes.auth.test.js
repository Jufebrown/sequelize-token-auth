'use strict';

process.env.NODE_ENV = 'test';

const app = require('../app');
const chai = require('chai');
const should = chai.should();
const sequelize = require('sequelize');
const server = require('../app');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('routes : auth', () => {
  
  beforeEach(() => {
    app.get('models').sequelize.sync({force: true});    
  });

  describe('POST /auth/register', () => {
    it('should register a new user', (done) => {
      chai.request(server)
        .post('/auth/register')
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
  
});