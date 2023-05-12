const prompts = require('prompts');
const Web3 = require('web3');
// Set up a web3 instance using your preferred provider (e.g. Infura)
const web3 = new Web3('https://goerli.infura.io/v3/08112408c57049c99992b5ebcaf1c735');

async function main() {
  // Get private key from the user
  const senderPrivateKeyResponse = await prompts({
    type: 'password',
    name: 'senderPrivateKey',
    message: 'Enter the sender private key:',
  });

  // Get the receiver wallet address from the user
  const receiverAddressResponse = await prompts({
    type: 'text',
    name: 'receiverAddress',
    message: 'Enter the receiver wallet address:',
  });

  // Get the number of transactions the user wants to perform
  const numTransactionsResponse = await prompts({
    type: 'number',
    name: 'numTransactions',
    message: 'Enter the number of transactions to perform:',
    validate: value => value > 0 && value % 1 === 0 ? true : 'Please enter a positive integer.'
  });

  const account = web3.eth.accounts.privateKeyToAccount(
    senderPrivateKeyResponse.senderPrivateKey,
  );

  const senderAddress = account.address;

  // Get the sender's balance
  let senderBalance = await web3.eth.getBalance(senderAddress);

  // Loop through the specified number of transactions
  for (let i = 0; i < numTransactionsResponse.numTransactions; i++) {
    // Generate a random amount of ETH less than the sender's balance
    const amountWei = Math.floor(Math.random() * senderBalance/numTransactionsResponse.numTransactions);

    const gasPrice = await web3.eth.getGasPrice();
    // Send the transaction with the specified amount
    const tx = {
      from: senderAddress,
      to: receiverAddressResponse.receiverAddress,
      value: amountWei,
      gasPrice,
      gas: 21000
    };
    const signedTx = await web3.eth.accounts.signTransaction(
      tx,
      senderPrivateKeyResponse.senderPrivateKey,
    );
    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Sent ${web3.utils.fromWei(amountWei.toString())} ETH to ${receiverAddressResponse.receiverAddress} ${result.status ? 'successful' : 'failed'}`, { txHash: result.transactionHash });

    senderBalance = senderBalance - amountWei;
  }
}

main();
