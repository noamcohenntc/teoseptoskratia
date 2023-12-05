const IO = require("socket.io").Server;
const ioc= require("socket.io-client");
class Server{
    constructor(server, onConnection) {
        this._io = new IO(server);
        this._io.on('connection', (socket) => {
            onConnection(new Socket(socket));
        });
    }
    close(){
        this._io.close();
    }
}

class Socket{
    constructor(p) {
        this._cb = {};
        this._on = {};
        if(typeof p === "string")
            this._socket = ioc.connect(p);
        else
            this._socket = p;

        this._socket.on("msg",(data)=>{
            for(let key in this._on){
                if(key===data.func){
                    this._on[key].forEach((cb)=>{
                        cb(data.data,(d)=>{
                            this._socket.emit("gsm",{
                                uuid:data.uuid,
                                data:d
                            })
                        });
                    })
                }
            }
        });
        this._socket.on("gsm",(data)=>{
            this._cb[data.uuid](data.data);
            delete this._cb[data.data];
        })
    }

    emit(func, data, cb) {
        const uuid = crypto.randomUUID();
        this._cb[uuid] = cb
        this._socket.emit("msg",{
            func:func,
            data:data,
            uuid:uuid
        })
    }

    on(func,cb){
        if(!this._on[func])
            this._on[func] = [];
        this._on[func].push(cb);
    }

    disconnect() {
        this._socket.disconnect();
    }
}

class Client{
    constructor(url) {
        this.socket = new Socket(url);
    }

    emit(func, data, cb) {
        this.socket.emit(func,data,cb);
    }

    disconnect() {
        this.socket.disconnect();
    }
}

module.exports={
    Server,Client
}