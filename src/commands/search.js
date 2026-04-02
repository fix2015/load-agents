'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { searchAgents } = require('../registry');

module.exports = function search(query, options = {}) {
  const results = searchAgents(query, {
    tag: options.tag,
    tool: options.tool,
  });

  if (options.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  if (results.length === 0) {
    console.log(chalk.yellow(`No agents found for "${query}".`));
    console.log(chalk.gray('Try a broader search term or browse: load-agents list'));
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

  for (const agent of results) {
    // Highlight matching parts in name
    const highlighted = agent.name.replace(
      new RegExp(`(${query})`, 'gi'),
      chalk.yellow('$1')
    );
    table.push([
      chalk.bold(highlighted),
      agent.description.slice(0, 80),
      chalk.gray(agent.source),
      chalk.gray(agent.tags.slice(0, 3).join(', ')),
    ]);
  }

  console.log(`\n${chalk.bold(`Search Results for "${query}" (${results.length})`)}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nInstall: load-agents install <name>`));
};
