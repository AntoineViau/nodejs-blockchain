let rp = require('request-promise-native');
let log = require('./utils/log.js');
let db = require('./db.js');
let Promise = require("bluebird");
let p2p = require('./p2p.js');
let crypto = require('./keys.js');

module.exports = {
    process: (data) => {

        //log('Process: ' + JSON.stringify(data));

        switch (data.operation) {

            case 'getPeers':
                return Promise.resolve(JSON.stringify(p2p.getPeers()));

            case 'getState':
                let state = db.getHash();
                return Promise.resolve(JSON.stringify({ state }));

            case 'getNbTransactions':
                return Promise.resolve(JSON.stringify({ nbTransactions: db.getNbTransactions() }));

            case 'getDatabase':
                log('Process getDatabase: ' + response)
                return Promise.resolve(JSON.stringify(db.getDatabase()));

            case 'transaction':
                log('Process transaction: ' + JSON.stringify(data));
                let publicKey = db.getAccount(data.fromId).publicKey;
                let message = { operation: 'transaction', fromId: data.fromId, toId: data.toId, amount: data.amount };
                let messageStr = JSON.stringify(message);
                return crypto.uncrypt(data.signature, publicKey)
                    .then(uncrypted => {
                        if (uncrypted !== messageStr) {
                            log('Nope, invalid signature');
                            return Promise.throw('Invalid signature !')
                        }
                        return db.transaction(data.fromId, data.toId, data.amount)
                    })
                    .then(() => p2p.broadcast())
                    .then(() => JSON.stringify({ status: 'ok' }))
                    .catch(message => JSON.stringify({ status: 'error', message }))

            default:
                return Promise.resolve('Operation unknown');
        }
    }
};
