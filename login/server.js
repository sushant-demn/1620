//creating a server

const { text } = require("express");
let http = require("http");
const { type } = require("os");



http.createServer(function (req , res)  {
    res.writeHead(200 , {'content-Type' : index.html});

    res.end('This is the Example of the node.js app \n');
}).listen(8080 , () => console.log('Server is running at http://127.0.0.1:8080/'));