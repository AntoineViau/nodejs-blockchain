let Promise = require("bluebird");
let readFile = Promise.promisify(require("fs").readFile);
let writeFile = Promise.promisify(require("fs").writeFile);
let log = require('./utils/log.js');

let _accounts = {
    nbTransactions: 0,
    accounts: []
}

module.exports = {
    loadAccounts: () => {
        log('Load accounts');
        return readFile('./data/' + global.id + '-db.json', 'utf8')
            .then(content => _accounts = JSON.parse(content))
            .catch(() => { });
    },
    saveAccounts: () => {
        log('Save accounts');
        return writeFile('./data/' + global.id + '-trdb.json', JSON.stringify(_accounts), 'utf8');
    },
    getAccounts: () => _accounts
};