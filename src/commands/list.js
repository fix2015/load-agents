'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { filterAgents } = require('../registry');

module.exports = function list(options = {}) {
  const agents = filterAgents({
    source: options.source,
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(agents, null, 2));
    return;
  }

  if (agents.length === 0) {
    console.log(chalk.yellow('No agents found matching your filters.'));
    return;
  }

  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.cyan('Description'),
      chalk.cyan('Source'),
      chalk.cyan('Tags'),
    ],
    colWidths: [25, 50, 20, 25],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const agent of agents) {
    table.push([
      chalk.bold(agent.name),
      agent.description.slice(0, 80),
      chalk.gray(agent.source),
      chalk.gray(agent.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Available Agents (${agents.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-agents install <name>`));
  console.log(chalk.gray(`Details: load-agents info <name>`));
};
