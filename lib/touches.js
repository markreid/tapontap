/**
 * lib/touches
 *
 * business logic for receiving touches from the reader and storing them.
 */

const log = require('./logger');
const db = require('./db');
const sync = require('./sync');
const { numberFromEnv } = require('./util');


// load config from env
const kegId = numberFromEnv('ONTAP_KEG_ID');
const SECONDS_BETWEEN_RETOUCH = numberFromEnv('SECONDS_BETWEEN_RETOUCH');

let lastTouchTimestamp = new Date();
let lastTouchCardUid = 0;

/**
 * Detect a duplicate touch; ie, same card
 * was touched on 2+ times within SECONDS_BETWEEN_RETOUCH
 * @return {Boolean}
 */
function isDuplicateTouch(cardUid) {
  return (cardUid === lastTouchCardUid) &&
    ((new Date() - lastTouchTimestamp) / 1000 < SECONDS_BETWEEN_RETOUCH);
}

/**
 * Process a Touch.
 * Add it to the DB and attempt to sync it with our Ontap instance.
 * @param  {Object} card
 * @return {Promise.Touch}
 */
function processTouch(card) {
  const cardUid = card.uid;
  lastTouchTimestamp = new Date();
  lastTouchCardUid = cardUid;

  log.info(`processTouch for card ${cardUid}`);

  // add the Touch row, then try and sync with our OnTap instance
  return db.Touches.create({
    cardUid,
    kegId,
  })
  .then((touch) => {
    log.info(`recorded a touch from card ${cardUid}, syncing...`);

    return sync.syncTouch(touch)
    .catch((error) => {
      log.info(`Unable to sync touch ${touch.id} with OnTap`);
      log.error(error);
    })
    .then(() => {
      log.info(`synced touch ${touch.id} with OnTap`);
      return touch;
    });
  })
  .catch(error => log.error(error));
}


// process the touch if it's not a dupe
function handleTouch(card) {
  if (!isDuplicateTouch(card.uid)) {
    return processTouch(card);
  }
  log.info(`duplicate touch detected for card ${card.uid}`);
  return false;
}

module.exports = {
  processTouch,
  isDuplicateTouch,
  handleTouch,
};
