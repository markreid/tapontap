/**
 * lib/cron
 *
 * do things periodically.
 */

const sync = require('./sync');
const log = require('./logger');
const { numberFromEnv } = require('./util');

const SYNC_EVERY_SECONDS = numberFromEnv('SYNC_EVERY_SECONDS');

log.info('init cron script');
log.info(`will sync every ${SYNC_EVERY_SECONDS} seconds`);


// check for unsynchronised touches and attempt to sync them all
function runSync() {
  log.info('lib/cron is running processUnsyncedTouches()');

  sync.processUnsyncedTouches()
  .catch(() => {}) // already gets logged, can ignore this
  .then(() => {
    log.info(`runSync() complete, running again in ${SYNC_EVERY_SECONDS} seconds`);
    setTimeout(runSync, SYNC_EVERY_SECONDS * 1000);
  });
}

setTimeout(runSync, SYNC_EVERY_SECONDS * 1000);
