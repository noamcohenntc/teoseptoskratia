const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const {request} = require("express");
const { prettyPrintJson } = require('pretty-print-json');
const {blogger_v2} = require("googleapis");
const {add} = require("nodemon/lib/rules");
const DB = require("./db");
const uuid = require('uuid').v5;
const port = 8080;
let multichain = {};

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(express.static('./src/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req,res,next)=>{
    if(!multichain["i"]){
        const address = uuid(req.protocol + '://' + req.get('host'), uuid.URL).split("-").join("");
        multichain["i"] = new Blockchain("i",address,req.get('host'));
        multichain["i"].init((valid)=>{
            if(!valid)
                throw new Error("Chain i, invalid.");

            let db = new DB(null,req.get('host'));
            db.getAllChainNames((names)=>{
                names.forEach((name)=>{
                    if(name==="i")return;

                    multichain[name] = new Blockchain(name,null,req.get('host'));
                    multichain[name].init((valid)=>{
                        if(!valid)
                            throw new Error(`Chain ${name}, invalid.`);
                    })
                })
            })
        })
    }
    next();
})
app.get("/",(req,res)=>{
    res.render('index', { title: 'Hey', message: 'Hello there!' })
})

function getBankAccountsDetails(blockchainName,revers) {
    let accounts = [];
    for (let key in multichain) {
        let blockchain = multichain[key];
        let accountNumber = blockchain.getCoinOwnerAddress();
        let accountName = blockchain.getOwnerName();
        let coinsInBank = multichain[blockchainName].coinsInWallet(accountNumber);
        //if (accountName !== blockchainName) {
            accounts.push({
                home:accountName + "@" + blockchainName,
                name: accountName,
                coins: coinsInBank
            })
        //}
    }
    return accounts;
}

app.get("/:coinname/home",(req,res)=>{
    let account = req.params.coinname;

    if(req.query.new && multichain[account])
        return res.render("error",{error:"This blockchain name is already taken."})
    else if(req.query.new)
        return res.redirect(req.originalUrl.split("?")[0]);

    if(account==="i" ||
        account==="?" ||
        account==="" ||
        account.split('@').length>2 ||
        account.indexOf(":")!==-1 ||
        (account.split('@').length===2 && (!multichain[account.split("@")[0]] || !multichain[account.split("@")[1]]))){
        return res.render("error",{error:"Invalid Name",description:"Name cannot contain \"@\", \":\" or \"?\". Also \"i\" is an internal blockchain that collects mining & transaction cost due to CPU usage."})
    }

    // Is this a client of the business?
    if(account.indexOf('@')!==-1){
        let blockchainName = account.split("@")[1];
        let clientBankAddress = multichain[account.split("@")[0]].getCoinOwnerAddress();

        const coinsInEco = multichain[blockchainName].coinsInEco();
        const coinsInWallet = multichain[blockchainName].coinsInWallet(clientBankAddress);

        res.render("home", {
            coinName:account,
            ownerAddress:clientBankAddress,
            coinsInEco,
            coinsInWallet,
            accounts:getBankAccountsDetails(blockchainName,true)
        })
        return;
    }

    // This is the business!
    let blockchainName = account;
    if(!multichain[blockchainName]) {
        const ownerAddress = uuid(req.protocol + '://' + req.get('host') + req.originalUrl.split("?")[0], uuid.URL).split("-").join("");
        multichain[blockchainName] = new Blockchain(blockchainName, ownerAddress,req.get('host'));
        multichain[blockchainName].init((valid)=>{
            if(!valid)
                throw new Error("Blockchain: " + blockchainName +", invalid");
            next();
        });
    }
    else
        next();
    function next(){
        const ownerAddress = multichain[blockchainName].getCoinOwnerAddress();
        const coinsInEco = multichain[blockchainName].coinsInEco();
        const coinsInWallet = multichain[blockchainName].coinsInWallet();

        let accounts = getBankAccountsDetails(blockchainName);

        res.render('home', {
            coinName:blockchainName,
            ownerAddress,
            coinsInEco,
            coinsInWallet,
            canMine:true,
            accounts
        })
    }
})

/*******/
/* API */
/*******/
app.get("/:coinname/blockchain",(req,res)=>{
    res.send(multichain[req.params.coinname].chain);
})

app.post("/:coinName/transactions",(req,res)=>{
    const blockIndex = multichain[req.params.coinName].createNewTransactions(req.body.transactions,multichain["i"].getCoinOwnerAddress());
    res.json({blockIndex})
})

app.post("/:coinname/mine",(req,res)=>{
    let blockchainName = req.params.coinname;
    let nonce = multichain[blockchainName].mine(parseFloat(req.body.amount),multichain["i"].getCoinOwnerAddress());

    res.json({
        nonce,
        coinsInEco:multichain[blockchainName].coinsInEco(),
        coinsInWallet:multichain[blockchainName].coinsInWallet(),
        accounts:getBankAccountsDetails(blockchainName)
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})