const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const timecoin =  new Blockchain("Noam");

timecoin.mine(10);
timecoin.createNewTransactions([
    new Transaction(10,"Noam","Devil")
]);

console.log(util.inspect(timecoin, false, null, true))
console.log("Is valid:",timecoin.validate());