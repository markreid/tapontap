/**
 * lib/reader
 *
 * handle nfc touches on a compatible reader via nfc-pcsc
 */

const { NFC } = require('nfc-pcsc');

const log = require('./logger');
const touches = require('./touches');
const { numberFromEnv } = require('./util');

// load config from env
const MAX_SECONDS_FOR_TOUCH = numberFromEnv('MAX_SECONDS_FOR_TOUCH');
const kegId = numberFromEnv('ONTAP_KEG_ID');

// this is queryable via the API
const status = {
  kegId,
  reader: false,
  card: null,
  lastCard: null,
};

let cardOnTimestamp = new Date();


/**
 * Check whether the card was held on the reader
 * for longer than MAX_SECONDS_FOR_TOUCH.
 * @return {Boolean}
 */
function didNotHold() {
  const secondsSinceCardOn = (new Date() - cardOnTimestamp) / 1000;
  return secondsSinceCardOn <= MAX_SECONDS_FOR_TOUCH;
}

// handle card event
function cardOn(card) {
  log.info(`touch on with card ${card.uid}`);
  cardOnTimestamp = new Date();
  status.card = {
    uid: card.uid,
  };
}

// handle card.off event
function cardOff(card) {
  // card.off fires for unreadable cards too; ignore that
  if (status.card === null) {
    return false;
  }

  log.info(`touch off with card ${card.uid}`);
  status.lastCard = status.card;
  status.card = null;

  if (didNotHold()) {
    touches.handleTouch(card);
    return true;
  }
  return false;
}

// handle card error
function cardError() {
  // not sure whether we need to log this one tbh
  // just means someone's tapped an invalid card
  // on the reader...
  log.error('error parsing cardUid');
}

// handle reader end event
function readerEnd() {
  log.info('NFC reader disconnected');
  status.reader = false;
  status.lastCard = status.card || status.lastCard;
  status.card = null;
}


const nfc = new NFC();
nfc.on('reader', (reader) => {
  reader.autoProcessing = true; // eslint-disable-line no-param-reassign
  reader.aid = 'F222222222'; // eslint-disable-line no-param-reassign

  log.info('NFC reader connected');
  status.reader = true;

  reader
    .on('card', cardOn)
    .on('card.off', cardOff)
    .on('error', cardError)
    .on('end', readerEnd);
}).on('error', (error) => {
  log.error('Error from NFC reader');
  log.error(error);
});


module.exports = {
  getStatus() {
    return Object.assign({}, status);
  },
};
