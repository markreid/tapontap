/**
 * lib/reader
 *
 * handle nfc touches on a compatible reader via nfc-pcsc
 */


const NFC = require('nfc-pcsc');

const logger = require('./logger');
const db = require('./db');
const { syncTouch } = require('./sync');

const SECONDS_BETWEEN_RETOUCH = 10;

logger.debug(`init reader module with SECONDS_BETWEEN_RETOUCH=${SECONDS_BETWEEN_RETOUCH}`);


const nfc = new NFC.default(); // eslint-disable-line new-cap

const status = {
  reader: false,
  card: null,
  lastCard: null,
};


let lastTouchTimestamp = new Date();
let lastTouchCardId = 0;

/**
 * Process a Touch.
 * Add it to the DB, attempt to sync it with our Ontap instance.
 * Ignore consecutive touches from the same card within
 * SECONDS_BETWEEN_RETOUCH value
 * @param  {Object} card
 */
function processTouch(card) {
  const touchTimestamp = new Date();
  const cardId = card.uid;

  if (
    cardId === lastTouchCardId &&
    ((touchTimestamp - lastTouchTimestamp) / 1000 < SECONDS_BETWEEN_RETOUCH)
    ) {
    logger.info(`Detected double touch of card ${cardId}, ignoring`);
    return Promise.resolve();
  }

  // add the Touch row
  return db.Touches.create({
    cardId,
  })
  .then((touch) => {
    logger.info(`recorded a touch from card ${cardId}`);
    lastTouchTimestamp = touchTimestamp;
    lastTouchCardId = cardId;
    return touch;
  })
  .then(touch => syncTouch(touch))
  .catch((error) => {
    logger.error(error);
  });
}


nfc.on('reader', (reader) => {
  logger.info('NFC reader connected');
  reader.autoProcessing = true; // eslint-disable-line no-param-reassign
  reader.aid = 'F222222222'; // eslint-disable-line no-param-reassign
  status.reader = true;

  reader.on('card', (card) => {
    logger.info(`touch on from card ${card.uid}`);
    status.card = card;
    processTouch(card);
  });

  reader.on('cardOff', () => {
    logger.info('touch off');
    status.lastCard = status.card;
    status.card = null;
  });

  reader.on('end', () => {
    logger.info('NFC reader disconnected');
    status.reader = false;
    status.lastCard = status.card;
    status.card = null;
  });
}).on('error', (error) => {
  logger.error(error);
});


module.exports = {
  getStatus() {
    return Object.assign({}, status);
  },
};
