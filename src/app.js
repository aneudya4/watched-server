require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const watchlistRouter = require('./watchlist/watchlist-router');
const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';
const logger = require('./logger');

const app = express();

app.use(
  morgan(NODE_ENV === 'production' ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test',
  })
);
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('authorization');
  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  // move to the next middleware
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/api/watchlist', watchlistRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;

  if (NODE_ENV === 'production') {
    response = { error: 'Server error!' };
    response = { message: error.message, error };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
