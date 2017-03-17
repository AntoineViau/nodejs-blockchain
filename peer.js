let Promise = require("bluebird");
let http = require('http');
let fs = require('fs');
let log = require('./utils/log.js');
let p2p = require('./p2p.js');
let db = require('./db.js');
let crypto = require('./keys.js');

global.id = process.argv[2] || (!console.error('Need port/id') && process.exit(1));

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
            switch (data.operation) {
                case 'getPeers':
                    log('REQUEST: getPeers');
                    p2p.addPeer({ id: data.origin });
                    res.end(JSON.stringify(p2p.getPeers()));
                    break;
                case 'getNbTransactions':
                    log('REQUEST: getNbTransactions');
                    res.end(JSON.stringify({
                        nbTransactions: db.getAccounts.nbTransactions
                    }));
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

let init = () => {
    return new Promise((resolve, reject) => {
        // Premier lancement ? On génère les clefs du compte
        !fs.existsSync('./data/' + global.id + '-keys.json') && crypto.generateAndSaveKeys();
        let keys = crypto.loadKeys()
            .then(keys => {
                // Pas de livre, on le crée avec le compte
                !fs.exists('./data/' + global.id + '-db.json') && db.createAccount(keys.pub) && db.saveAccounts();
            })
        return resolve();
    });

}

init().
    then(() => p2p.updatePeers())
    .then(() => db.loadAccounts())
    .then(() => db.updateAccounts())
    .then(() => launchServer());
