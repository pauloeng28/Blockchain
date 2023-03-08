const Transaction = require("../wallet/transaction");

class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mineTransactions() {
        if (this.transactionPool.transactions == '') return;
        this.minedBy();
        const validTransactions = this.transactionPool.validTransactions();
        this.blockchain.addBlock(validTransactions);
        this.p2pServer.syncChain();
        this.p2pServer.broadcastClearTxs();
        this.transactionPool.clear();
    }

    calculateFee() {
        let input = 0;
        const tp = this.transactionPool;
        for (let i = tp.transactions.length - 1; i > -1; i--) {
            const transaction = tp.transactions[i];
            transaction.outputs.forEach(outputs => {
                //const regex = /^[0-9]+$/;
                if (outputs.addressRx == "Miner") {
                    //if (regex.test(outputs.amountRx)) 
                    input += outputs.amountRx;
                }
            })
        }
        return input;
    }

    minedBy() {
        let fee = this.calculateFee();
        this.wallet.balance += fee;
        let transaction = this.transactionPool.existingTransaction(this.wallet.publicKey);
        if (transaction) {
            transaction.update(this.wallet, this.wallet.publicKey, fee)
        } else {
            transaction = Transaction.newTransaction(this.wallet, this.wallet.publicKey, fee);
            this.transactionPool.updateOrAddTransaction(transaction);
        }
    }
}
module.exports = Miner;
