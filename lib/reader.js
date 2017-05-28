/**
 * lib/reader
 *
 * handle nfc touches on a compatible reader via nfc-pcsc
 */


const NFC = require('nfc-pcsc');

const log = require('./logger');
const db = require('./db');
const sync = require('./sync');

const SECONDS_BETWEEN_RETOUCH = 10; // same card can't be tapped twice in X seconds
const MAX_SECONDS_FOR_TOUCH = 5; // hold the touch for X seconds and it won't count
const kegId = Number(process.env.ONTAP_KEG_ID); // env var for now, will move to config

log.debug('init reader module');
log.debug(`SECONDS_BETWEEN_RETOUCH is ${SECONDS_BETWEEN_RETOUCH}`);
log.debug(`MAX_SECONDS_FOR_TOUCH is ${MAX_SECONDS_FOR_TOUCH}`);
log.debug(`kegId is ${kegId}`);

const nfc = new NFC.default(); // eslint-disable-line new-cap

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

  if (
    cardUid === lastTouchCardUid &&
    ((touchTimestamp - lastTouchTimestamp) / 1000 < SECONDS_BETWEEN_RETOUCH)
    ) {
    log.info(`Detected double touch of card ${cardUid}, ignoring`);
    return Promise.resolve();
  }

  // add the Touch row
  return db.Touches.create({
    cardUid,
    kegId,
  })
  .then((touch) => {
    log.info(`recorded a touch from card ${cardUid}`);
    lastTouchTimestamp = touchTimestamp;
    lastTouchCardUid = cardUid;
    return touch;
  })
  .then(touch => sync.syncTouch(touch))
  .catch(error => log.error(error));
}


// reader and card events
nfc.on('reader', (reader) => {
  log.info('NFC reader connected');
  reader.autoProcessing = true; // eslint-disable-line no-param-reassign
  reader.aid = 'F222222222'; // eslint-disable-line no-param-reassign
  status.reader = true;

  reader.on('card', (card) => {
    log.info(`touch on from card ${card.uid}`);
    status.card = card;
    processTouch(card);
  });

  reader.on('cardOff', () => {
    log.info('touch off');
    status.lastCard = status.card;
    status.card = null;
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
