const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const uuid = require('uuid').v4;

const port = 8080;
const nodeAddress = uuid().split("-").join("");

const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/blockchain",(req,res)=>{
    res.send(bitcoin);
})

app.post("/transaction",(req,res)=>{
    const blockIndex = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    res.json({note: `Transaction pending future block: ${blockIndex}`})
})

app.get("/mine",(req,res)=>{
    const lastBlock = bitcoin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockData = {
        transactions:bitcoin.pendingTransactions,
        index:lastBlock.index+1
    }

    const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
    const blockHash = bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce)

    bitcoin.createNewTransaction(nonce.duration, "00",nodeAddress);

    const newBlock = bitcoin.createNewBlock(nonce,previousBlockHash,blockHash);
    res.json({
        note:"New block created",
        newBlock
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})