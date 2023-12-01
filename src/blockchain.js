const sha256 = require("sha256");
const uuid = require('uuid').v4;
class Blockchain{
    constructor(name, ownerAddress) {
        this.chain = [];
        // Genesis Block
        this.createNewBlock({nonce: 0,duration:0},[],{name, ownerAddress});
    }
    createNewBlock(nonce,transactions,data){
        const newBlock = new Block(this,transactions,nonce,data||{});

        this.chain.push(newBlock);

        return newBlock;
    }
    getLastBlock(){
        return this.chain[this.chain.length-1];
    }

    createNewTransactions(transactions){
        let nonce = this.proofOfWork()
        this.createNewBlock(nonce,transactions);
        return this.getLastBlock().index;
    }
    validate(){
        for(let i=1;i<this.chain.length;i++){
            var block = this.chain[i];
            var prevBlock = this.chain[i-1];
            if(block.previousBlockHash!==prevBlock.hash)
                return false;
        }
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
            new Transaction(amount,"00",this.chain[0].data.ownerAddress)
        ]);
    }
}

class Block{
    constructor(blockchain, transactions, nonce, data) {
        this.index = blockchain.chain.length+1;
        this.timestamp = Date.now();
        this.data = data;
        this.transactions = transactions;
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