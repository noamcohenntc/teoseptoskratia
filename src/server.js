const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const {request} = require("express");
const { prettyPrintJson } = require('pretty-print-json');
const uuid = require('uuid').v5;
const MY_NAMESPACE = '9b561c64-41d5-221a-77b3-br05as1f7128';
const port = 8080;
const blockChains = {};
const URL = "https://labourcoin.com/";

blockChains["i"] = new Blockchain("name",uuid(URL,uuid.URL).split("-").join(""));
blockChains["i"].init();

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(express.static('./src/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.get("/",(req,res)=>{
    res.render('index', { title: 'Hey', message: 'Hello there!' })
})
app.get("/:coinname/home",(req,res)=>{
    let account = req.params.coinname;
    let renderOptions = {};
    // Is this a client of the business?
    if(account.indexOf('@')!==-1){
        let blockchainName = account.split("@")[1];
        let clientBankAddress = blockChains[account.split("@")[0]].getCoinOwnerAddress();

        const coinsInEco = blockChains[blockchainName].coinsInEco();
        const coinsInWallet = blockChains[blockchainName].coinsInWallet(clientBankAddress);

        renderOptions = {
            coinName:account,
            ownerAddress:clientBankAddress,
            coinsInEco,
            coinsInWallet
        }
    }
    else{ // This is the business!
        let blockchainName = account;
        if(!blockChains[blockchainName]) {
            const ownerAddress = uuid(req.protocol + '://' + req.get('host') + req.originalUrl, uuid.URL).split("-").join("");
            blockChains[blockchainName] = new Blockchain(blockchainName, ownerAddress);
            blockChains[blockchainName].init();
        }
        const ownerAddress = blockChains[blockchainName].getCoinOwnerAddress();
        const coinsInEco = blockChains[blockchainName].coinsInEco();
        const coinsInWallet = blockChains[blockchainName].coinsInWallet();

        renderOptions = {
            coinName:blockchainName,
            ownerAddress,
            coinsInEco,
            coinsInWallet,
            canMine:true
        }
    }
    res.render('home', renderOptions)

})

/*******/
/* API */
/*******/
app.get("/:coinname/blockchain",(req,res)=>{
    res.send(blockChains[req.params.coinname].chain);
})

app.post("/:coinname/transactions",(req,res)=>{
    const blockIndex = blockChains[req.params.coinname].createNewTransactions(req.body.transactions);
    res.json({note: `Transaction created in block: ${blockIndex}`})
})

app.post("/:coinname/mine",(req,res)=>{
    let nonce = blockChains[req.params.coinname].mine(parseFloat(req.body.amount),blockChains["i"].getCoinOwnerAddress());

    res.json({
        note:`New block created with: ${req.body.amount}`,
        nonce,
        coinsInEco:blockChains[req.params.coinname].coinsInEco(),
        coinsInWallet:blockChains[req.params.coinname].coinsInWallet()
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})