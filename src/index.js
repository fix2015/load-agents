'use strict';

const { findAgent, searchAgents, filterAgents, getAllAgents, getAllTags } = require('./registry');
const { installAgent, fetchAgentContent } = require('./installer');

module.exports = {
  findAgent,
  searchAgents,
  filterAgents,
  getAllAgents,
  getAllTags,
  installAgent,
  fetchAgentContent,
};
