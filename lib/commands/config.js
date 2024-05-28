const configManager = require('../configManager');

async function displayConfig(commandLineOptions) {
    const activeConfig = await configManager.generateActiveConfig(commandLineOptions);
    console.log(JSON.stringify(activeConfig, null, 2));
}

module.exports = {
    displayConfig
};