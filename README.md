# DrawThingsTools

*DrawThingsTools* is a command-line interface (CLI) tool for generating images using the Draw Things API. It allows users to configure and generate images based on various prompts and configurations.

[Draw Things](https://drawthings.ai) is an amazing, easy and free AI art generation tool allowing lay people like myself to explore art generation, previously excluded by our lack of talent :). 

The **use case** the tool seeks to satisfy is the exploration and mining of prompt and configuration combinations to:
- *Create knowledge* around the effects of prompt design and generation settings
- *Enable experimentation* at enhanced scale to find individual unique and valuable art outcomes. 

A special thanks goes to the [Draw Things](https://drawthings.ai) team. If you have a Mac or IOS device, try it out, and [join the welcoming community](https://discord.gg/5gcBeGU58f) on Discord. 

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [Commands](#commands)
  - [Options](#options)
- [Configuration](#configuration)
  - [config.js](#configjs)
  - [Project Configuration](#project-configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

### Prerequisites

- Node.js (Developed on v22.2.0+)
- npm (Developed on v10.7.0+)

### Steps

1. Clone the repository:

 ```sh
git clone https://github.com/username/DrawThingsTools.git
cd DrawThingsTools
 ```

2. Install dependencies:

 ```sh
npm install
 ```

## Usage

### Commands

#### `generate`

Generate images based on the provided configuration.

```sh
node DrawThingsTool.js generate [options]
```

### Options

- `-l, --limit <number>`: Limit the number of images generated.
- `-p, --preview`: Preview the parameters without generating images.
- `-j, --project <path>`: Path to the project configuration file.
- `-r, --prompt <string>`: Override base prompt.

### Examples

Generate images with a limit of 5, in preview mode, using a specific project configuration, and an overridden prompt:

```sh
node DrawThingsTool.js generate -l 5 -p -j path/to/project.json -r “A {height} person”
```

## Configuration

### `config.js`

The main configuration file. This file contains default settings and configurations used by the tool.

#### Example `config.js`

```sh
module.exports = {
  apiService: {
    baseURL: ‘http://localhost:7860’,  // Base URL for the API
    baseGenURLPath: ‘/sdapi/v1’,      // Base path for the generation endpoint
    },
  localSettings: {
    outputDir: ‘generated_images’,    // Directory to save generated images
    },
  defaultProject: {
    // Default project-specific configurations
    steps: [10, 20, 30],
    guidance_scale: [7.5, 10],
    // Add more default configurations as needed
    }
};
```

### Project Configuration

Project configuration files can override the settings in `config.js`. They are JSON files that specify configurations for a particular project.

#### Example Project Configuration

```sh
{
  “basePrompt”: “A {height} person with {emotion}”,
  “height”: [“short”, “tall”, “average”],
  “emotion”: [“happy”, “sad”, “angry”],
  “steps”: [5, 15],
  “guidance_scale”: [7, 10]
}
```

## Development

### Directory Structure

```
Project Root Folder
- DrawThingsTool.js
- config.js
- (other unmentioned files)
- lib
-– apiManager.js
-– utils.js
-– configManager.js
-– commands
—-- generate.js
```

### Running Tests

I use [ESLint](https://eslint.org) to find issues in my javascript.

To install:

```sh
npm install eslint --save-dev
npx eslint --init
```

To run: 

```sh
npx eslint .
```


TODO: Describe how to run tests if any.

### Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

### License

This project is licensed under the TODO: specify license. See the [LICENSE](LICENSE) file for details.

## TODO

### Documentation
- [x] Specify Node.js and npm versions in the prerequisites.
- [ ] Add more detailed usage examples.
- [ ] Describe how to run tests (once added).
- [ ] Specify the license in the License section.
- [ ] Add any other missing information.  
- [ ] Complete Acknowledgements - focus on inspirational scripts
- [ ] Writing contributing document (depends on various other implementations)

### Code - Functional
- [x] Remove file saved noisy output from generation
- [ ] Remove prompt from static config at top of generation
- [ ] Add format and support for sampling {|placeholder_2}
- [x] Add format and support for adhoc placeholder {value1+value2+}
- [x] Add format and support for adhoc placeholder sampling {value1|value2}
- [ ] Make output relative to project folder. Ensure overridden output folder works
- [x] Make better filenames
- [x] Make betterer filenames
- [x] Make Hires setting work (cause generations and appear in filename)
- [x] Add relevant values to generations output
- [ ] Support multi-prompting
- [x] Add more placeholders
- [ ] Add Generation Summary
- [ ] Add Option to delete images in project, or after generation
- [ ] Add Option to remove or read EXIF information
- [ ] Tune generation output to include relevant output and possibly not the whole prompt
- [ ] Add debug mode and transition some outputs of verbose to use that
- [ ] Switch outputs away from console.log for more control
- [ ] Shuffle Clause Feature
- [ ] Review placeholders, remove unused features from Wiz
- [ ] Review placeholders, test more values for general model compliance
- [ ] Review placeholders: what is a general approach to accumulating?

### Code - Tech Debt
- [x] Push to github 
- [x] Why does config command not show Base Prompt?
- [x] Add verbose mode that enables better understanding of the code
- [x] Rename, reorganise static_configuration and dynamic_configuration
- [ ] Remove unused preview case statement  
- [ ] Implement unit tests
- [ ] Decided on consistent commenting approach
- [x] Check method signatures for simplification
- [ ] Ask chatgpt for refactor  

## Credits and Acknowledgements

TODO