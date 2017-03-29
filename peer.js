let Promise = require("bluebird");
let http = require('http');
let fs = require('fs');
let log = require('./utils/log.js');
let p2p = require('./p2p.js');
let db = require('./db.js');
let crypto = require('./keys.js');
let request = require('./utils/request.js');
let operation = require('./operation.js');

global.id = process.argv[2] || (!console.error('Need port/id') && process.exit(1));

log('Now starting peer ' + global.id);

let reset = () => {
    log('Reset');
    [
        './data/' + global.id + '-peers.json',
        './data/' + global.id + '-db.json',
        './data/' + global.id + '-keys.json',
    ].forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
};

let launchServer = () => {
    log('LaunchServer');
    let port = 5000 + parseInt(global.id);
    http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.writeHead(200, { 'Content-Type': 'application/json' });
        var body = [];
        req
            .on('data', chunk => body.push(chunk))
            .on('end', () => {
                let data = JSON.parse(Buffer.concat(body).toString());
                p2p.addPeer({ id: data.origin })
                    .then(() => operation.process(data))
                    .then(responseContent => {
                        //log('Response : ' + responseContent);
                        res.end(responseContent)
                    });
            });
    })
        .listen(port)
        .on('error', e => console.log(`Server error: ${e}`))
    log(`Listening on port ${port}`);
}

process.argv[3] === 'reset' && reset();

let createAccountIfNeeded = () => {
    if (!db.getAccount(global.id)) {
        return db.createAccount(global.id);
    }
    return Promise.resolve();
}

Promise.resolve()
    .then(() => p2p.updatePeersList())
    .then(() => db.loadDatabase())
    .then(() => createAccountIfNeeded())
    .then(() => launchServer())
    .then(() => {
        setInterval(() => {
            log('Refresh peers and database');
            p2p.updatePeersList().then(() => db.loadDatabase());
        }, 1000 * 60);
    });
