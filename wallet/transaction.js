const ChainUtil = require('../chain-util/chain-util');

class Transaction {

    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }

    update(senderWallet, reciver, amount) {
        const senderOutput = this.outputs.find(output => output.addressTx === senderWallet.publicKey);
        if (amount > senderOutput.amountTx) {
            console.log(`Amount: ${amount} exceeds the balance: ${senderOutput.amountTx}`);
            return false;
        }
        senderOutput.amountTx = senderOutput.amountTx - amount;
        //senderWallet.balance = senderOutput.amount;
        this.outputs.push({ amountRx: amount, addressRx: reciver });
        Transaction.signTransaction(this, senderWallet);

        return this;
    }

    static newTransaction(senderWallet, reciver, amount) {
        const transaction = new this();
        if (amount > senderWallet.balance) {
            console.log(`Amount: ${amount} exceeds balance`);
            return;
        }
        transaction.outputs.push(...[
            { amountTx: senderWallet.balance - amount, addressTx: senderWallet.publicKey },
            { amountRx: amount, addressRx: reciver }
        ]);
        //senderWallet.balance = senderWallet.balance - amount;
        Transaction.signTransaction(transaction, senderWallet);

        return transaction;
    }

    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }

    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature(transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs));
    }
}

module.exports = Transaction;