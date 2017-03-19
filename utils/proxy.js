
let http = require('http');
let static = require('node-static');

let logs = [];
let lastSend = 0;
let inputPort = 4001;
let outputPort = 4002;

// Input server
http.createServer((req, res) => {
    var body = [];
    req.on('data', (chunk) => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        logs.push(JSON.parse(body));
        console.log('Received : ' + body);
    })
    .on('close',  () => {

    });
}).listen(inputPort);
console.log('Input server is listenning on ' + inputPort);

// Output server
http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(logs.filter(log => log.ts > lastSend)));
    console.log('Sent : ', logs);
    lastSend = (new Date()).getTime();
}).listen(outputPort);
console.log('Input server is listenning on ' + outputPort);

var file = new static.Server('./utils');
require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        file.serve(request, response);
    }).resume();
}).listen(8080);
console.log('Web server listenning on 8080');