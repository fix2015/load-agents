'use strict';

const chalk = require('chalk');
const { getAllTags } = require('../registry');

module.exports = function tags() {
  const tagList = getAllTags();

  console.log(`\n${chalk.bold('Available Tags')}:\n`);

  const maxCount = tagList[0]?.count || 1;

  for (const { tag, count } of tagList) {
    const bar = '█'.repeat(Math.ceil((count / maxCount) * 20));
    console.log(`  ${chalk.cyan(tag.padEnd(20))} ${chalk.gray(bar)} ${count}`);
  }

  console.log(chalk.gray(`\nFilter by tag: load-agents list --tag <tag>`));
  console.log(chalk.gray(`Search with tag: load-agents search <query> --tag <tag>`));
};
