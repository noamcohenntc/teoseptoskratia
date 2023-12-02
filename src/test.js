const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const bitcoin =  new Blockchain("Noam","ABC123");
bitcoin.init((existed)=>{
    console.log("init: " + bitcoin.name + " " + existed);
    bitcoin.mine(10,"i",(nonce)=>{
        console.log(nonce);
    });
});

