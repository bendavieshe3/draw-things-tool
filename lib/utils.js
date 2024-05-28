function extractPlaceholders(prompt) {
    const regex = /{([^}]+)}/g;
    const placeholders = [];
    let match;
    while ((match = regex.exec(prompt)) !== null) {
        placeholders.push(match[1]);
    }
    return placeholders;
}

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

    return [...combinations({}, 0)].map(combination => ({
        placeholders: Object.fromEntries(Object.entries(combination).filter(([key]) => placeholderKeys.includes(key))),
        config: Object.fromEntries(Object.entries(combination).filter(([key]) => configKeys.includes(key)))
    }));
}

function applyPlaceholders(prompt, combination) {
    return prompt.replace(/{([^}]+)}/g, (_, key) => combination.placeholders[key] || `{${key}}`);
}

async function downloadImage(base64Image, filepath) {
    const base64Data = base64Image.replace(/^data:image\/png;base64,/, "");
    await fs.promises.writeFile(filepath, base64Data, 'base64');
}

module.exports = {
    extractPlaceholders,
    getAllCombinations,
    applyPlaceholders,
    downloadImage
};