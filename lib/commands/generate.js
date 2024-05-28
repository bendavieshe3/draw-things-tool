const path = require('path');
const apiManager = require('../apiManager');
const utils = require('../utils');
const config = require('../../config'); // Adjusted path
const placeholders = require('../../placeholders'); // Adjusted path

async function generateImages(activeConfig) {
    console.log(`Using base URL ${activeConfig.api.baseURL}`);

    // Use the overridePrompt if provided, otherwise use the projectConfig basePrompt
    const basePrompt = activeConfig.generation.prompt;

    // Check that all placeholders in the prompt are defined
    const placeholdersInPrompt = utils.checkPlaceholdersDefined(basePrompt, placeholders);

    let count = 0;
    const allCombinations = utils.getAllCombinations(placeholders, activeConfig.generation);
    for (const combination of allCombinations) {
        const prompt = utils.applyPlaceholders(basePrompt, combination);
        if (activeConfig.generation.limit && count >= activeConfig.generation.limit) {
            console.log(`Limit of ${activeConfig.generation.limit} images reached.`);
            return;
        }
        try {
            const base64Image = await apiManager.generateImage(`${activeConfig.api.baseURL}/${config.apiService.baseGenURLPath}/txt2img`, {
                ...combination.config,
                prompt: prompt
            }, activeConfig.generation.preview);
            if (base64Image) {
                const filename = `${prompt.replace(/{|}/g, '')}_${Object.values(combination.config).join('_')}.png`;
                const filepath = path.resolve(__dirname, activeConfig.local.outputDir, filename);
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