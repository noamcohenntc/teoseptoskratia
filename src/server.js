const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const {request} = require("express");
const uuid = require('uuid').v4;

const port = 8080;
const coins = {};

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(express.static('./src/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    res.render('index', { title: 'Hey', message: 'Hello there!' })
})
app.get("/:coinname/home",(req,res)=>{
    const coinName = req.params.coinname;
    if(!coins[coinName]) {
        const ownerAddress = uuid().split("-").join("");
        coins[coinName] = new Blockchain(coinName, ownerAddress);
    }
    const ownerAddress = coins[coinName].ownerAddress;
    res.render('home', {coinName, ownerAddress})
})
/*******/
/* API */
/*******/
app.get("/:coinname/blockchain",(req,res)=>{
    res.send(timecoin);
})

app.post("/:coinname/transactions",(req,res)=>{
    const blockIndex = timecoin.createNewTransactions(req.body.transactions);
    res.json({note: `Transaction created in block: ${blockIndex}`})
})

app.post("/:coinname/mine",(req,res)=>{
    timecoin.mine(req.body.amount);

    res.json({
        note:`New block created with: ${req.body.amount}`,
        nonce:timecoin.getLastBlock().nonce
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})