const { Command } = require('commander');
const program = new Command();
const generate = require('./lib/commands/generate');
const configCommand = require('./lib/commands/config');

program
  .name('DrawThingsTools')
  .description('CLI tool for generating images with Draw Things')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate images based on the provided configuration')
  .option('-l, --limit <number>', 'Limit the number of images generated', parseInt)
  .option('-p, --preview', 'Preview the parameters without generating images')
  .option('-j, --project <path>', 'Path to the project configuration file')
  .option('-r, --prompt <string>', 'Override base prompt')
  .action((options) => {
    generate.generateImages(options.limit, options.preview, options.project, options.prompt)
      .then(() => console.log("All image generations are completed."))
      .catch(error => console.error("Error in generating images:", error));
  });

program
  .command('config')
  .description('Display the current active configuration')
  .option('-j, --project <path>', 'Path to the project configuration file')
  .option('-r, --prompt <string>', 'Override base prompt')
  .action((options) => {
    configCommand.displayConfig(options)
      .catch(error => console.error("Error displaying configuration:", error));
  });

program.parse(process.argv);