let rp = require('request-promise-native');

module.exports = {
    send: (peer, data) => {
        let options = {
            method: 'GET',
            uri: 'http://localhost:' + (5000 + parseInt(peer.id)),
            json: true,
            body: Object.assign(data, { origin: global.id })
        };
        return rp(options);
    }
};
