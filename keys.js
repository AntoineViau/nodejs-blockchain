let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let log = require('./utils/log.js');

let domain = 256;
let _keys = {};

module.exports = {

    generateKeys: () => {
        log('Generate keys');
        let pub = 1 + parseInt(global.id);
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
        return Promise.resolve(Array.from(text).map(c => (c.charCodeAt(0) + key) % domain).map(code => String.fromCharCode(code)).join(''));
    },
    uncrypt: (text, key) => {
        return module.exports.crypt(text, key);
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
        let signature = module.exports.crypt(hash, privateKey);
        return Promise.resolve(signature);
    },
    checkSignature: (text, signature, publicKey) => {
        let expectedHash = module.exports.hash(text);
        hash = module.exports.uncrypt(signature, publicKey);
        return Promise.resolve(hash === expectedHash);
    }
}