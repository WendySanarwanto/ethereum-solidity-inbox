// "use strict";

const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const { interface,  bytecode } = require(`../compile`);

describe("Inbox Contract", () => {
  const provider = ganache.provider();
  const web3 = new Web3(provider); // 1. Instantiate Web3 instance by specified ethereum node (ganache's node)
  const INITIAL_MESSAGE = 'Hello Ethereum!';

  let accounts;
  let inbox;
  
  beforeEach(async () => {
    // Get a list of all accounts from Ganache
    accounts = await web3.eth.getAccounts();    

    // Use one of these accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))
                  .deploy({data: bytecode, arguments: [INITIAL_MESSAGE]})
                  .send({from: accounts[0], gas: '1000000'});
    inbox.setProvider(provider);
  });

  it(`deploys a contract`, () => {
    // console.log(`[DEBUG] - inbox=\n`, inbox);
    assert.ok(inbox.options.address);
  });

  it('has a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_MESSAGE);
  });
});