const sha256 = require("sha256");
class Blockchain{
    constructor(ownerAddress) {
        this.ownerAddress = ownerAddress;
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
    validate(){
        this.chain.forEach((block)=>{
            if(!block.validate())
                return false;
        })
        return true;
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

    mine(amount){
        this.createNewTransactions([
            new Transaction(amount,"00",this.ownerAddress)
        ]);
    }
}

class Block{
    constructor(blockchain,nonce) {
        this.index = blockchain.chain.length+1;
        this.timestamp = Date.now();
        this.transactions = blockchain.pendingTransactions;
        this.nonce = nonce;
        this.hash = "";

        let prevHash ="";
        if(blockchain.chain.length===0)
            prevHash = "0"; // Genesis block
        else
            prevHash = blockchain.chain[blockchain.chain.length-1].hash;
        this.previousBlockHash = prevHash

        this.hash = this.hashBlock();
    }
    hashBlock(nonce){
        return sha256(JSON.stringify(nonce||this.nonce) + JSON.stringify(this));
    }

    validate(){
        let temp = this.hash;
        this.hash = "";
        let isValid = this.hashBlock()===temp;
        this.hash = temp;
        return isValid;
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