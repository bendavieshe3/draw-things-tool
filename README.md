# DrawThingsTools

DrawThingsTools is a command-line interface (CLI) tool for generating images using the Draw Things API. It allows users to configure and generate images based on various prompts and configurations.

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

- Node.js (version TODO: specify version)
- npm (version TODO: specify version)

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

TODO: Describe how to run tests if any.

### Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on contributing to this project.

### License

This project is licensed under the TODO: specify license. See the [LICENSE](LICENSE) file for details.

## TODO

- [ ] Specify Node.js and npm versions in the prerequisites.
- [ ] Add more detailed usage examples.
- [ ] Describe how to run tests if any.
- [ ] Specify the license in the License section.
- [ ] Add any other missing information.  