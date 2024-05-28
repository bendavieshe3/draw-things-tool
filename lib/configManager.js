const path = require('path');
const axios = require('axios');
const config = require('../config');  // Adjusted path
const { VALID_PARAMETERS } = require('./constants');

// Function to fetch configuration from the server
async function fetchServerConfig(baseURL) {
    try {
        const response = await axios.get(baseURL);
        return response.data;
    } catch (error) {
        console.error('Error fetching configuration from the server:', error.message);
        throw error;
    }
}

// Function to load project configuration
function loadProjectConfig(projectPath) {
    if (!projectPath) {
        return config.defaultProject;
    }
    const projectConfig = require(path.resolve(projectPath));
    return { ...config.defaultProject, ...projectConfig };
}

// Function to generate activeConfig
async function getActiveConfiguration(commandLineOptions) {
    const activeConfig = {
        api: { ...config.apiService },
        generation: {},
        local: { ...config.localSettings },
        launch: { ...commandLineOptions }
    };

    // Fetch server configuration
    const serverConfig = await fetchServerConfig(config.apiService.baseURL);

    // Load project configuration
    const projectConfig = commandLineOptions.project ? loadProjectConfig(commandLineOptions.project) : {};

    // Merge configurations with precedence
    const sources = [serverConfig, config.defaultProject, projectConfig, commandLineOptions];
    sources.forEach(source => {
        for (const [key, value] of Object.entries(source)) {
            if (VALID_PARAMETERS.includes(key)) {
                activeConfig.generation[key] = value;
            }
        }
    });

    return activeConfig;
}

module.exports = {
    getActiveConfiguration,
};