const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const {request} = require("express");
const uuid = require('uuid').v4;

const port = 8080;
const ownerAddress = "BLOCK OWNER";//uuid().split("-").join("");
const timecoin = new Blockchain(ownerAddress);

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    res.render('index', { title: 'Hey', message: 'Hello there!' })
})
app.get("/blockchain",(req,res)=>{
    res.send(timecoin);
})

app.post("/transactions",(req,res)=>{
    const blockIndex = timecoin.createNewTransactions(req.body.transactions);
    res.json({note: `Transaction created in block: ${blockIndex}`})
})

app.post("/mine",(req,res)=>{
    timecoin.mine(req.body.amount);

    res.json({
        note:`New block created with: ${req.body.amount}`,
        nonce:timecoin.getLastBlock().nonce
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})