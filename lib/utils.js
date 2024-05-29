// utils.js
const fs = require('fs');

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

const MAX_RECURSION_DEPTH = 3;

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

module.exports = {
    extractPlaceholders,
    getAllCombinations,
    applyPlaceholders,
    downloadImage,
    formatValue,
    prettyPrint,
};