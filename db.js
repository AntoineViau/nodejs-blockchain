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
            log('No local database found');
            return module.exports.fetchDatabase();
        }
        return readFile('./data/' + global.id + '-db.json', 'utf8')
            .then(content => _db = JSON.parse(content))
            .catch(() => { });
    },
    fetchDatabase: () => {
        log('Fetch database');
        return p2p.getUpToDatePeer()
            .then(peer => { if (!peer) throw 'No peer'; else return peer; })
            .then(peer => request.send(peer, { operation: 'getDatabase' }))
            .then(content => _db = JSON.parse(content))
            .catch((msg) => { log('Could not fetch database'); })
    },
    saveDatabase: () => {
        log('Save database');
        return writeFile('./data/' + global.id + '-db.json', JSON.stringify(_db), 'utf8');
    },
    createAccount: (id) => {
        log('Create account');
        return crypto.generateKeys(id)
            .then(() => crypto.saveKeys())
            .then(() => _db.accounts.push({ id, balance: 100, publicKey: crypto.getKeys().pub }))
            .then(() => module.exports.saveDatabase());
    },
    getDatabase: () => _db,
    getAccount: accountId => _db.accounts.find(account => account.id === accountId),
    transaction: (fromId, toId, amount) => {
        log('transaction from ' + fromId + ' to ' + toId + ' for an amount of ' + amount);
        let from = module.exports.getAccount(fromId);
        if (!from) {
            return Promise.reject('Source account ' + fromId + ' not found');
        }
        let to = module.exports.getAccount(toId);
        if (!to) {
            return Promise.reject('Destination account ' + toId + ' not found');
        }
        if (amount > from.balance) {
            return Promise.reject('Not enough fund');
        }
        from.balance -= amount;
        to.balance += amount;
        return Promise.resolve();
    }
};