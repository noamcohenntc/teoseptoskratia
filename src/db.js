const fs = require("fs");
class DB{
    constructor(blockchainName) {
        this.path = process.cwd() + "/DB/"+blockchainName
        console.log(this.path);
        if(!fs.existsSync(this.path))
            fs.mkdirSync(this.path);
    }
    writeBlock(block,cb){
        fs.writeFileSync(this.path + "/" + block.index + ".block",JSON.stringify(block))
        cb(block);
    }
    getChain(cb){
        let blocks = fs.readdirSync(this.path);

        blocks.sort((a,b)=>{
            let aIndex = parseInt(a.split(".")[0])
            let bIndex = parseInt(b.split(".")[0])
            if(aIndex < bIndex)
                return -1;
            return 1;
        });

        let chain = [];

        blocks.forEach((block)=>{
            chain.push(JSON.parse(fs.readFileSync(this.path +"/"+ block,"utf8")));
        })
        cb(chain);
    }

    getBlock(index,cb){
        if(!fs.existsSync(this.path +"/"+ index + ".block"))
            return cb(null);
        let block = fs.readFileSync(this.path +"/"+ index + ".block","utf8");
        cb(JSON.parse(block));
    }
    getSummaryBlock(cb){
        let blocks = fs.readdirSync(this.path);

        if(blocks.length===0)
            return cb(null);

        blocks.sort((a,b)=>{
            let aIndex = parseInt(a.split(".")[0])
            let bIndex = parseInt(b.split(".")[0])
            if(aIndex < bIndex)
                return -1;
            return 1;
        });

        let block = fs.readFileSync(this.path +"/"+ blocks[blocks.length-1],"utf8")
        cb(JSON.parse(block));
    }
}

module.exports = DB;