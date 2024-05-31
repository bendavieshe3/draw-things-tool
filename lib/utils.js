// utils.js
const fs = require('fs');

const MAX_RECURSION_DEPTH = 4; // Define MAX_RECURSION_DEPTH

/**
 * Extract placeholders from a given prompt
 * @param {string} prompt - The prompt containing placeholders
 * @returns {Array} - List of placeholders found in the prompt
 */
function extractPlaceholders(prompt) {
    const regex = /{([^}]+)}/g;
    const placeholders = [];
    let match;
    while ((match = regex.exec(prompt)) !== null) {
        placeholders.push(match[1]);
    }
    return placeholders;
}

/**
 * Get all possible combinations of placeholders and configuration values
 * @param {Object} placeholders - Object containing placeholder arrays
 * @param {Object} config - Configuration object with possible values
 * @returns {Array} - List of all combinations
 */
function getAllCombinations(placeholders, config) {
    const placeholderKeys = Object.keys(placeholders);
    const placeholderValues = Object.values(placeholders).map(v => (Array.isArray(v) ? v : [v]));

    const configKeys = Object.keys(config).filter(key => Array.isArray(config[key]));
    const configValues = configKeys.map(key => config[key]);

    const allKeys = placeholderKeys.concat(configKeys);
    const allValues = placeholderValues.concat(configValues);

    function* combinations(current, index) {
        if (index === allKeys.length) {
            yield current;
            return;
        }
        for (const value of allValues[index]) {
            yield* combinations({ ...current, [allKeys[index]]: value }, index + 1);
        }
    }

    return [...combinations({}, 0)].map(combination => {
        const placeholdersSubset = Object.fromEntries(
            Object.entries(combination).filter(([key]) => placeholderKeys.includes(key))
        );
        const configSubset = Object.fromEntries(
            Object.entries(combination).filter(([key]) => configKeys.includes(key))
        );

        // Include unchanging config values
        const staticConfig = Object.fromEntries(
            Object.entries(config).filter(([key]) => !configKeys.includes(key))
        );

        return {
            placeholders: placeholdersSubset,
            config: { ...staticConfig, ...configSubset }
        };
    });
}

/**
 * Apply placeholders to a prompt string
 * @param {string} prompt - The prompt containing placeholders
 * @param {Object} combination - Combination object with placeholder values
 * @returns {string} - The prompt with placeholders applied
 */
function applyPlaceholders(prompt, combination) {
    return prompt.replace(/{([^}]+)}/g, (_, key) => combination.placeholders[key] || `{${key}}`);
}

/**
 * Download an image from a base64 string and save it to a file
 * @param {string} base64Image - Base64 encoded image string
 * @param {string} filepath - Path to save the image file
 */
async function downloadImage(base64Image, filepath) {
    try {
        const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
        await fs.promises.writeFile(filepath, base64Data, 'base64');
    } catch (error) {
        throw new Error(`Failed to save image to ${filepath}: ${error.message}`);
    }
}

/**
 * Get a list of random non-repeating values from an array
 * @param {Array} arr - The array to pick values from
 * @param {number} count - The number of values to pick
 * @returns {Array} - List of picked values
 */
function getRandomNonRepeatingValues(arr, count) {
    const shuffled = arr.slice();
    let i = arr.length;
    while (i--) {
        const rand = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[rand]] = [shuffled[rand], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

/**
 * Build all possible prompt combinations based on placeholders
 * @param {string} basePrompt - The base prompt containing placeholders
 * @param {Array} placeholderUsage - List of placeholder usage instances
 * @returns {Array} - List of all prompt combinations
 */
function buildCombinatorialPrompts(basePrompt, placeholderUsage) {
    const combinatorialPlaceholders = placeholderUsage.filter(p => p.is_combinatorial);

    function* generateCombinations(currentPrompt, placeholderIdx) {
        if (placeholderIdx === combinatorialPlaceholders.length) {
            yield currentPrompt;
            return;
        }
        const placeholderInstance = combinatorialPlaceholders[placeholderIdx];
        for (const value of placeholderInstance.available_placeholder_values) {
            const newPrompt = currentPrompt.replace(placeholderInstance.placeholder, value);
            yield* generateCombinations(newPrompt, placeholderIdx + 1);
        }
    }

    return [...generateCombinations(basePrompt, 0)];
}

/**
 * Build all parameter combinations based on dynamic configuration
 * @param {Object} dynamicConfig - The dynamic configuration object
 * @returns {Array} - List of all parameter combinations
 */
function buildParamCombinations(dynamicConfig) {
    const keys = Object.keys(dynamicConfig);
    const values = Object.values(dynamicConfig);

    function* combinations(current, index) {
        if (index === keys.length) {
            yield current;
            return;
        }
        for (const value of values[index]) {
            yield* combinations({ ...current, [keys[index]]: value }, index + 1);
        }
    }

    return [...combinations({}, 0)];
}

/**
 * Format a value for pretty printing, with a maximum recursion depth
 * @param {any} value - The value to format
 * @param {number} depth - Current recursion depth
 * @returns {string} - Formatted value string
 */
function formatValue(value, depth = 0) {
    const indent = '    '.repeat(depth);
    const nextIndent = '    '.repeat(depth + 1);

    if (depth > MAX_RECURSION_DEPTH) {
        return `${nextIndent}...`;
    }

    if (Array.isArray(value)) {
        if (value.every(item => typeof item === 'string' || typeof item === 'number')) {
            return `[ ${value.join(', ')} ]`;
        } else {
            return value.map(item => formatValue(item, depth + 1)).join('\n');
        }
    } else if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
            .map(([key, val]) => `${nextIndent}${key}: ${formatValue(val, depth + 1)}`)
            .join('\n');
    } else {
        return value;
    }
}

/**
 * Pretty print an object with a title
 * @param {Object} data - The object to print
 * @param {string} title - The title to print before the object
 * @returns {string} - Pretty printed string
 */
function prettyPrint(data, title = '') {
    const initialIndent = title ? `${title}:\n` : '';
    const content = Object.entries(data)
        .map(([key, value]) => `- ${key}:\n${formatValue(value, 1)}`)
        .join('\n');
    return initialIndent + content;
}

function imageFilename(prompt, params, session_id='default') {
    const paramString =  Object.entries(params)
        .map(([key, value]) => `${key}_${value}`)
        .join('_');
    const promptString = truncateMiddle(sanitizeFilename(capitalCase(prompt)), 20);
    return `${session_id}_${promptString}_${paramString}.png`
}

function capitalCase(str) {
    //ensure every first letter of a token is capitalised
    // Split the string by spaces, hyphens, and underscores
    return str.split(/([ _-])/).map(token => {
        // If the token is a separator, return it as is
        if (token === ' ' || token === '-' || token === '_') {
            return token;
        }
        // If the first character is a digit, keep the token unchanged
        if (!isNaN(token[0])) {
            return token;
        }
        // Capitalize the first letter and lower case the rest
        try {
            return token[0].toUpperCase() + token.slice(1).toLowerCase();
        } 
        catch(tokenError) {
            return token;            
        }
        
    }).join('');
}

/**
 * Function to remove specified keys from an object.
 * @param {object} obj - The original object.
 * @param {Array<string>} keysToRemove - The keys to be removed.
 * @returns {object} - A new object with the specified keys removed.
 */
function removeKeys(obj, keysToRemove) {
    const newObj = { ...obj };
    keysToRemove.forEach(key => {
        delete newObj[key];
    });
    return newObj;
}

function sanitizeFilename(str) {
    // Define a regex pattern for characters to retain: alphanumeric characters
    const allowedCharacters = /[^a-zA-Z0-9]/g;
    // Remove disallowed characters by replacing them with an empty string
    return str.replace(allowedCharacters, '');
}

/**
 * Get the current date and time formatted as YYYYMMDDHHmmSS
 * @returns {string} - The formatted date and time string
 */
function getCurrentDateTimeString() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Truncate a string in the middle to meet a specified length.
 * @param {string} str - The original string to be truncated.
 * @param {number} maxLength - The maximum length of the truncated string.
 * @returns {string} - The truncated string with the middle part replaced by ellipsis (...).
 */
function truncateMiddle(str, maxLength) {
    // If the string is already within the maxLength, return it as is.
    if (str.length <= maxLength) {
        return str;
    }

    // Determine the length of the beginning and ending parts to retain.
    const partLength = Math.floor((maxLength - 3) / 2);
    const beginning = str.slice(0, partLength);
    const ending = str.slice(-partLength);

    // Return the truncated string with ellipsis in the middle.
    return `${beginning}...${ending}`;
}

module.exports = {
    extractPlaceholders,
    getAllCombinations,
    applyPlaceholders,
    downloadImage,
    getRandomNonRepeatingValues,
    buildCombinatorialPrompts,
    buildParamCombinations,
    formatValue,
    prettyPrint,
    imageFilename,
    getCurrentDateTimeString,
    truncateMiddle,
    removeKeys
};