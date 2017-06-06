/**
 * lib/sync
 *
 * Handle syncing the touches with an Ontap instance
 */

const fetch = require('node-fetch');

const log = require('./logger');
const db = require('./db');

const { ONTAP_INSTANCE, ONTAP_AUTH_TOKEN } = process.env;

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer: ${ONTAP_AUTH_TOKEN}`,
};


// create an error from a bad fetch response
function wrapFetchError(fetchResponse) {
  const { status, statusText } = fetchResponse;
  const error = new Error(statusText);
  return Object.assign(error, {
    status,
    statusText,
  });
}

/**
 * Ping the Ontap Instance and return the response
 * @return {Object} OnTap API response
 */
const ping = () => fetch(`${ONTAP_INSTANCE}/api/v1/ping`)
  .then(response => response.json())
  .then((data) => {
    log.info(`ping got ${data.ping}`);
    return data;
  })
  .catch((error) => {
    log.error(error);
  });


/**
 * Sends touches to the OnTap instance and
 * marks them as synced in the db.
 * @param  {Object[]} touches
 * @return {Promise}
 */
const syncTouches = (touches) => {
  const touchIds = touches.map(touch => touch.id);

  return fetch(`${ONTAP_INSTANCE}/api/v1/touches`, {
    method: 'POST',
    body: JSON.stringify(touches),
    headers,
  })
  .then((response) => {
    if (!response.ok) {
      throw wrapFetchError(response);
    }
    return response.json();
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
  .catch((error) => {
    log.info('Error processing unsynced touches:');
    log.error(error);
    throw error;
  });

module.exports = {
  ping,
  syncTouch,
  syncTouches,
  processUnsyncedTouches,
};
