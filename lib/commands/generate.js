const path = require('path');
const apiManager = require('../apiManager');
const utils = require('../utils');
const config = require('../../config'); // Adjusted path
const placeholders = require('../../placeholders'); // Adjusted path

function getGenerations(activeConfig) {
    const basePrompt = activeConfig.generation.prompt;
    const placeholdersInPrompt = utils.extractPlaceholders(basePrompt);

    const relevantPlaceholders = Object.fromEntries(
        Object.entries(placeholders).filter(([key]) => placeholdersInPrompt.includes(key))
    );

    const allCombinations = utils.getAllCombinations(relevantPlaceholders, activeConfig.generation);

    const relevantConfigKeys = Object.keys(relevantPlaceholders).concat(
        Object.keys(activeConfig.generation).filter(key => Array.isArray(activeConfig.generation[key]))
    );

    const generationsList = allCombinations.map(combination => {
        const prompt = utils.applyPlaceholders(basePrompt, combination);
        return {
            image_config: {
                ...combination.config,
                prompt: prompt
            },
            placeholders: combination.placeholders
        };
    });

    return {
        list: generationsList,
        metadata: {
            relevant_config: relevantConfigKeys
        }
    };
}

async function generateImages(activeConfig) {
    console.log(`Using base URL ${activeConfig.api.baseURL}`);

    const generations = getGenerations(activeConfig);
    const totalGenerations = generations.list.length;

    console.log(`${totalGenerations} images to be generated - "${activeConfig.generation.prompt}"`);

    let count = 0;
    for (const generation of generations.list) {
        if (activeConfig.launch.limit && count >= activeConfig.launch.limit) {
            break;
        }

        count++; // Increment count before the preview/continue check

        const { prompt, ...imageConfig } = generation.image_config;
        const combinationDetails = generations.metadata.relevant_config
            .map(key => `${key}: ${generation.placeholders[key] || imageConfig[key]}`)
            .join(', ');

        const previewSuffix = activeConfig.launch.preview ? ' (skipped)' : '';

        console.log(`(${count}/${totalGenerations}) ${combinationDetails}${previewSuffix}`);

        if (activeConfig.launch.preview) {
            continue;
        }

        try {
            const base64Image = await apiManager.generateImage(`${activeConfig.api.baseURL}/${config.apiService.baseGenURLPath}/txt2img`, {
                ...imageConfig,
                prompt: prompt
            });
            if (base64Image) {
                const filename = `${prompt.replace(/{|}/g, '')}_${Object.values(imageConfig).join('_')}.png`;
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