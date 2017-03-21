let rp = require('request-promise-native');
let log = require('./utils/log.js');
let db = require('./db.js');
let Promise = require("bluebird");
let p2p = require('./p2p.js');
let crypto = require('./keys.js');

module.exports = {
    process: (data) => {
        //log('Origin: ' + data.origin + ', Process: ' + data.operation);
        switch (data.operation) {

            case 'getaddr':
                return p2p.addPeer({ id: data.origin })
                    .then(() => JSON.stringify(p2p.getPeers()));

            case 'getNbTransactions':
                return Promise.resolve(JSON.stringify({ nbTransactions: db.getAccounts.nbTransactions }));

            case 'getDatabase':
                return Promise.resolve(JSON.stringify(db.getDatabase()));

            case 'transaction':
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
