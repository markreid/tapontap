/**
 * API
 */


const Router = require('express').Router;

const db = require('../lib/db');
const log = require('../lib/logger');
const reader = require('../lib/reader');
const sync = require('../lib/sync');
const libTouches = require('../lib/touches');


// log an error and send a 500 to the client
function errorHandler(err, res) {
  log.error(err);
  res.status(500).send();
}

const router = new Router();


// return current status on the reader
const getReaderStatus = (req, res) => {
  res.send(reader.getStatus());
};

// return all touches in the db
const getTouches = (req, res) => db.getAllTouches()
  .then(touches => res.send(touches))
  .catch(error => errorHandler(error, res));

// return all unsynced touches in the db
const getUnsyncedTouches = (req, res) => db.getUnsyncedTouches()
  .then(touches => res.send(touches))
  .catch(error => errorHandler(error, res));

// return all synced touches in the db
const getSyncedTouches = (req, res) => db.getSyncedTouches()
  .then(touches => res.send(touches))
  .catch(error => errorHandler(error, res));

// fetch all unsynced touches and sync them.
// return success flag and synced count
const syncAllTouches = (req, res) => libTouches.processUnsyncedTouches()
  .then((synced) => {
    res.status(200).send({ success: true, synced });
  })
  .catch((error) => {
    log.error(error);
    res.status(500).send({ success: false, error });
  });

// simple ping response
const ping = (req, res) => res.send({ ping: 'pong' });

// ping the ontap instance to test for connectivity
const pingOntap = (req, res) => sync.ping()
  .then(data => res.send(data))
  .catch(error => res.send(error));


// eslint-disable-next-line no-unused-vars
const simulateTouch = (req, res) => {
  reader.processTouch({
    uid: '3c06736e',
  })
  .then(() => res.send({ success: true }));
};


router.get('/status', getReaderStatus);
router.get('/touches/unsynced', getUnsyncedTouches);
router.get('/touches/synced', getSyncedTouches);
router.get('/touches', getTouches);
router.get('/sync', syncAllTouches);
router.get('/ping', ping);
router.get('/pingontap', pingOntap);

// router.get('/touch', simulateTouch);

module.exports = router;
