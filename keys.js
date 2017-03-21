let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let log = require('./utils/log.js');

let domain = 256;
let _keys = {};

module.exports = {

    generateKeys: (id) => {
        log('Generate keys');
        let pub = 1 + parseInt(id);
        let priv = domain - pub;
        _keys = { priv, pub };
        return Promise.resolve(_keys);
    },
    getKeys: () => {
        return _keys;
    },
    saveKeys: () => {
        log('Save keys');
        return writeFile('./data/' + global.id + '-keys.json', JSON.stringify(_keys), 'utf8');
    },
    loadKeys: () => {
        return readFile('./data/' + global.id + '-keys.json', 'utf8').then(content => _keys = JSON.parse(content));
    },
    crypt: (text, key) => {
        return Promise.resolve(
            Array.from(text)
                .map(c => (c.charCodeAt(0) + key) % domain)
                .map(code => code.toString(16))
                .map(c => (c.length === 1 ? '0' : '') + c)
                .join(' ')
        );
    },
    uncrypt: (hexText, key) => {        
        return Promise.resolve(
            hexText.split(' ')
                .map(hex => parseInt(hex, 16))
                .map(code => (code + key) % domain)
                .map(code => String.fromCharCode(code))
                .join('')
        );
    },
    hash: (text) => {
        let nbVoyelles = 0;
        let nbConsonnes = 0;
        let nbSpaces = 0;
        let sum = 0;
        Array.from(text).forEach(c => {
            if (['a', 'e', 'i', 'o', 'u'].indexOf(c.toLowerCase()) !== -1) {
                nbVoyelles++;
            }
            if (['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z'].indexOf(c.toUpperCase()) !== -1) {
                nbConsonnes++;
            }
            if (c === ' ') {
                nbSpaces++;
            }
            sum += c.charCodeAt(0);
        });
        let h = text.length.toString() + nbVoyelles.toString() + nbConsonnes.toString() + sum.toString();
        return Promise.resolve(h);
    },
    sign: (text, privateKey) => {
        let hash = module.exports.hash(text);
        return module.exports.crypt(hash, privateKey);
    },
    checkSignature: (text, signature, publicKey) => {
        let expectedHash = module.exports.hash(text);
        return module.exports.uncrypt(signature, publicKey)
            .then(hash => hash === expectedHash);
    }
}