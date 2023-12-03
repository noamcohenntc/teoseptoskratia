const fs = require("fs");
class DB{
    constructor(blockchainName,namespace) {
        if(blockchainName==="00" && namespace==="00")
            return;

        if(!fs.existsSync(process.cwd() + "/DB"))
            fs.mkdirSync(process.cwd() + "/DB");

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
        fs.writeFile(this.path ,JSON.stringify(chain),cb)
    }
    loadChain(cb){
        if(!fs.existsSync(this.path))
            return cb(null);

        fs.readFile(this.path,"utf8",(err,data)=>{
            const chain = JSON.parse(data);
            cb(chain);
        })
    }
    getAllChainNames(cb){
        fs.readdir(this.namespace,(err, files)=>{
            cb(files);
        });
    }
    deleteDB(){
        const dbPath = process.cwd() + "/DB";
        if(fs.existsSync(dbPath))
            fs.rmdirSync(dbPath);
    }
}

module.exports = DB;