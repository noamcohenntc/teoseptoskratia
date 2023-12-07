const fs = require("fs");
const db = "/DB";
if(!fs.existsSync(process.cwd() + db))
    fs.mkdir(process.cwd() + db,(err)=>{});

class DB{
    constructor(blockchainName,namespace) {
        if(blockchainName==="00" && namespace==="00")
            return;

        namespace = namespace.replace(":","");
        this.namespace = process.cwd() + db + "/"+namespace;
        this.path = this.namespace;

        if(blockchainName) {
            if (!fs.existsSync(this.path))
                try{fs.mkdirSync(this.path);}catch{}

            this.path = this.path + "/" + blockchainName;
            if (!fs.existsSync(this.path))
                try{fs.mkdirSync(this.path);}catch{}
            this.path = this.path + "/blockchain.json";
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
        const dbPath = process.cwd() + db;
        if(fs.existsSync(dbPath))
            try{fs.rmSync(dbPath,{ recursive: true, force: true });}catch{}
        try{fs.mkdirSync(process.cwd() + db,(err)=>{});}catch{}
    }
}

module.exports = DB;