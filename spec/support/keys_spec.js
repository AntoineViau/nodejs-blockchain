var crypt = require('../../keys.js');

describe("My own cryto lib", () => {

    it("generates added keys", () => {
        let keys = crypt.generateKeys();
        expect((keys.priv + keys.pub) === 256).toBe(true);
    });

    it("crypt and uncrypt properly", () => {
        let keys = crypt.generateKeys();
        let clear = 'coucou fait le coucou';
        let crypted = crypt.crypt(clear, keys.pub);
        expect(crypted).toBeTruthy();
        let uncrypted = crypt.uncrypt(crypted, keys.priv);
        expect(uncrypted).toBe(clear);
    });

    it("crypt and uncrypt both ways", () => {
        let keys = crypt.generateKeys();
        let clear = 'coucou fait le coucou';
        let crypted = crypt.crypt(clear, keys.priv);
        expect(crypted).toBeTruthy();
        let uncrypted = crypt.uncrypt(crypted, keys.pub);
        expect(uncrypted).toBe(clear);
    });
});