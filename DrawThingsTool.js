// DrawThingsTool.js

const { Command } = require('commander');
const program = new Command();
const path = require('path');
const generate = require('./lib/commands/generate');
const configCommand = require('./lib/commands/config');
const configManager = require('./lib/configManager');
const utils = require('./lib/utils'); // Import the new utility functions
const pkg = require('./package.json');

program
  .name('DrawThingsTools')
  .description('CLI tool for generating images with Draw Things')
  .version(pkg.version);

program
  .option('-v, --verbose', 'Enable verbose mode');

const showVersionIfVerbose = () => {
  if (program.opts().verbose) {
    console.log(`${program.name()} version ${program.version()}`);
  }
};

const printCommandInfo = (name, description) => {
  console.log(`${name}: ${description}`);
};

program
  .command('generate')
  .description('Generate images based on the provided configuration')
  .option('-l, --limit <number>', 'Limit the number of images generated', parseInt)
  .option('-p, --preview', 'Preview the parameters without generating images')
  .option('-j, --project <path>', 'Path to the project configuration file')
  .option('-r, --prompt <string>', 'Override base prompt')
  .action(async (options) => {
    printCommandInfo('Generate', 'generate images based on configuration');
    const activeConfig = await configManager.getActiveConfiguration({ ...options, verbose: program.opts().verbose });
    generate.generateImages(activeConfig)
      .then(() => console.log("All image generations are completed."))
      .catch(error => console.error("Error in generating images:", error));
  });

program
  .command('config')
  .description('Display the current active configuration')
  .option('-j, --project <path>', 'Path to the project configuration file')
  .option('-r, --prompt <string>', 'Override base prompt')
  .action(async (options) => {
    printCommandInfo('Config', 'display the current active configuration');
    const activeConfig = await configManager.getActiveConfiguration({ ...options, verbose: program.opts().verbose });
      configCommand.displayConfig(activeConfig, ['placeholders']);
  });

program.parse(process.argv);

showVersionIfVerbose();