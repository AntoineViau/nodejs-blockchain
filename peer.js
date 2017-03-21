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
        var body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            let data = JSON.parse(Buffer.concat(body).toString());
            //log('data: ' + Buffer.concat(body).toString());
            p2p.addPeer({ id: data.origin })
                .then(() => operation.process(data))
                .then(responseContent => res.end(responseContent));
        });
    }).listen(port);
    log('Listening on port ' + port);
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
    .then(() => launchServer());
