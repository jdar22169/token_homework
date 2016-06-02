'use strict';

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRouter = require('./routes/router.js');
const dbPort = process.env.MONGOLAB_URI || 'mongodb://localhost/dev_db';

mongoose.connect(dbPort);

app.use('/', authRouter);

app.use((err,req,res,next) => {
  res.status(500).json({error: err.message});
  next(err);
});
app.listen(3000, () => console.log('Listening on 3000'));
