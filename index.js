/**
 * TapOnTap Server
 */


// load .env file first
require('dotenv-safe').load();

const express = require('express');
const http = require('http');
const morgan = require('morgan');

const logger = require('./lib/logger');
const db = require('./lib/db');
const api = require('./routes/api');


const app = express();


// sync models
db.sequelize.sync().then(() => {
  logger.info('sequelize models synced');
});

// log requests
app.use(morgan('dev', {
  stream: logger.morganStream,
}));

// api routes
app.use('/api/v1/', api);

// listen up
const server = http.Server(app); // eslint-disable-line new-cap
server.listen(process.env.PORT, () => {
  logger.info(`tapontap listening on ${process.env.PORT}`);
});
