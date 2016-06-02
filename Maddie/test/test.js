'use strict';

const chai = require('chai');
const chaiHTTP = require('chai-http');

chai.use(chaiHTTP);
const expect = chai.expect;
const request = chai.request;

const User = require('../model/user.js');
const mongoose = require('mongoose');
const verifyToken = require('../lib/verifyToken.js');
const authHTTP = require('../lib/basic_http.js');
const jsonwt = require('jsonwebtoken');

const secret = process.env.SECRET || 'test';

const dbPort = process.env.MONGOLAB_URI;
process.env.MONGOLAB_URI = 'mongodb://localhost/3000/test';

require('../server.js');

describe('Token Tests', () => {
  after((done) => {
    process.env.MONGOLAB_URI = dbPort;
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });
  it('should sign up a new user on post', (done) => {
    request('localhost:3000')
    .post('/signup')
    .send({username:'klay', password:'curry'})
    .end((err,res) => {
      expect(err).to.eql(null);
      expect(res.body).to.have.property('token');
      expect(res.body.username).to.eql('klay');
      done();
    });
  });
});

describe('Unit tests', () => {
  after((done) => {
    process.env.MONGOLAB_URI = dbPort;
    mongoose.connection.db.dropDatabase(() => {
      done();
    });
  });
  describe('Verify Token', () => {
    let testUser;
    before((done) => {
      let newUser = new User({username:'Steve', password: 'Kerr'});
      newUser.save((err,user) => {
        testUser = user;
        done();
      });
    });
    it('should decode token', (done) => {
      let token = jsonwt.sign({_id:testUser._id}, secret);
      let req = {headers:{token}, username:testUser.username };

      verifyToken(req, null, function() {
        expect(req.username).to.eql('Steve');
        done();
      });
    });
    it('should send error when invalid token', (done) => {
      let token = jsonwt.sign({_id:'invalid'}, secret);
      let req = {headers:{token}};


      verifyToken(req,null,function(err) {
        expect(err.message).to.eql('Not Authorized');
        done();
      });
    });
  });
  describe('it should create basic authorization', () => {
    it('should parse basic auth', (done) => {
      let authorization = 'Basic ' + ((new Buffer('Klay:Splash', 'utf8')).toString('base64'));
      let req = {headers:{authorization}};

      authHTTP(req,{},() => {
        expect(req.authorization.username).to.eql('Klay');
        expect(req.authorization.password).to.eql('Splash');
        done();
      });
    });
    it('should send error when invalid field', (done) => {
      let authorization = 'Basic ' + ((new Buffer('Klay', 'utf8')).toString('base64'));
      let req = {headers:{authorization}};

      authHTTP(req,{}, (err) => {
        expect(err.message).to.eql('No username or password');
        done();
      });
    });
  });
});
