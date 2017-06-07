/**
 * lib/util
 */

const log = require('./logger');

/**
 * Pull a value from an environment variable and
 * coerce it to a Number.
 * Throws if NaN by default
 * @param  {String}  envVarName
 * @param  {Boolean} throwNan
 * @return {Number}
 */
function numberFromEnv(envVarName, throwNan = true) {
  const value = Number(process.env[envVarName]);
  if (throwNan && value !== value) { // eslint-disable-line no-self-compare
    throw new Error(`${envVarName} is not a Number`);
  }
  return value;
}


/**
 * Returns a function that logs an error and re-throws it.
 * Use with promise chains:
 * .catch(logAndThrow('this operation failed'));
 * Will prepend str if passed, attempts to log error.message
 * but falls back to logging the entire error.
 * @param  {String} str   string
 * @return {Function}
 */
function logAndThrow(str) {
  return (error) => {
    if (str && error.message) {
      log.error(`${str}: ${error.message}`);
    } else {
      log.error(error.message || error);
    }
    throw error;
  };
}

module.exports = {
  numberFromEnv,
  logAndThrow,
};
