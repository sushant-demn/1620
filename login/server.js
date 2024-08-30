//creating a server
const fs = require('fs');
const path = require('path');
let http = require("http");



http.createServer(function (req , res)  {
    const filepath = path.join(__dirname, 'index.html');

    fs.readFileSync(filepath ,(err , data)=>{
        if(err){
            res.writeHead(500, {'Content-Type' : 'text/html'});
            res.end("Error: Unable to fetch html file");
        }   
        else{
            res.writeHead(200, {'Content-Type' : 'text/html'});
            res.end(data);
        }
    }
)   
}).listen(8080 , () => console.log('Server is running at http://127.0.0.1:8080/'));