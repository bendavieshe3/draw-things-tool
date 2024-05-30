module.exports = {
    apiService: {
        baseURL: 'http://localhost:7860', // Replace with the actual URL of your Draw Things API
        baseGenURLPath: 'sdapi/v1'
    },
    localSettings: {
        outputDir: 'generated_images'
    },
    defaultProject: {
        projectName: "Default",
        basePrompt: "A {ethnicity} person sad the default prompt has not been changed",
    }
};