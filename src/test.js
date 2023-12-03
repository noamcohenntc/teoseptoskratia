const util = require('util')
const {Blockchain, Transaction} = require("./blockchain");
const operator =  new Blockchain("i","i","test");
const chain1 =  new Blockchain("tester1","i","test");
operator.init((valid)=> {
    console.assert(valid, "failed to validate operator blockchain");
    if (valid) {
        console.log("init operator blockchain");
        test1();
    }
});

function test1(){
    chain1.init((valid)=>{
        console.assert(valid,"chain1 not valid.")
        if(valid){
            chain1.mine(100, operator.getCoinOwnerAddress(),(nonce)=>{
                console.log(`overall mined ${chain1.coinsInEco()}`,nonce);
                test2();
            })
        }
    })
}

function test2(){

}
