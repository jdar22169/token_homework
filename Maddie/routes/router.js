'use strict';

const express = require('express');
const bodyParser = require('body-parser').json();
const User = require('../model/user.js');
const authHttp = require('../lib/basic_http.js');
const verifyToken = require('../lib/verifyToken.js');

const authRouter = module.exports = exports = express.Router();

authRouter.post('/signup', bodyParser, (req,res,next) => {
  let newUser = new User(req.body);
  newUser.password = newUser.hashPassword();
  req.body.password = null;
  User.findOne({username:req.body.username}, (err,user) => {
    if(err || user) return next(new Error('User already exists'));
    newUser.save((err,user) => {
      if(err) return next(new Error('Could not save user'));
      res.json({token: user.generateTokens(), username: req.body.username});
    });
  });
});

authRouter.get('/login', authHttp, verifyToken, (req,res,next) => {
  User.findOne({username: req.authorization.username}, (err,user) => {
    if(err || !user) return next(new Error('No user found'));
    if(!user.comparePassword(req.authorization.password)) return next (new Error('Password incorrect'));
    res.json({token: user.generateTokens(), user: req.username});
  });
});
