'use strict';

const jsonwt = require('jsonwebtoken');
const User = require('../model/user.js');
const secret = process.env.SECRET || 'changeme';

module.exports = function(req,res,next) {
  let token = req.headers.token;
  let tokenError = new Error('Not Authorized');
  let decodedToken;

  if(!token) return next(tokenError);

  try{
    decodedToken = jsonwt.verify(token, secret);
  } catch (e) {
    return next(tokenError);
  }

  User.findOne({_id:decodedToken._id}, (err,user) => {
    if(!user || err) return next(tokenError);
    req.username = user.username;
    next();
  });
};
