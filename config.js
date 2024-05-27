module.exports = {
    apiService: {
        baseURL: 'http://localhost:7860', // Replace with the actual URL of your Draw Things API
        baseGenURLPath: 'sdapi/v1'
    },
    localSettings: {
        outputDir: 'generated_images'
    },
    defaultProject: {
        basePrompt: "A portrait of a {height} person showing {emotion}",
        steps: 21,
        guidance_scale: 3,
    }
};