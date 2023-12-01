const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const timecoin =  new Blockchain();

timecoin.createNewTransactions([
    new Transaction(10,"Noam","Tom"),
    new Transaction(10,"Tom","Dr. Who")
]);

timecoin.createNewTransactions([
    new Transaction(10,"Dr. Who","Devil")
]);

console.log(util.inspect(timecoin, false, null, true))