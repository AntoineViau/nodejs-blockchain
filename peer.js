let Promise = require("bluebird");
let http = require('http');
let fs = require('fs');
let log = require('./utils/log.js');
let p2p = require('./p2p.js');
let db = require('./db.js');
let crypto = require('./keys.js');
let request = require('./utils/request.js');

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
            body = Buffer.concat(body).toString();
            let data = JSON.parse(body);
            log('REQUEST: ', data.operation);
            switch (data.operation) {
                case 'getPeers':
                    p2p.addPeer({ id: data.origin });
                    res.end(JSON.stringify(p2p.getPeers()));
                    break;
                case 'getNbTransactions':
                    res.end(JSON.stringify({
                        nbTransactions: db.getAccounts.nbTransactions
                    }));
                case 'getDatabase':
                    res.end(db.getAccounts());
                    break;
                case 'doTransaction':
                    let accountId = data.accountId;
                    let amount = data.amount;
                    doTransaction(accountId, amount).then(ok => res.end(ok ? 'ok' : 'nok'));
                    break;
                default:
                    break;
            }
        });
    }).listen(port);
    log('Listening on port ' + port);
}

let doTransaction = (accountId, amount) => {
    log('doTransaction(' + accountId + ',' + amount + ')');
    let account = db.getAccounts(accountId);
    if (!account) {
        return Promise.resolve(false);
    }
    if (amount > account.balance) {
        return Promise.resolve(false);
    }
}

process.argv[3] === 'reset' && reset();

let generateKeysIfNeeded = () => {
    if (!fs.existsSync('./data/' + global.id + '-keys.json')) {
        return crypto.generateKeys().then(() => crypto.saveKeys());
    }
    return Promise.resolve();
}

let createAccountIfNeeded = () => {
    if (!db.getAccount(global.id)) {
        return db.createAccount();
    }
    return Promise.resolve();
}


Promise.resolve()
    .then(() => p2p.updatePeersList())
    .then(() => db.loadDatabase())
    .then(() => createAccountIfNeeded())
    .then(() => launchServer());
