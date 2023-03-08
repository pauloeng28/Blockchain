const express = require('express');
const Blockchain = require('../blockchain');
const HTTP_PORT = process.env.HTTP_PORT || 3001; // $ HTTP_PORT = 3002 npm run dev
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet/index');
const TransactionPoll = require('../wallet/transaction-pool');
const Miner = require('./miner');

const app = express();
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPoll();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

app.use(express.json());

app.get('/blockchain', (req, res) => {
    res.json(bc.chain);
});

app.post('/mine', (req, res) => {
    const block = bc.addBlock(req.body.data);
    console.log(`New Block added: ${block.toString()}`);

    p2pServer.syncChain();

    res.redirect('/blockchain');
});

app.get('/transactions', (req, res) => {
    res.json(tp.transactions);
});

app.get('/clear-pool', (req, res) => {
    tp.clear();
    res.redirect('/transactions');
});

app.get('/balance', (req, res) => {
    res.json(Wallet.calculateBalance(bc.chain, wallet.publicKey));
});

app.post('/transact', (req, res) => {
    const { reciver, amount } = req.body;
    const transaction = wallet.createTransactions(reciver, amount, tp, bc.chain);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');
});

app.get('/public-key', (req, res) => {
    res.json({ publicKey: wallet.publicKey });
});

app.get('/miner', (req, res) => {
    try {
        miner.mineTransactions();
    }
    catch (error) {
        return res.status(400).json({ type: 'error', message: error.message });
    }
    res.redirect('/blockchain');
});

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
p2pServer.listen();


// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://192.168.0.214:5001 npm run dev
// npm run dev
// HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
// HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
// HTTP_PORT=3004 P2P_PORT=5004 PEERS=ws://localhost:5001,ws://localhost:5002,ws://localhost:5003 npm run devnpm run dev
// http://192.168.166.4:3001/blockchain