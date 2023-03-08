const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
        this.transactions = [];
    }

    clear() {
        this.transactions = [];
    }

    updateOrAddTransaction(transaction) {

        let transactionWithId = this.transactions.find(t => t.id == transaction.id);

        if (transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
        } else {
            this.transactions.push(transaction);
        }
    }

    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    validTransactions() {
        let validTransactions = [];

        this.transactions.forEach(tx => {
            if (!Transaction.verifyTransaction(tx)) {
                console.log("Invalid transaction (signature) from address: " + tx.input.address);
                return;
            }
            validTransactions.push(tx);
        });
        return validTransactions;
    }
}
module.exports = TransactionPool;