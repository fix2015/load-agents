'use strict';

const chalk = require('chalk');
const Table = require('cli-table3');
const { getSources, filterAgents } = require('../registry');

module.exports = function sources() {
  const sourceList = getSources();

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('Repository'),
      chalk.cyan('Type'),
      chalk.cyan('Agents'),
      chalk.cyan('URL'),
    ],
    colWidths: [20, 32, 12, 8, 50],
    wordWrap: true,
    style: { head: [], border: [] },
  });

  for (const source of sourceList) {
    const count = filterAgents({ source: source.id }).length;
    table.push([
      chalk.bold(source.id),
      source.repo,
      chalk.gray(source.type),
      String(count),
      chalk.underline(source.url),
    ]);
  }

  console.log(`\n${chalk.bold('Agent Sources')}:\n`);
  console.log(table.toString());
  console.log(chalk.gray(`\nFilter by source: load-agents list --source <id>`));
};
