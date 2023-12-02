const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const bitcoin =  new Blockchain("Noam","ABC123");

let cpu = process.cpuUsage()
console.log(cpu)
cpu = process.cpuUsage()
console.log(cpu)

