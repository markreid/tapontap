/**
 * lib/sync
 *
 * Handle syncing the touches with an Ontap instance
 */

const fetch = require('node-fetch');

const logger = require('./logger');
const db = require('./db');

const { ONTAP_INSTANCE } = process.env;

const headers = {
  'Content-Type': 'application/json',
};

/**
 * Ping the Ontap Instance and return the response
 * @return {Object} OnTap API response
 */
const ping = () => fetch(`${ONTAP_INSTANCE}/api/v1/ping`)
  .then(response => response.json())
  .then((data) => {
    logger.info(`ping got ${data.ping}`);
    return data;
  })
  .catch((error) => {
    logger.error(error);
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
  .then(response => response.json())
  .then((data) => {
    logger.info(data);
  })
  .then(() => db.markTouchesSynced(touchIds))
  .then(() => touches.length);
};

// shortcut for syncing a single touch
const syncTouch = touch => syncTouches([touch]);


module.exports = {
  ping,
  syncTouch,
  syncTouches,
};
