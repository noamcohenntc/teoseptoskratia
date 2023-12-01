const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const {request} = require("express");
const uuid = require('uuid').v4;

const port = 8080;
const ownerAddress = "BLOCK OWNER";//uuid().split("-").join("");

const timecoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/blockchain",(req,res)=>{
    res.send(timecoin);
})

app.post("/transaction",(req,res)=>{
    const blockIndex = timecoin.createNewTransactions([
        new Transaction(req.body.amount,req.body.sender,req.body.recipient)
    ]);
    res.json({note: `Transaction created in block: ${blockIndex}`})
})

app.post("/mine",(req,res)=>{
    timecoin.createNewTransactions([
        new Transaction(req.body.amount,"00",ownerAddress)
    ]);

    res.json({
        note:`New block created with: ${req.body.amount}`,
        nonce:timecoin.getLastBlock().nonce
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})