const sha256 = require("sha256");
class Blockchain{
    constructor( ) {
        this.chain = [];
        this.pendingTransactions = [];

        // Genesis Block
        this.createNewBlock({nonce: 0,duration:0});
    }
    createNewBlock(nonce){
        const newBlock = new Block(this,nonce);

        this.pendingTransactions = [];
        this.chain.push(newBlock);

        return newBlock;
    }
    getLastBlock(){
        return this.chain[this.chain.length-1];
    }

    createNewTransactions(transactions){
        this.pendingTransactions = transactions;

        let nonce = this.proofOfWork()
        this.createNewBlock(nonce);
        return this.getLastBlock().index;
    }

    proofOfWork(){
        const start = Date.now();
        let nonce = 0;
        let lastBlock = this.getLastBlock();
        let hash = lastBlock.hashBlock(nonce);
        while(hash.substring(0,4) !== "0000"){
            nonce++;
            hash = lastBlock.hashBlock(nonce);
        }
        const duration = Date.now()-start;
        return {nonce,duration};
    }
}

class Block{
    constructor(blockchain,nonce) {
        this.index = blockchain.chain.length+1;
        this.timestamp = Date.now();
        this.transactions = blockchain.pendingTransactions;
        this.nonce = nonce;

        let prevHash ="";
        if(blockchain.chain.length===0)
            prevHash = "0"; // Genesis block
        else
            prevHash = blockchain.chain[blockchain.chain.length-1].hash;
        this.previousBlockHash = prevHash

        this.hash = this.hashBlock(nonce);
    }
    hashBlock(nonce){
        const dataAsString = this.previousBlockHash + JSON.stringify(nonce) + JSON.stringify(this);
        return sha256(dataAsString);
    }
}
class Transaction{
    constructor(amount,from,to) {
        this.amount = amount;
        this.from = from;
        this.to = to;
    }
}
module.exports = {
    Blockchain,
    Transaction
};