// constants.js
const VALID_PARAMETERS = ['prompt', 'negative_prompt', 'steps', 'guidance_scale', 'seed', 'width', 'height', 'batch_size', 'n_iter', 'sampler_index', 'model', 'hires_fix'];

// Define the maximum number of generations allowed
const MAX_GENERATIONS = 1000;

module.exports = {
    VALID_PARAMETERS,
    MAX_GENERATIONS
};