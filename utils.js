const fs = require('fs');
const path = require('path');

function downloadImage(base64Image, filepath) {
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    return fs.promises.writeFile(filepath, base64Data, 'base64');
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

module.exports = {
    downloadImage,
    getAllCombinations,
    applyPlaceholders,
    checkPlaceholdersDefined
};