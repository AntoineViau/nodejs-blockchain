let domain = 256;

module.exports = {

    generateKeys: () => {
        let pub = Math.floor(Math.random() * domain);
        let priv = domain - pub;
        return {
            priv,
            pub
        };
    },
    crypt: (text, key) => {
        return Array.from(text).map(c => (c.charCodeAt(0) + key) % domain).map(code => String.fromCharCode(code)).join('');
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
        return text.length.toString() + nbVoyelles.toString() + nbConsonnes.toString() + sum.toString();
    },
    sign: (text, privateKey) => {
        let hash = module.exports.hash(text);
        let signature = module.exports.crypt(hash, privateKey);
        return signature;
    },
    checkSignature: (text, signature, publicKey) => {
        let expectedHash = module.exports.hash(text);
        hash = module.exports.uncrypt(signature, publicKey);
        return hash === expectedHash;
    }
}