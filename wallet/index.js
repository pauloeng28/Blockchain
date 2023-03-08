const Blockchain = require('../blockchain');
const ChainUtil = require('../chain-util/chain-util');
const { INITIAL_BALANCE, MINING_FEE_PERCENTAGE } = require('../config');
const Transaction = require('./transaction');


class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.keyPair = ChainUtil.genKeyPair();
    this.publicKey = this.keyPair.getPublic().encode('hex');
  }

  toString() {
    return `Wallet -
                Key: ${this.publicKey.toString()}
                Balance: ${this.balance}`
  }

  sign(dataHash) {
    return this.keyPair.sign(dataHash);
  }

  createTransactions(reciver, amount, transactionPool, blockchain) {

    if (Blockchain.existTransactionBlockchain(blockchain, this.publicKey)) {
      this.balance = Wallet.calculateBalance(blockchain, this.publicKey);
    };

    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds current balance: ${this.balance}`);
      return;
    }

    let transaction = transactionPool.existingTransaction(this.publicKey);
    let miningFee = (amount * MINING_FEE_PERCENTAGE);

    if (transaction) {
      const balance = transaction.outputs.find(output => output.addressTx === this.publicKey);
      if ((amount + miningFee) > balance.amountTx) {
        console.log(`Amount:${amount} plus Mining Fee:${miningFee}, exceeds current balance: ${balance.amountTx}`);
        return;
      }
      transaction.update(this, reciver, amount)
      transaction.update(this, 'Miner', miningFee);
    } else {
      transaction = Transaction.newTransaction(this, reciver, amount);
      transactionPool.updateOrAddTransaction(transaction);
      transaction.update(this, 'Miner', miningFee);
    }

    return transaction

  }

  static calculateBalance(blockchain, address) {
    let balance = 0, input = 0;

    for (let i = blockchain.length - 1; i > 0; i--) {
      const transaction = blockchain[i].data;
      for (let j = transaction.length - 1; j > -1; j--) {
        if (transaction[j].outputs[0].addressTx == address) {
          balance = transaction[j].outputs[0].amountTx;
          break;
        }
      }
      transaction.forEach(tx => {
        tx.outputs.forEach(outputs => {
          if (outputs.addressRx == address) {
            input += outputs.amountRx;
          }
        })
      })
      return balance + input;
    }
  }
}
module.exports = Wallet;


/*static calculateBalance(blockchain, address) {
  let balance = 0;
  for (let i = blockchain.length - 1; i > 0; i--) {
    const transaction = blockchain[i].data;
    transaction.forEach(tx => {
      tx.outputs.forEach(outputs => {
        const regex = /^[0-9]+$/;
        if (regex.test(outputs.amountRx)) balance += outputs.amountRx;
      })
      console.log(balance);
    });
  }
  return balance;
}*/

/*
  static calculateBalance(blockchain, address) {
    let balance = 0;
    for (let i = blockchain.length - 1; i > 0; i--) {
      const transaction = blockchain[i].data;
      transaction.forEach(tx => {
        tx.outputs.forEach(outputs => {
          if (outputs.addressRx == address) {
            const regex = /^[0-9]+$/;
            if (regex.test(outputs.amountRx)) balance += outputs.amountRx;
          }
        })
        console.log(balance);
      });
    }
    return balance;
  }
  */

/* ultima versão
  static calculateBalance(blockchain, address) {
  let balance = 0, output = 0, input = 0;
  for (let i = blockchain.length - 1; i > 0; i--) {
    const transaction = blockchain[i].data;
    transaction.forEach(tx => {
      if (tx.outputs[0].addressTx == address) {
        tx.outputs.forEach(outputs => {
          const regex = /^[0-9]+$/;
          if (regex.test(outputs.amountRx)) output += outputs.amountRx;
        });
      }
      if (tx.input.address == address) {
        input = input + tx.input.amount;
      }
    });
  }
  return balance = input - output;
}
*/