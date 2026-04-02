'use strict';

const chalk = require('chalk');
const { findAgent, searchAgents } = require('../registry');

module.exports = function info(name, options = {}) {
  let agent = findAgent(name);

  if (!agent) {
    const matches = searchAgents(name);
    if (matches.length === 1) {
      agent = matches[0];
    } else if (matches.length > 1) {
      console.log(chalk.yellow(`Multiple matches for "${name}":`));
      matches.slice(0, 5).forEach(a => {
        console.log(`  ${chalk.cyan(a.name)}`);
      });
      return;
    } else {
      console.log(chalk.red(`Agent "${name}" not found.`));
      return;
    }
  }

  if (options.json) {
    console.log(JSON.stringify(agent, null, 2));
    return;
  }

  console.log('');
  console.log(chalk.bold.cyan(`  ${agent.name}`));
  console.log(chalk.gray('  ' + '─'.repeat(50)));
  console.log(`  ${chalk.bold('Description:')}  ${agent.description}`);
  console.log(`  ${chalk.bold('Source:')}       ${agent.source}`);
  console.log(`  ${chalk.bold('Tags:')}         ${agent.tags.join(', ')}`);
  console.log(`  ${chalk.bold('Compatible:')}   ${agent.compatible.join(', ')}`);
  console.log(`  ${chalk.bold('Repo:')}         ${chalk.underline(agent.repo_url)}`);
  if (agent.raw_url) {
    console.log(`  ${chalk.bold('Raw URL:')}      ${chalk.underline(agent.raw_url)}`);
  }
  console.log('');
  console.log(chalk.gray(`  Install: load-agents install ${agent.name}`));
  console.log(chalk.gray(`  Install for Copilot: load-agents install ${agent.name} --tool copilot`));
  console.log('');
};
