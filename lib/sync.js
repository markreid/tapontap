/**
 * lib/sync
 *
 * Handle syncing the touches with an Ontap instance
 */

const fetch = require('node-fetch');

const log = require('./logger');
const db = require('./db');
const { logAndThrow } = require('./util');

const { ONTAP_INSTANCE, ONTAP_AUTH_TOKEN } = process.env;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer: ${ONTAP_AUTH_TOKEN}`,
};


// wrap fetch to automatically parse json responses
// and throw errors based on http status.
function fetchJSON(...args) {
  return fetch(...args)
  .catch(() => {
    throw new Error('Network Error');
  })
  .then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response.json();
  });
}

/**
 * Ping the Ontap Instance and return the response
 * @return {Object} OnTap API response
 */
const pingOnTap = () => fetchJSON(`${ONTAP_INSTANCE}/api/v1/ping`)
  .then((data) => {
    log.info(`pingOnTap got ${data.ping}`);
    return data;
  })
  .catch(logAndThrow('pingOnTap failed'));


/**
 * Sends touches to the OnTap instance and
 * marks them as synced in the db.
 * @param  {Object[]} touches
 * @return {Promise.Number} number of touches synced
 */
const syncTouches = (touches) => {
  const touchIds = touches.map(touch => touch.id);

  return fetchJSON(`${ONTAP_INSTANCE}/api/v1/touches`, {
    method: 'POST',
    body: JSON.stringify(touches),
    headers,
  })
  .then(() => db.markTouchesSynced(touchIds))
  .then(() => touches.length);
};

// shortcut for syncing a single touch
const syncTouch = touch => syncTouches([touch]);

/**
 * Find and attempt to sync all of the unsynced touches.
 * @return {Promise.Number} Number of synced touches
 */
const processUnsyncedTouches = () => db.getUnsyncedTouches()
  .then((touches) => {
    if (touches.length) {
      log.info(`There are ${touches.length} unsynced touches.`);
      return syncTouches(touches)
      .then((numSynced) => {
        log.info(`Successfully synchronised ${numSynced} touches.`);
        return numSynced;
      });
    }
    log.info('0 unsynced touches to process.');
    return 0;
  })
  .catch(logAndThrow('processUnsyncedTouches failed'));

module.exports = {
  pingOnTap,
  syncTouch,
  processUnsyncedTouches,
};
