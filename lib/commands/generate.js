const path = require('path');
const apiManager = require('../apiManager');
const utils = require('../utils');
const config = require('../../config'); // Adjusted path
const placeholders = require('../../placeholders'); // Adjusted path

async function generateImages(activeConfig) {
    console.log(`Using base URL ${activeConfig.api.baseURL}`);

    // Use the overridePrompt if provided, otherwise use the projectConfig basePrompt
    const basePrompt = activeConfig.generation.prompt;
    const allCombinations = utils.getAllCombinations(placeholders, activeConfig.generation);
    const totalGenerations = allCombinations.length;

    console.log(`${totalGenerations} images to be generated - "${basePrompt}"`);

    // Check that all placeholders in the prompt are defined
    const placeholdersInPrompt = utils.checkPlaceholdersDefined(basePrompt, placeholders);

    let count = 0;
    for (const combination of allCombinations) {
        if (activeConfig.launch.limit && count >= activeConfig.launch.limit) {
            break;
        }

        const prompt = utils.applyPlaceholders(basePrompt, combination);
        count++;

        const combinationDetails = Object.entries(combination.placeholders)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') + ', ' +
            Object.entries(combination.config)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');

        const previewSuffix = activeConfig.launch.preview ? ' (skipped)' : '';

        console.log(`(${count}/${totalGenerations}) ${combinationDetails}${previewSuffix}`);

        if (activeConfig.launch.preview) {
            continue;
        }

        try {
            const base64Image = await apiManager.generateImage(`${activeConfig.api.baseURL}/${config.apiService.baseGenURLPath}/txt2img`, {
                ...combination.config,
                prompt: prompt
            }, activeConfig.launch.preview);
            if (base64Image) {
                const filename = `${prompt.replace(/{|}/g, '')}_${Object.values(combination.config).join('_')}.png`;
                const filepath = path.resolve(__dirname, activeConfig.local.outputDir, filename);
                await utils.downloadImage(base64Image, filepath);
            }
        } catch (error) {
            console.error(`Failed to generate image for prompt: ${prompt}`);
        }
    }
}

module.exports = {
    generateImages
};