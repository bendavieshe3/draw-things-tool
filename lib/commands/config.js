async function displayConfig(activeConfig) {
    console.log(JSON.stringify(activeConfig, null, 2));
}

module.exports = {
    displayConfig
};