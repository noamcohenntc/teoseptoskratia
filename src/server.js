const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const DB = require("./db");
const uuid5 = require('uuid').v5;
const port = 8080;
const nodeOperator = "i";
let multichain = {};

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(express.static('./src/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use((req, res, next)=>{
    const namespace = req.get('host');

    if(nodeOperatorIsNotInitialized())
        loadNodeOperator();
    else
        next();

    function nodeOperatorIsNotInitialized() {
        return !multichain[nodeOperator];
    }

    function loadNodeOperator() {
        const uuidHashInput = req.protocol + '://' + namespace;
        const multichainWalletAddress = uuid5(uuidHashInput, uuid5.URL).split("-").join("");
        multichain[nodeOperator] = new Blockchain(nodeOperator, multichainWalletAddress, namespace);
        multichain[nodeOperator].init(onNodeOperatorLoaded)
    }

    function onNodeOperatorLoaded(isBlockchainValid){
        if(!isBlockchainValid)
            throw new Error(`Chain ${nodeOperator}, invalid.`);

        loadMultichain(() => {
            next();
        });
    }

    function loadMultichain(cb) {
        let db = new DB(null, namespace);
        db.getAllChainNames((names) => {
            names.forEach((name) => {
                if (name === nodeOperator) return;

                multichain[name] = new Blockchain(name, null, namespace);
                multichain[name].init((isBlockchainValid)=>{
                    if (!isBlockchainValid)
                        throw new Error(`Chain ${name}, invalid.`);

                })
            });
            cb();
        })
    }
})
app.get("/",(req,res)=>{
    res.render('index', { title: req.get('host') })
})
app.get("/ideology",(req,res)=>{
    res.render("ideology",{ title: req.get('host') });
})

function getBankAccountsDetails(blockchainName) {
    let accounts = [];
    for (let key in multichain) {
        let blockchain = multichain[key];
        let accountNumber = blockchain.getCoinOwnerAddress();
        let accountName = blockchain.getOwnerName();
        let coinsInBank = multichain[blockchainName].coinsInWallet(accountNumber);

        accounts.push({
            home:accountName + "@" + blockchainName,
            name: accountName,
            coins: coinsInBank
        })
    }
    return accounts;
}

function checkIfBlockchainNameIsValid(account) {
    return account === nodeOperator ||
        account === "?" ||
        account === "" ||
        account.split('@').length > 2 ||
        account.indexOf(":") !== -1 ||
        (account.split('@').length === 2 && (!multichain[account.split("@")[0]] || !multichain[account.split("@")[1]]));
}

app.get("/:coinname/home",(req,res)=>{
    let account = req.params.coinname;

    if(req.query.new && multichain[account])
        return res.render("error",{error:"This blockchain name is already taken."})
    else if(req.query.new)
        return res.redirect(req.originalUrl.split("?")[0]);

    if(checkIfBlockchainNameIsValid(account))
        return res.render("error",{error:"Invalid Name",description:"Name cannot contain \"@\", \":\" or \"?\". Also \"i\" is an internal blockchain that collects mining & transaction cost due to CPU usage."})


    // Is this a client of the business?
    if(account.indexOf('@')!==-1){
        let clientName = account.split("@")[0];
        let blockchainName = account.split("@")[1];
        let clientBankAddress = multichain[clientName].getCoinOwnerAddress();

        const coinsInEco = multichain[blockchainName].coinsInEco();
        const coinsInWallet = multichain[blockchainName].coinsInWallet(clientBankAddress);

        res.render("home", {
            coinName:account,
            ownerAddress:clientBankAddress,
            coinsInEco,
            coinsInWallet,
            accounts:getBankAccountsDetails(blockchainName),
            title: req.get('host'),
            from:clientName,
            to:blockchainName,
            namespace:req.get('host')
        })
        return;
    }

    // This is the business!
    let blockchainName = account;
    if(!multichain[blockchainName]) {
        const ownerAddress = uuid5(req.protocol + '://' + req.get('host') + req.originalUrl.split("?")[0], uuid5.URL).split("-").join("");
        multichain[blockchainName] = new Blockchain(blockchainName, ownerAddress,req.get('host'));
        multichain[blockchainName].init((valid)=>{
            if(!valid)
                throw new Error("Blockchain: " + blockchainName +", invalid");
            next();
        });
    }else next();
    function next(){
        if(!multichain[blockchainName].isInit) // Duktape
            return res.redirect("/");

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
            accounts,
            title: req.get('host'),
            from:blockchainName,
            namespace:req.get('host')
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
    const blockIndex = multichain[req.params.coinName].createNewTransactions(req.body.transactions,multichain[nodeOperator].getCoinOwnerAddress());
    res.json({blockIndex})
})
app.post("/:coinname/mine",(req,res)=>{
    let blockchainName = req.params.coinname;
    multichain[blockchainName].mine(parseFloat(req.body.amount),multichain[nodeOperator].getCoinOwnerAddress(),(nonce)=>{
        res.json({
            nonce,
            coinsInEco:multichain[blockchainName].coinsInEco(),
            coinsInWallet:multichain[blockchainName].coinsInWallet(),
            accounts:getBankAccountsDetails(blockchainName)
        });
    });
})

app.listen(port,()=>{
    console.log("TEK@"+port);
})

/*************************************/
function executeEveryRoundHour() {
    const db = new DB("00", "00")
    db.deleteDB();
    multichain = {};
}

function scheduleNextRoundHour() {
    const now = new Date();
    const millisecondsUntilNextRoundHour =
        (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    setTimeout(() => {
        executeEveryRoundHour();

        const interval = 60 * 60 * 1000;
        setInterval(() => {
            executeEveryRoundHour();
        }, interval);
    }, millisecondsUntilNextRoundHour);
}
scheduleNextRoundHour();