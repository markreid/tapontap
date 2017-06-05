/**
 * lib/reader
 *
 * handle nfc touches on a compatible reader via nfc-pcsc
 */


const { NFC } = require('nfc-pcsc');

const log = require('./logger');
const db = require('./db');
const sync = require('./sync');

// same card can't be tapped twice in X seconds
const SECONDS_BETWEEN_RETOUCH = 10;
// hold the card on the reader for more than X seconds and we don't process the touch
// so you can hold the card there to register it
const MAX_SECONDS_FOR_TOUCH = 3;
// env var for now, will move to config
const kegId = Number(process.env.ONTAP_KEG_ID);

log.debug('init reader module');
log.debug(`SECONDS_BETWEEN_RETOUCH is ${SECONDS_BETWEEN_RETOUCH}`);
log.debug(`MAX_SECONDS_FOR_TOUCH is ${MAX_SECONDS_FOR_TOUCH}`);
log.debug(`kegId is ${kegId}`);

const nfc = new NFC();

const status = {
  kegId,
  SECONDS_BETWEEN_RETOUCH,
  MAX_SECONDS_FOR_TOUCH,
  reader: false,
  card: null,
  lastCard: null,
};


let lastTouchTimestamp = new Date();
let lastTouchCardUid = 0;

/**
 * Process a Touch.
 * Add it to the DB, attempt to sync it with our Ontap instance.
 * Ignore consecutive touches from the same card within
 * SECONDS_BETWEEN_RETOUCH value
 * @param  {Object} card
 */
function processTouch(card) {
  const touchTimestamp = new Date();
  const cardUid = card.uid;

  log.info(`processTouch for card ${cardUid}`);

  if (
    cardUid === lastTouchCardUid &&
    ((touchTimestamp - lastTouchTimestamp) / 1000 < SECONDS_BETWEEN_RETOUCH)
    ) {
    log.info(`Detected double touch of card ${cardUid}, ignoring`);
    return Promise.resolve();
  }

  // add the Touch row, then try and sync with our OnTap instance
  return db.Touches.create({
    cardUid,
    kegId,
  })
  .then((touch) => {
    log.info(`recorded a touch from card ${cardUid}, syncing...`);
    lastTouchTimestamp = touchTimestamp;
    lastTouchCardUid = cardUid;
    return touch;
  })
  .then(touch => sync.syncTouch(touch)
    .then(() => touch))
  .then((touch) => {
    log.info(`synced touch ${touch.id} with OnTap`);
    return touch;
  })
  .catch(error => log.error(error));
}


// reader and card events
nfc.on('reader', (reader) => {
  log.info('NFC reader connected');
  reader.autoProcessing = true; // eslint-disable-line no-param-reassign
  reader.aid = 'F222222222'; // eslint-disable-line no-param-reassign
  status.reader = true;

  let cardOnTimestamp = new Date();

  reader.on('card', (card) => {
    log.info(`touch on from card ${card.uid}`);
    status.card = card;
    cardOnTimestamp = new Date();
  });

  reader.on('card.off', (card) => {
    // card.off will fire even if card didn't, so we need to double check
    if (status.card === null) {
      return false;
    }

    log.info('touch off');
    log.info(card);

    const secondsSinceCardOn = (new Date() - cardOnTimestamp) / 1000;
    if (secondsSinceCardOn <= MAX_SECONDS_FOR_TOUCH) {
      // TODO - move the double-tap detection here, out of processTouch
      processTouch(status.card);
    }

    status.lastCard = status.card;
    status.card = null;
    return true;
  });

  reader.on('error', () => {
    log.info('error parsing cardUid');
  });

  reader.on('end', () => {
    log.info('NFC reader disconnected');
    status.reader = false;
    status.lastCard = status.card;
    status.card = null;
  });
}).on('error', (error) => {
  log.info('Error from NFC reader');
  log.error(error);
});


module.exports = {
  getStatus() {
    return Object.assign({}, status);
  },
  processTouch,
};
