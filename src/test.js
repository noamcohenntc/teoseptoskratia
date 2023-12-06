const {Server,Client} = require("./socket.io-cb");
const http = require('http');
const httpServer = http.createServer();
httpServer.listen(3000);

const server = new Server(httpServer,(socket)=>{
    socket.on("func",(data,cb)=>{
        console.log(data); // 123
        cb("XYZ");
    })
});

const client = new Client("http://localhost:3000");
client.emit("func","123", (data)=>{
    console.log(data); // XYZ
    client.disconnect();
    server.close();
});