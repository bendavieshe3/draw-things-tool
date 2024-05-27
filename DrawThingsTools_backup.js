// DrawThingsTools_backup.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const config = require('./config');
const placeholders = require('./placeholders');

const VALID_PARAMETERS = ['prompt', 'negative_prompt', 'steps', 'guidance_scale', 'seed', 'width', 'height', 'batch_size', 'n_iter', 'sampler_index', 'model'];

// Ensure the output directory exists
fs.mkdirSync(config.localSettings.outputDir, { recursive: true });

async function fetchConfiguration() {
    const url = `${config.apiService.baseURL}`;
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching configuration from the server:', error.message);
        throw error;
    }
}

async function downloadImage(base64Image, filepath) {
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    return fs.promises.writeFile(filepath, base64Data, 'base64');
}

function getDifferingConfig(serverConfig, projectConfig) {
    const differingConfig = {};
    for (const key in projectConfig) {
        if (VALID_PARAMETERS.includes(key) && projectConfig[key] !== serverConfig[key]) {
            differingConfig[key] = projectConfig[key];
        }
    }
    return differingConfig;
}

function loadProjectConfig(projectPath) {
    if (!projectPath) {
        return config.defaultProject;
    }
    const projectConfig = require(path.resolve(projectPath));
    return { ...config.defaultProject, ...projectConfig };
}

function getAllCombinations(placeholders, config) {
    const placeholderKeys = Object.keys(placeholders);
    const configKeys = Object.keys(config).filter(key => Array.isArray(config[key]));
    const keys = placeholderKeys.concat(configKeys);
    const combinations = [];

    function generateCombination(currentCombination, index) {
        if (index === keys.length) {
            combinations.push({ placeholders: {}, config: {}, ...currentCombination });
            return;
        }
        const key = keys[index];
        const values = placeholders[key] || config[key];
        if (!Array.isArray(values)) {
            values = [values];
        }
        for (const value of values) {
            const newCombination = { ...currentCombination };
            if (placeholderKeys.includes(key)) {
                newCombination.placeholders = { ...newCombination.placeholders, [key]: value };
            } else {
                newCombination.config = { ...newCombination.config, [key]: value };
            }
            generateCombination(newCombination, index + 1);
        }
    }

    generateCombination({ placeholders: {}, config: {} }, 0);
    return combinations;
}

function applyPlaceholders(prompt, combination) {
    return prompt.replace(/{(.*?)}/g, (_, placeholder) => combination.placeholders[placeholder]);
}

function checkPlaceholdersDefined(prompt, placeholders) {
    const placeholdersInPrompt = prompt.match(/{(.*?)}/g);
    if (!placeholdersInPrompt) return [];  // No placeholders found
    const keys = placeholdersInPrompt.map(p => p.slice(1, -1));
    for (const key of keys) {
        if (!(key in placeholders)) {
            throw new Error(`Placeholder {${key}} is not defined in placeholders.js`);
        }
    }
    return keys;
}

async function generateImage(differingConfig, prompt, combination, preview) {
    const url = `${config.apiService.baseURL}/${config.apiService.baseGenURLPath}/txt2img`;

    console.log(`Generating image with prompt: ${prompt}, combination: ${JSON.stringify(combination)}`);
    console.log(`Using URL: ${url}`);

    // Create the generation configuration from differingConfig and valid parameters from combination
    const generationConfig = {
        ...differingConfig,
        ...combination.config,
        prompt: prompt
    };

    if (preview) {
        console.log('Preview mode: The following parameters would be used:');
        console.log('URL:', url);
        console.log('Parameters:', JSON.stringify(generationConfig, null, 2));
        return;
    }

    try {
        const response = await axios.post(url, generationConfig);

        if (response.data && response.data.images && response.data.images.length > 0) {
            const imageBase64 = response.data.images[0];
            const filename = `${prompt.replace(/{|}/g, '')}_${Object.values(combination.config).join('_')}.png`;
            const filepath = path.resolve(__dirname, config.localSettings.outputDir, filename);
            await downloadImage(imageBase64, filepath);
            console.log(`Image saved as: ${filepath}`);
        } else {
            console.error('No images found in the response.');
        }
    } catch (error) {
        console.error(`Error generating image with prompt: ${prompt}, combination: ${JSON.stringify(combination)}`);
        console.error('URL:', url);
        console.error('Parameters:', JSON.stringify(generationConfig, null, 2));
        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.data}`);
        } else {
            console.error(error.message);
        }
    }
}

async function generateImages(limit, preview, projectPath, overridePrompt) {
    console.log(`Using base URL ${config.apiService.baseURL}`);

    // Load project configuration
    const projectConfig = loadProjectConfig(projectPath);

    // Fetch and display the current configuration from the server
    let serverConfig;
    try {
        serverConfig = await fetchConfiguration();
        console.log('Current server configuration:', serverConfig);
    } catch (error) {
        console.error('Unable to fetch and display the server configuration.');
        return;
    }

    const differingConfig = getDifferingConfig(serverConfig, projectConfig);
    console.log('Differing configuration:', differingConfig);

    // Use the overridePrompt if provided, otherwise use the projectConfig basePrompt
    const basePrompt = overridePrompt || projectConfig.basePrompt;

    // Check that all placeholders in the prompt are defined
    const placeholdersInPrompt = checkPlaceholdersDefined(basePrompt, placeholders);

    let count = 0;
    const allCombinations = getAllCombinations(placeholders, projectConfig);
    for (const combination of allCombinations) {
        const prompt = applyPlaceholders(basePrompt, combination);
        if (limit && count >= limit) {
            console.log(`Limit of ${limit} images reached.`);
            return;
        }
        await generateImage(differingConfig, prompt, combination, preview);
        count++;
    }
}

// Parse command-line arguments
const argv = yargs
    .option('limit', {
        alias: 'l',
        type: 'number',
        description: 'Limit the number of images generated',
        default: null
    })
    .option('preview', {
        alias: 'p',
        type: 'boolean',
        description: 'Preview the parameters without generating images',
        default: false
    })
    .option('project', {
        alias: 'j',
        type: 'string',
        description: 'Path to the project configuration file',
        default: null
    })
    .option('prompt', {
        alias: 'r',
        type: 'string',
        description: 'Override base prompt',
        default: null
    })
    .argv;

// Run the image generation process
generateImages(argv.limit, argv.preview, argv.project, argv.prompt).then(() => console.log("All image generations are completed.")).catch(error => console.error("Error in generating images:", error));