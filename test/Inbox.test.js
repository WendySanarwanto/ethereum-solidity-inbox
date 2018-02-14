// "use strict";

const assert = require('assert');
const ganache = require('ganache-cli');                 // 1. Import ganache
const Web3 = require('web3');                           // 2. Import web3
const { interface,  bytecode } = require(`../compile`); // 3. Import compiled contract's interface & bytecode

describe("Inbox Contract", () => {
  const provider = ganache.provider();                  // 4. Get provider object from ganache
  const web3 = new Web3(provider);                      // 5. Instantiate Web3 instance by specified ethereum node (ganache's provider)
  const INITIAL_MESSAGE = 'Hello Ethereum!';

  let accounts;
  let inbox;
  
  beforeEach(async () => {
    // Get a list of all accounts from Ganache
    accounts = await web3.eth.getAccounts();            // 6. get available ganache's accounts

    // Use one of these accounts to deploy the contract
    inbox = await new web3.eth.Contract(JSON.parse(interface))            // 7. Instantiate a new web3.eth.Contract instance by specified contract's interface object
                  .deploy({data: bytecode, arguments: [INITIAL_MESSAGE]}) // 8. Prepare contract's object to deploy , by specified contract's bytecode and its constructor's arg.
                  .send({from: accounts[0], gas: '1000000'});             // 9. Deploy the contract to blockchain by specified ganache's account and amount of required gas.
    inbox.setProvider(provider);                                         // 10. Associate the ganache's provider object with the deployed contract.
  });

  it(`deploys a contract`, () => {
    // console.log(`[DEBUG] - inbox=\n`, inbox);
    assert.ok(inbox.options.address);
  });

  it('has a default message', async () => {
    const message = await inbox.methods.message().call();
    assert.equal(message, INITIAL_MESSAGE);
  });

  it(`can change the message`, async() => {
    const message = "Bye, Ethereum.";
    await inbox.methods.setMessage(message).send({ from: accounts[0], gas: '100000' });
    const changedMessage = await inbox.methods.message().call();
    assert.equal(changedMessage, message);
  });
});