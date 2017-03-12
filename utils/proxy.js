
var http = require('http');

var logs = [];
var lastSend = 0;

// Input server
http.createServer( (req, res)  => {
    var body = [];
    req.on('data',  (chunk) => {
        body.push(chunk);
    }).on('end',  ()=>  {
        body = Buffer.concat(body).toString();
        logs.push(JSON.parse(body));
        console.log('Received : '+body);
    });
}).listen(2501);

// Output server
http.createServer( (req, res) => {
    res.setHeader('Access-Control-Allow-Origin','*')
    res.writeHead(200, { 'Content-Type': 'application/json' });    
    res.end(JSON.stringify(logs.filter(log => log.ts > lastSend)));
    console.log('Sent : ', logs);
    lastSend = (new Date()).getTime();
}).listen(2502);
 


