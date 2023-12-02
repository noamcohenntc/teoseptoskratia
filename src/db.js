const fs = require("fs");
class DB{
    constructor(blockchainName,namespace) {
        namespace = namespace.replace(":","");
        this.namespace = process.cwd() + "/DB/"+namespace;
        this.path = this.namespace;
        if(blockchainName) {
            if (!fs.existsSync(this.path))
                fs.mkdirSync(this.path);
            this.path = this.path + "/" + blockchainName;
            if (!fs.existsSync(this.path))
                fs.mkdirSync(this.path);
            this.path = this.path + "/chain.json";
        }
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
    getAllChainNames(cb){
        var chainNames = fs.readdirSync(this.namespace);
        cb(chainNames);
    }
}

module.exports = DB;