// lib/commands/generate.js
const path = require('path');
const configManager = require('../configManager');
const apiManager = require('../apiManager');
const utils = require('../utils');
const config = require('../../config'); // Adjusted path
const placeholders = require('../../placeholders'); // Adjusted path

async function generateImages(limit, preview, projectPath, overridePrompt) {
    console.log(`Using base URL ${config.apiService.baseURL}`);

    // Load project configuration
    const projectConfig = configManager.loadProjectConfig(projectPath);

    // Fetch and display the current configuration from the server
    let serverConfig;
    try {
        serverConfig = await apiManager.fetchConfiguration(config.apiService.baseURL);
        console.log('Current server configuration:', serverConfig);
    } catch (error) {
        console.error('Unable to fetch and display the server configuration.');
        return;
    }

    const differingConfig = configManager.getDifferingConfig(serverConfig, projectConfig);
    console.log('Differing configuration:', differingConfig);

    // Use the overridePrompt if provided, otherwise use the projectConfig basePrompt
    const basePrompt = overridePrompt || projectConfig.basePrompt;

    // Check that all placeholders in the prompt are defined
    const placeholdersInPrompt = utils.checkPlaceholdersDefined(basePrompt, placeholders);

    let count = 0;
    const allCombinations = utils.getAllCombinations(placeholders, projectConfig);
    for (const combination of allCombinations) {
        const prompt = utils.applyPlaceholders(basePrompt, combination);
        if (limit && count >= limit) {
            console.log(`Limit of ${limit} images reached.`);
            return;
        }
        try {
            const base64Image = await apiManager.generateImage(`${config.apiService.baseURL}/${config.apiService.baseGenURLPath}/txt2img`, {
                ...differingConfig,
                ...combination.config,
                prompt: prompt
            }, preview);
            if (base64Image) {
                const filename = `${prompt.replace(/{|}/g, '')}_${Object.values(combination.config).join('_')}.png`;
                const filepath = path.resolve(__dirname, config.localSettings.outputDir, filename);
                await utils.downloadImage(base64Image, filepath);
                console.log(`Image saved as: ${filepath}`);
            }
        } catch (error) {
            console.error(`Failed to generate image for prompt: ${prompt}`);
        }
        count++;
    }
}

module.exports = {
    generateImages
};