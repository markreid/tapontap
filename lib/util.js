/**
 * lib/util
 */


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

module.exports = {
  numberFromEnv,
};
