const sha256 = require("sha256");

class Blockchain{
    constructor(name, ownerAddress) {
        this.chain = [];
        // Genesis Block
        this.createNewBlock({nonce: 0,duration:0},[],{name, ownerAddress});
    }

    coinsInEco(){
        let coinCnt = 0;
        this.chain.forEach((block)=>{
            block.transactions.forEach((transaction)=>{
                if(transaction.from==="00")
                    coinCnt+=transaction.amount;
            })
        });
        return coinCnt;
    }

    coinsInWallet(address){
        let coinCnt = 0;
        address = address||this.getCoinOwnerAddress();

        this.chain.forEach((block)=>{
            block.transactions.forEach((transaction)=>{
                if(transaction.from===address)
                    coinCnt-=transaction.amount;
                else if(transaction.to===address)
                    coinCnt+=transaction.amount;
            })
        });
        return coinCnt;
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
        return nonce;
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

    getCoinOwnerAddress(){
        return this.chain[0].data.ownerAddress;
    }

    mine(amount,feeAddress){
        const nonce = this.createNewTransactions([
            new Transaction(amount,"00",this.getCoinOwnerAddress())
        ]);
        this.createNewTransactions([
            new Transaction((nonce.duration/100000)*amount,this.getCoinOwnerAddress(), feeAddress)
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