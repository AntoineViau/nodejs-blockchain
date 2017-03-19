let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let log = require('./utils/log.js');
let crypto = require('./keys.js');
let fs = require('fs');
let p2p = require('./p2p.js');
let request = require('./utils/request.js');

let _db = {
    nbTransactions: 0,
    accounts: []
}

module.exports = {
    loadDatabase: () => {
        log('Load database');
        if (!fs.exists('./data/' + global.id + '-db.json')) {
            log('Database file does not exist : get db from peers');
            return p2p.getUpToDatePeer()
                .then(peer => { if (!peer) throw 'No peer'; else return peer; })
                .then(peer => request.send(peer, 'getDatabase'))
                .catch((msg) => {  })
        }
        return readFile('./data/' + global.id + '-db.json', 'utf8')
            .then(content => _db = JSON.parse(content))
            .catch(() => { });
    },
    saveDatabase: () => {
        log('Save database');
        return writeFile('./data/' + global.id + '-db.json', JSON.stringify(_db), 'utf8');
    },
    createAccount: () => {
        log('Create account');
        return crypto.generateKeys()
            .then(() => crypto.saveKeys())
            .then(() => _db.accounts.push({ id: global.id, balance: 100, publicKey: crypto.getKeys().pub }))
            .then(() => module.exports.saveDatabase());
    },
    getDatabase: () => _db,
    getAccount: accountId => _db.accounts.find(account => account.id === accountId)
};