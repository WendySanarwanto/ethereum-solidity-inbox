// 'use strict';

const assert = require('assert');
const HDWalletProvider = require(`truffle-hdwallet-provider`);
const Web3 = require('web3');
const fs = require('fs');
const deployedDirPath = `./deployed`;
const { interface } = require(`../compile`);

describe('Inbox Contract', function() {
  let inboxContract;
  let accountAddress;
  const gasLimit = 200000;
  const gwei = 1e9;
  const gasPrice = 50*gwei;
  const defaultMessage = 'Hello Ethereum !';

  this.timeout(120000);

  /**
   * A helper for picking account which has sufficient amount of ether and also address of the deployed contract/
   * @param {*} deployedDirPath Directory path which hold a list of JSON files of accounts and deployted contract addresses.
   */
  function getAccountWithDeployedContractAddress(deployedDirPath) {
    // Check whether `.deployed` folder exist or not. 
    if (!fs.existsSync(deployedDirPath)) {
      throw new Error(`Deployed contract info's directory does not exist. Deploy the contract 1st before running this system test.`);
    }

    // Get a list of JSON file names inside `.deployed` directory
    const accountContractFileNames = fs.readdirSync(deployedDirPath);

    // Iterate each of them, read & parse each file's JSON content, 
    //       Pick first account which has sufficient fund
    const txCost = gasLimit * gasPrice;
    let account;
    let contractAddress
    for(const accountContractFileName of accountContractFileNames) {
      const jsonString = fs.readFileSync(`${deployedDirPath}/${accountContractFileName}`);
      const accountContract = JSON.parse(jsonString);
      if (accountContract.account.balance*1e18 > txCost ) {
        account = accountContract.account;
        contractAddress = accountContract.contractAddress;
        break;
      }
    }
    return {
      account: account,
      contractAddress: contractAddress
    };
  }

  /**
   * A helper for invoking Inbox smartcontract's setMessage method.
   * @param {*} message New message to keep on the blockchain
   * @param {*} callerName Name of method which call this helper.
   */
  async function doSetMessage(message, callerName){
    const setMessageSendResponse = await inboxContract.methods.setMessage(message).send({
      from: accountAddress,
      gas: gasLimit,
      gasPrice: gasPrice
    });
    console.log(`[DEBUG] <${callerName}> setMessageSendResponse: \n`, setMessageSendResponse);
  }

  before(() => {
    // TODO: Get account with deployed contract's address
    const { account, contractAddress } = getAccountWithDeployedContractAddress(deployedDirPath);
    accountAddress = account.address;

    console.log(`[DEBUG] - account.address:${accountAddress}, contractAddress: ${contractAddress}`);
    // Initialise provider
    const provider = new HDWalletProvider(
      process.env.ETH_DEV_ACC_MNEMONIC,
      process.env.RINKEBY_NODE_URL
    );

    // Prepare web3 object using the obtained provider
    const web3 = new Web3(provider);

    // Create the contract instance
    inboxContract = new web3.eth.Contract(JSON.parse(interface), contractAddress);
    inboxContract.setProvider(provider);
  });

  afterEach(async () => {
    await doSetMessage(defaultMessage, 'afterEach');
  });

  it(`can change the message`, async () => {
    // Arrange
    const newMessage = "Hello All, this message is created when running a system test session.";

    // Act
    await doSetMessage(newMessage, 'can change the message');
    const changedMessage = await inboxContract.methods.message().call();
    console.log(`[DEBUG] - <can change the message> changedMessage: ${changedMessage}`);

    // Assert
    assert.equal(changedMessage, newMessage);
  });
});