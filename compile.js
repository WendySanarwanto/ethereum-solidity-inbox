'use strict';

const path = require('path');
const fs = require('fs');
const solc = require('solc');

const resolvedInboxSolPath = path.resolve(__dirname, 'contracts', 'Inbox.sol');
// console.debug(`[DEBUG] - resolvedInboxSolPath = ${resolvedInboxSolPath}`);

const contractContent = fs.readFileSync(resolvedInboxSolPath, 'utf8');
const compiledContract = solc.compile(contractContent, 1);
// console.debug(`[DEBUG] - Compiled contract = \n `, compiledContract);
const inboxCompiledContract = compiledContract.contracts[':Inbox'];
// console.debug(`[DEBUG] - inboxCompiledContract.bytecode = \n `, inboxCompiledContract.bytecode);
// console.debug(`[DEBUG] - inboxCompiledContract.interface = \n `, inboxCompiledContract.interface);

module.exports = inboxCompiledContract;
