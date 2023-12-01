const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const bitcoin =  new Blockchain("Noam","ABC123");

bitcoin.mine(10);
bitcoin.createNewTransactions([
    new Transaction(10,"Noam","Devil")
]);

console.log(util.inspect(bitcoin, false, null, true))
console.log("Is valid:",bitcoin.validate());