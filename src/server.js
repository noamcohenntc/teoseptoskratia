const MULTICHAIN_NAMESPACE = process.argv[2] || "My Circle"
if(MULTICHAIN_NAMESPACE.indexOf(">")!==-1)
    throw new Error("Namespace can't contain '>'");

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const {Blockchain,Transaction} = require("./blockchain");
const DB = require("./db");
const uuid5 = require('uuid').v5;
const port = process.argv[3] || 8080;
const nodeOperator = "o";
let multichain = {};

app.set('views', './src/views')
app.set('view engine', 'pug')

app.use(express.static('./src/public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

loadMultichainNamespace(()=>{});
function loadMultichainNamespace(cb) {
    const namespace = MULTICHAIN_NAMESPACE

    if (nodeOperatorIsNotInitialized())
        loadNodeOperator();

    function nodeOperatorIsNotInitialized() {
        return !multichain[nodeOperator];
    }

    function loadNodeOperator() {
        const uuidHashInput = 'http://' + namespace +"/i";
        const multichainWalletAddress = uuid5(uuidHashInput, uuid5.URL).split("-").join("");
        multichain[nodeOperator] = new Blockchain(nodeOperator, multichainWalletAddress, namespace);
        multichain[nodeOperator].init(onNodeOperatorLoaded)
    }

    function onNodeOperatorLoaded(isBlockchainValid) {
        if (!isBlockchainValid)
            throw new Error(`Chain ${nodeOperator}, invalid.`);

        loadMultichain(() => {
            cb();
        });
    }

    function loadMultichain(cb) {
        let db = new DB(null, namespace);
        db.getAllChainNames((names) => {
            names.forEach((name) => {
                if (name === nodeOperator) return;

                multichain[name] = new Blockchain(name, null, namespace);
                multichain[name].init((isBlockchainValid) => {
                    if (!isBlockchainValid)
                        throw new Error(`Chain ${name}, invalid.`);

                })
            });
            cb();
        })
    }
}

app.get("/",(req,res)=>{
    res.render('index', { title: MULTICHAIN_NAMESPACE })
})
app.get("/ideology",(req,res)=>{
    res.render("ideology",{ title: MULTICHAIN_NAMESPACE });
})

app.get("/customecss",(req,res)=>{
    const host = MULTICHAIN_NAMESPACE
    if(host==="Our Circle")
        return res.send(":root {--bg:white;--text:black;--text-light:#242424;--accent-bg:#fafafa}")
    if(host==="Shiriloo's Circle")
        return res.send(":root {--accent:purple;--bg:lightpink;--text:black;--text-light:#242424;--accent-bg:pink}}")
    if(host==="Itay's Circle")
        return res.send(":root {--accent:yellow;--bg:black;--text:white;--text-light:#242424;--accent-bg:#555}}")

    res.send("");
})

function getBankAccountsDetails(blockchainName) {
    let accounts = [];
    for (let key in multichain) {
        let blockchain = multichain[key];
        let accountNumber = blockchain.getCoinOwnerAddress();
        let accountName = blockchain.getOwnerName();
        let coinsInBank = multichain[blockchainName].coinsInWallet(accountNumber);

        accounts.push({
            home:accountName + "/" + blockchainName,
            name: accountName,
            coins: coinsInBank
        })
    }
    return accounts;
}

function checkIfBlockchainNameIsValid(account) {
    return account === nodeOperator || account === MULTICHAIN_NAMESPACE ||
        !/^[A-Za-z0-9]*$/.test(account) ||
        account === "";
}

app.get("/:coinname/home",(req,res)=>{
    let account = req.params.coinname;

    if(req.query.new && multichain[account])
        return res.render("error",{title:MULTICHAIN_NAMESPACE,error:"This blockchain name is already taken."})
    else if(req.query.new)
        return res.redirect(req.originalUrl.split("?")[0]);

    if(checkIfBlockchainNameIsValid(account))
        return res.render("error",{title:MULTICHAIN_NAMESPACE,error:"Invalid blockchain name",description:"Blockchain name cannot contain \"@\", \":\" or \"?\". Also \"o\" is an internal blockchain that collects mining & transaction cost due to CPU usage. In addition the blockchain name can't be equal to the namespace."})

    let blockchainName = account;

    if(!multichain[blockchainName]) {
        const ownerAddress = uuid5('http://' + MULTICHAIN_NAMESPACE + "/" +blockchainName, uuid5.URL).split("-").join("");
        multichain[blockchainName] = new Blockchain(blockchainName, ownerAddress,MULTICHAIN_NAMESPACE);
        multichain[blockchainName].init((valid)=>{
            if(!valid)
                throw new Error("Blockchain: " + blockchainName +", invalid");
            next();
        });
    }else next();
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
            accounts,
            title: MULTICHAIN_NAMESPACE,
            from:blockchainName,
            namespace:MULTICHAIN_NAMESPACE
        })
    }
})
app.get("/:from/:blockchain/partner",(req,res)=>{
    let clientName = req.params.from

    let blockchainName = req.params.blockchain;

    let clientBankAddress = multichain[clientName].getCoinOwnerAddress();

    const coinsInEco = multichain[blockchainName].coinsInEco();
    const coinsInWallet = multichain[blockchainName].coinsInWallet(clientBankAddress);

    res.render("partner", {
        coinName:blockchainName,
        ownerAddress:clientBankAddress,
        coinsInEco,
        coinsInWallet,
        accounts:getBankAccountsDetails(blockchainName),
        title: MULTICHAIN_NAMESPACE,
        from:clientName,
        to:blockchainName,
        namespace:MULTICHAIN_NAMESPACE
    })
})

/*******/
/* API */
/*******/
app.get("/:coinname/blockchain",(req,res)=>{
    let blockchainName = req.params.coinname

    res.send(multichain[blockchainName].chain);
})
app.post("/transactions",(req,res)=>{
    let transactions = [];

    req.body.transactions.forEach((transaction)=>{
        const from = multichain[transaction.from].getCoinOwnerAddress();
        const to = multichain[transaction.to].getCoinOwnerAddress();
        const amount = parseFloat(transaction.amount);
        transactions.push({from,to,amount});
    });

    multichain[req.query.blockchain].createNewTransactions(transactions,multichain[nodeOperator].getCoinOwnerAddress(),(nonce)=>{
        const result = {cpu:nonce.cpu};

        result.accounts = getBankAccountsDetails(req.query.blockchain);
        res.json(result);
    });

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
/* Auto-deleted every hour
/*************************************/
function executeEveryRoundHour() {
    const db = new DB("00", "00")
    db.deleteDB();
    multichain = {};
    loadMultichainNamespace(()=>{});
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