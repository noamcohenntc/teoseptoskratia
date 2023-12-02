const fs = require("fs");
class DB{
    constructor(blockchainName,namespace) {
        this.path = process.cwd() + "/DB/"+namespace
        if(!fs.existsSync(this.path))
            fs.mkdirSync(this.path);
        this.path = this.path +"/"+ blockchainName;
        if(!fs.existsSync(this.path))
            fs.mkdirSync(this.path);
        this.path =  this.path + "/chain.json";
    }
    saveChain(chain,cb){
        fs.writeFileSync(this.path ,JSON.stringify(chain))
        cb();
    }
    loadChain(cb){
        if(!fs.existsSync(this.path))
            return cb(null);

        const chain = JSON.parse(fs.readFileSync(this.path,"utf8"))
        cb(chain);
    }
}

module.exports = DB;