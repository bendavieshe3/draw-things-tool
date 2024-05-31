const utils = require('../utils');

/**
 * Function to display the configuration excluding specified keys.
 * @param {object} activeConfig - The original configuration object.
 * @param {Array<string>} keysToRemove - The keys to be removed from the output.
 */
async function displayConfig(activeConfig, keysToRemove = []) {
    const configWithoutKeys = utils.removeKeys(activeConfig, keysToRemove);
    console.log(JSON.stringify(configWithoutKeys, null, 2));
}

module.exports = {
    displayConfig
};