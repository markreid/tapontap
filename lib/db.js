/**
 * lib/db
 * sequelize model definitions, etc
 */

const path = require('path');
const Sequelize = require('sequelize');

const logger = require('./logger');

const sequelize = new Sequelize(null, null, null, {
  dialect: process.env.DB_DIALECT,
  storage: process.env.DB_STORAGE,
  logging: logger.debug,
});


// import models
const Touches = sequelize.import(path.join(__dirname, '/../models', 'touch.js'));


// get all touches
const getAllTouches = () => Touches.findAll();

// get touches where synced !== null
const getSyncedTouches = () => Touches.findAll({
  where: {
    synced: {
      $not: null,
    },
  },
});

// get touches where synced == null
const getUnsyncedTouches = () => Touches.findAll({
  where: {
    synced: null,
  },
});

// set the synced timestamp on a set of touches
const markTouchesSynced = touchIds => Touches.update({
  synced: new Date(),
}, {
  where: {
    id: {
      $in: touchIds,
    },
  },
});

module.exports = {
  sequelize,
  Touches,
  getAllTouches,
  getSyncedTouches,
  getUnsyncedTouches,
  markTouchesSynced,
};
