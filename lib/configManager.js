const path = require('path');
const config = require('../config');  // Adjusted path

const VALID_PARAMETERS = ['prompt', 'negative_prompt', 'steps', 'guidance_scale', 'seed', 'width', 'height', 'batch_size', 'n_iter', 'sampler_index', 'model'];

function loadProjectConfig(projectPath) {
    if (!projectPath) {
        return config.defaultProject;
    }
    const projectConfig = require(path.resolve(projectPath));
    return { ...config.defaultProject, ...projectConfig };
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

module.exports = {
    loadProjectConfig,
    getDifferingConfig,
    VALID_PARAMETERS
};