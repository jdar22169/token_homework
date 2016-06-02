'use strict';

module.exports = function(req,res,next) {
  let authString = (req.headers.authorization).split(' ').pop();
  let authBuffer = new Buffer(authString, 'base64');
  let authArray = (authBuffer.toString()).split(':');

  authBuffer.fill(0);

  req.authorization = {
    username: authArray[0],
    password: authArray[1]
  };
  if(!req.authorization.username || !req.authorization.password) {
    return next(new Error('No username or password'));
  }
  next();
};
