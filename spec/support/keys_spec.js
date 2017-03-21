var crypt = require('../../keys.js');

describe("My own crypto lib", () => {

    it("generates added keys", (done) => {
        crypt.generateKeys(1)
            .then(keys => {
                expect((keys.priv + keys.pub) === 256).toBe(true);
            })
            .finally(done);
    });

    it("crypt with public key and uncrypt with private key", (done) => {
        let clear = 'coucou fait le coucou';
        let _keys;
        crypt.generateKeys(1)
            .then(keys => {
                _keys = keys;
                return crypt.crypt(clear, keys.pub);
            })
            .then(crypted => {
                expect(crypted).toBeTruthy()
                return crypt.uncrypt(crypted, _keys.priv);
            })
            .then(uncrypted => {
                console.log('uncrypted', uncrypted);
                expect(uncrypted).toBe(clear)
            })
            .catch((msg) => console.log(msg))
            .finally(done);
    });

    it("crypt with private key and uncrypt with public key", (done) => {
        let clear = 'coucou fait le coucou';
        crypt.generateKeys(1)
            .then(keys => {
                return crypt.crypt(clear, keys.priv);
            })
            .then(crypted => {
                expect(crypted).toBeTruthy()
                return crypt.uncrypt(crypted, keys.pub);
            })
            .then(uncrypted => {
                expect(uncrypted).toBe(clear)
            })
            .finally(done);
    });

    it("hash to the same value", (done) => {
        let clear = 'coucou fait le coucou';
        let _hash;
        crypt.hash(clear)
            .then(hash => {
                _hash = hash;
            })
            .then(() => {
                return crypt.hash(clear);
            })
            .then(hash2 => {
                expect(hash2 === _hash).toBe(true)
            })
            .finally(done);
    });

    it("hash to a different value", (done) => {
        let clear = 'coucou fait le coucou';
        let _hash;
        crypt.hash(clear)
            .then(hash => {
                _hash = hash;
            })
            .then(() => {
                return crypt.hash(clear+' ');
            })
            .then(hash2 => {
                expect(hash2 === _hash).toBe(false)
            })
            .finally(done);
    });
});