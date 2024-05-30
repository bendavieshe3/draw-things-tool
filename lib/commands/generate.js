// generate.js
const path = require('path');
const apiManager = require('../apiManager');
const utils = require('../utils');
const configCommand = require('./config'); // Import configCommand to display configuration
const { MAX_GENERATIONS } = require('../constants'); // Import the maximum generations constant

/**
 * Function to generate all possible combinations for placeholders and parameters
 * @param {Object} activeConfig - The active configuration for image generation
 * @returns {Object} - Object containing list of generations and metadata
 */
function getGenerations(activeConfig) {
    if (activeConfig.launch.verbose) {
        console.log("Starting getGenerations...");
    }

    // Step 1: Required Initialization
    const generations = { list: [], metadata: {} };
    const basePrompt = activeConfig.generation.prompt;
    const generations_id = `${activeConfig.project.projectName}_${utils.getCurrentDateTimeString()}`;
    generations.metadata.generations_id = generations_id;

    // Step 2: Analyze the Configuration to create metadata
    const dynamic_config = {};
    const static_params = {};
    const placeholder_usage = [];
    const rejected_placeholders = [];

    for (const [key, value] of Object.entries(activeConfig.generation)) {
        if (Array.isArray(value)) {
            dynamic_config[key] = value;
        } else if (key !== "prompt") {
            static_params[key] = value;
        }
    }

    // Placeholder Analysis
    const placeholderRegex = /{([^}]+)}/g;
    let match;
    let placeholderInstanceIdx = 0;

    while ((match = placeholderRegex.exec(basePrompt)) !== null) {
        const placeholder = match[0];
        const placeholderContent = match[1];

        let placeholderInstance = {
            placeholder,
            placeholder_instance_idx: placeholderInstanceIdx++,
            placeholder_type: null,
            available_placeholder_values: [],
            is_combinatorial: false,
            is_random: false,
            is_consumable: false
        };

        if (placeholderContent.includes('+')) {
            placeholderInstance.placeholder_type = "adhoc_combinatorial";
            placeholderInstance.available_placeholder_values = placeholderContent.split('+');
            placeholderInstance.is_combinatorial = true;
            placeholderInstance.is_random = false;
            placeholderInstance.is_consumable = true;
        } else if (placeholderContent.includes('|')) {
            placeholderInstance.placeholder_type = "adhoc_replacement";
            placeholderInstance.available_placeholder_values = placeholderContent.split('|');
            placeholderInstance.is_combinatorial = false;
            placeholderInstance.is_random = true;
            placeholderInstance.is_consumable = false;
        } else if (/:/.test(placeholderContent)) {
            const [definedPlaceholder, count] = placeholderContent.split(':');
            if (activeConfig.placeholders[definedPlaceholder]) {
                placeholderInstance.placeholder_type = "limited";
                placeholderInstance.available_placeholder_values = utils.getRandomNonRepeatingValues(activeConfig.placeholders[definedPlaceholder], parseInt(count));
                placeholderInstance.is_combinatorial = true;
                placeholderInstance.is_random = true;
                placeholderInstance.is_consumable = true;
            } else {
                rejected_placeholders.push(placeholder);
            }
        } else if (activeConfig.placeholders[placeholderContent]) {
            placeholderInstance.placeholder_type = "basic";
            placeholderInstance.available_placeholder_values = [...activeConfig.placeholders[placeholderContent]];
            placeholderInstance.is_combinatorial = true;
            placeholderInstance.is_random = false;
            placeholderInstance.is_consumable = true;
        } else {
            rejected_placeholders.push(placeholder);
        }

        if (placeholderInstance.placeholder_type) {
            placeholder_usage.push(placeholderInstance);
        }
    }

    generations.metadata.dynamic_config = dynamic_config;
    generations.metadata.static_params = static_params;
    generations.metadata.placeholder_usage = placeholder_usage;
    generations.metadata.rejected_placeholders = rejected_placeholders;

    if (activeConfig.launch.verbose) {
        console.log(utils.prettyPrint(generations.metadata));
    }

    // Step 3: Build Generations

    // Create prompt combinations
    let prompt_combinations = [basePrompt];

    if (placeholder_usage.length > 0) {
        prompt_combinations = utils.buildCombinatorialPrompts(basePrompt, placeholder_usage);

        // Handle adhoc_replacement placeholders separately
        prompt_combinations = prompt_combinations.map(prompt => {
            placeholder_usage.forEach(placeholderInstance => {
                if (placeholderInstance.placeholder_type === "adhoc_replacement") {
                    const randomValue = placeholderInstance.available_placeholder_values[Math.floor(Math.random() * placeholderInstance.available_placeholder_values.length)];
                    prompt = prompt.replace(placeholderInstance.placeholder, randomValue);
                }
            });
            return prompt;
        });
    }

    // Create param combinations
    let param_combinations = utils.buildParamCombinations(dynamic_config);

    // Add static_params to param_combinations
    param_combinations = param_combinations.map(params => ({ ...params, ...static_params }));

    // Generate the list of generation instances
    let generation_number = 1
    prompt_combinations.forEach(prompt => {
        param_combinations.forEach(params => {
            generations.list.push({
                prompt,
                params,
                metadata: { generation_id: `${generations_id}_${generation_number++}` }
            });
        });
    });

    if (generations.list.length > MAX_GENERATIONS) {
        console.warn(`Maximum generations exceeded, limiting to ${MAX_GENERATIONS}.`);
        generations.list.length = MAX_GENERATIONS;
    }

    if (activeConfig.launch.verbose) {
        console.log("Finished getGenerations.");
    }

    return generations;
}

/**
 * Function to generate images based on active configuration
 * @param {Object} activeConfig - The active configuration for image generation
 */
async function generateImages(activeConfig) {
    if (activeConfig.launch.verbose) {
        console.log(`Using base URL ${activeConfig.api.baseURL}`);
    }

    const generations = getGenerations(activeConfig);
    const totalGenerations = generations.list.length;

    console.log(`${totalGenerations} images to be generated - "${activeConfig.generation.prompt}"`);

    //Get Dynamic Config. This is the set of non-prompt parameters that will 
    //change between generations. (Config == as per configuration, not resolved)
    const dynamicConfig = generations.metadata.dynamic_config;
    const dynamicConfigDescription = Object.entries(dynamicConfig)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
    console.log(`Dynamic Parameters: ${dynamicConfigDescription}`);

    //Get Dynamic Config. This is the set of non-prompt parameters that will 
    //NOT change between generations. (Params == fully resolved values)
    const staticParams = generations.metadata.static_params; 
    const staticParamsDescription = Object.entries(staticParams)
        .map(([key, value]) => `${key}=${value}`)
        .join(' ');
    console.log(`Static Parameters: ${staticParamsDescription}`);

    if (activeConfig.launch.verbose) {
        utils.prettyPrint(generations.metadata, 'Generations Metadata');
    }

    const imageGenerationUrl = `${activeConfig.api.baseURL}/${activeConfig.api.baseGenURLPath}/txt2img`;

    let count = 0;
    for (const generation of generations.list) {
        if (activeConfig.launch.limit && count >= activeConfig.launch.limit) {
            break;
        }

        //if verbose, output generation details
        if (activeConfig.launch.verbose) {
            console.log('');
            console.log(utils.prettyPrint(generation, 'Pending Generation'));
        }

        count++; // Increment count before the preview/continue check

        const prompt = generation.prompt;
        const params = generation.params;
        const filename = utils.imageFilename(prompt, params);

        const previewSuffix = activeConfig.launch.preview ? ' (skipped)' : '';

        console.log(`(${count}/${totalGenerations}) ${prompt}  ${previewSuffix}`);

        if (activeConfig.launch.preview) {
            continue;
        }

        try {
            const base64Image = await apiManager.generateImage(imageGenerationUrl, {
                ...params,
                prompt: prompt
            });

            if (base64Image) {
                const filepath = path.resolve(process.cwd(), activeConfig.local.outputDir, filename);

                try {
                    await utils.downloadImage(base64Image, filepath);
                    generation.metadata.filepath = filepath;
                    generation.metadata.filename = filename;
                    if (activeConfig.launch.verbose) {
                        console.log(`Image saved as: ${filepath}`);
                    }
                } catch (saveError) {
                    console.error(`Failed to save image to ${filepath}: ${saveError.message}`);
                }
            } else {
                console.error(`No image data returned for prompt: ${prompt}`);
            }
        } catch (error) {
            if (error.response) {
                // Server responded with a status other than 200 range
                console.error(`HTTP ${error.response.status}: ${error.response.data}`);
            } else if (error.request) {
                // Request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error:', error.message);
            }
        }

        if (activeConfig.launch.verbose) {
            console.log('');
            console.log(utils.prettyPrint(generation, 'Post Generation'));
        }
    }
}

module.exports = {
    generateImages
};