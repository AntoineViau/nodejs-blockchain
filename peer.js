global.id = process.argv[2];

let http = require('http');
let fs = require('fs');
let log = require('./utils/log.js');
let p2p = require('./p2p.js');
let db = require('./db.js');

let launchServer = () => {
    log('LaunchServer');
    let port = 5000 + parseInt(global.id);
    http.createServer((req, res) => {
        var body = [];
        req.on('data', (chunk) => {
            body.push(chunk);
        }).on('end', () => {
            body = Buffer.concat(body).toString();
            let data = JSON.parse(body);
            switch (data.action) {
                case 'getPeers':
                    log('REQUEST: getPeers');
                    peers.addPeer({
                        id: data.origin
                    })
                    res.end(JSON.stringify(p2p.getPeers()));
                    break;
                case 'getNbTransactions':
                    log('REQUEST: getNbTransactions');
                    res.end(JSON.stringify({
                        nbTransactions: db.getAccounts.nbTransactions
                    }));
                default:
                    break;
            }
        });
    }).listen(port);
    log('Listening on port ' + port);
}

p2p.updatePeers()
    .then(() => db.loadAccounts())
    // Récupère la dernière version
    .then(() => {

    })
    .then(() => launchServer());