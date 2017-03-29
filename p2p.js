let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let request = require('./utils/request.js');
let log = require('./utils/log.js');
let db = require('./db.js');
let _peers = [];

module.exports = {
    updatePeersList: () => {
        log('Update peers list from known peers');
        return loadKnownPeers()
            .then(knownPeers => {
                return Promise.each(
                    knownPeers.filter(knownPeer => knownPeer.id !== global.id).map(knowPeer => askPeersOf(knowPeer)),
                    peers => peers.forEach(peer => addPeer(peer))
                );
            })
            .then(() => savePeers())
            .then(() => _peers);
    },
    addPeer: (peer) => {
        addPeer(peer);
        return savePeers();
    },
    getPeers: () => {
        return _peers
    },
    getUpToDatePeer: () => {
        log('Get most up to date peer');
        let localState = db.getState();
        let max = -1;
        let upToDatePeer = undefined;
        return Promise.each(
            _peers.map(peer => askStateOf(peer)),
            (remoteState, index) => {
                if (remoteState)
                upToDatePeer = upToDatePeer || _peers[index];
                if (state > max) {
                    max = state;
                    upToDatePeer = _peers[index];
                }
            })
            .then(() => upToDatePeer);
    },
    broadcast: (fromId, toId, amount) => {
        log('Broadcast transaction from ' + fromId + ' to ' + toId + ' for an amount of ' + amount);
        return Promise.each(
            knownPeers
                .filter(knownPeer => knownPeer.id !== global.id)
                .map(knowPeer => request.send(knownPeer, { operation: 'transaction', fromId, toId, amount })),
            () => { });
    }
};

loadKnownPeers = () => {
    log('Load known peers');
    return readFile('./data/' + global.id + '-peers.json', 'utf8')
        .then(content => JSON.parse(content))
        .then(knownPeers => {
            knownPeers.forEach(peer => addPeer(peer))
            log(knownPeers.length + ' peers loaded: ' + knownPeers.map(p => p.id).join(' '));
            return knownPeers;
        })
        // Aucun peer connu, on force au Peer Zero
        .catch(() => [{ id: '0' }]);
}

askPeersOf = (peer) => {
    log('Ask peers list of ' + peer.id);
    return request.send(peer, { origin: global.id, operation: 'getPeers' })
        .catch(() => {
            log('Peer ' + peer.id + ' is not available (getPeers)');
            return [];
        });
};

addPeer = (peer) => {
    if (peer && peer.id && !_peers.find(p => p.id === peer.id) && peer.id !== global.id) {
        _peers.push({ id: peer.id });
    }
};

savePeers = () => {
    log('Save ' + _peers.length + ' peers: ' + _peers.map(p => p.id).join(' '));
    return writeFile('./data/' + global.id + '-peers.json', JSON.stringify(_peers), 'utf8');
};

askStateOf = (peer) => {
    log('Ask state to ' + peer.id);
    let _response;
    return request.send(peer, { operation: 'getDatabase' })
        .then(response => {
            log(`getState to ${peer.id}`);
            return response;
        })
        .catch(() => {
            log(`Peer ${peer.id} not available (getState)`);
            return 0;
        })
};

compareStates = (local, remote) => {

};
