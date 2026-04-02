'use strict';

const chalk = require('chalk');
const ora = require('ora');
const { findAgent, searchAgents } = require('../registry');
const { installAgent } = require('../installer');

module.exports = async function install(name, options = {}) {
  const spinner = ora(`Searching for agent "${name}"...`).start();

  try {
    let agent = findAgent(name);

    if (!agent) {
      // Try fuzzy search
      const matches = searchAgents(name);
      if (matches.length === 0) {
        spinner.fail(chalk.red(`Agent "${name}" not found.`));
        console.log(chalk.yellow('\nTry:'));
        console.log(`  load-agents search ${name}`);
        console.log('  load-agents list');
        process.exit(1);
      }
      if (matches.length === 1) {
        agent = matches[0];
        spinner.info(chalk.yellow(`Exact match not found. Using: ${agent.name}`));
      } else {
        spinner.warn(chalk.yellow(`Multiple matches found for "${name}":`));
        console.log('');
        matches.slice(0, 10).forEach(a => {
          console.log(`  ${chalk.cyan(a.name.padEnd(30))} ${chalk.gray(a.description.slice(0, 60))}`);
        });
        if (matches.length > 10) {
          console.log(chalk.gray(`  ... and ${matches.length - 10} more`));
        }
        console.log(chalk.yellow(`\nSpecify the exact name: load-agents install <name>`));
        process.exit(1);
      }
    }

    const tool = options.tool || 'claude-code';
    spinner.text = `Installing ${chalk.cyan(agent.name)} for ${chalk.green(tool)}...`;
    spinner.start();

    const result = await installAgent(agent, options);

    spinner.succeed(
      chalk.green(`Installed ${chalk.bold(agent.name)} → ${chalk.underline(result.installPath)}`)
    );
    console.log(chalk.gray(`  Source: ${agent.source} | Size: ${(result.size / 1024).toFixed(1)}KB`));
    console.log(chalk.gray(`  Tags: ${agent.tags.join(', ')}`));
  } catch (err) {
    spinner.fail(chalk.red(`Installation failed: ${err.message}`));
    process.exit(1);
  }
};
