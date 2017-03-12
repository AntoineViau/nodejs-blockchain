let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let request = require('./utils/request.js');
let log = require('./utils/log.js');
let _peers = [];

module.exports = {
    updatePeers: () => {
        log('Update peers');
        return loadKnownPeers()
            .then(knownPeers => {
                knownPeers.forEach(peer => addPeer(peer));
                return Promise.each(
                    knownPeers.map(knowPeer => askPeersOf(knowPeer)),
                    peers => peers.forEach(peer => addPeer(peer))
                );
            })
            .then(() => savePeers())
            .then(() => _peers);
    },
    addPeer: (peer) => {
        addPeer(peer);
        savePeers();
    },
    getPeers: () => {
        return _peers
    },
    getUpToDatePeer: () => {
        log('Get up to date peer');
        let max = -1;
        let upToDatePeer;
        return Promise.each(
            _peers.map(peer => askNbTransactionsOf(peer)),
            (nbTransactions, index) => {
                if (nbTransactions > max) {
                    max = nbTransactions;
                    upToDatePeer = _peers[index];
                }
            })
            .then(() => upToDatePeer);
    }
};

loadKnownPeers = () => {
    return readFile('./data/'+global.id + '-peers.json', 'utf8')
        .then(content => JSON.parse(content))
        .catch(() => [{ id: '0' }]);
}

askPeersOf = (peer) => {
    log('Ask peers of ' + peer.id);
    return request.send(peer, { action: "getPeers" })
        .catch(() => {
            log('Peer ' + peer.id + ' is not available');
            return [];
        });
};

addPeer = (peer) => {
    if (!_peers.find(p => p.id === peer.id)) {
        _peers.push({ id: peer.id });
        log('Peer ' + peer.id + ' added');
    }
};

savePeers = () => {
    log('Save peers');
    return writeFile('./data/'+global.id + '-peers.json', JSON.stringify(_peers), 'utf8');
};

askNbTransactionsOf = (peer) => {
    log('Ask nb transactions to ' + peer.id);
    return request.send(peer.id, { action: 'getNbTransactions' })
        .catch(() => 0);
};

