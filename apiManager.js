const axios = require('axios');

async function fetchConfiguration(baseURL) {
    try {
        const response = await axios.get(baseURL);
        return response.data;
    } catch (error) {
        console.error('Error fetching configuration from the server:', error.message);
        throw error;
    }
}

async function generateImage(url, config, preview) {
    if (preview) {
        console.log('Preview mode: The following parameters would be used:');
        console.log('URL:', url);
        console.log('Parameters:', JSON.stringify(config, null, 2));
        return;
    }

    try {
        const response = await axios.post(url, config);

        if (response.data && response.data.images && response.data.images.length > 0) {
            return response.data.images[0];
        } else {
            console.error('No images found in the response.');
        }
    } catch (error) {
        console.error(`Error generating image with config: ${JSON.stringify(config)}`);
        console.error('URL:', url);
        console.error('Parameters:', JSON.stringify(config, null, 2));
        if (error.response) {
            console.error(`HTTP ${error.response.status}: ${error.response.data}`);
        } else {
            console.error(error.message);
        }
        throw error;
    }
}

module.exports = {
    fetchConfiguration,
    generateImage
};