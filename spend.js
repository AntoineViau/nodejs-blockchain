let request = require('./utils/request.js');
let crypto = require('./keys.js');

let message = {
    operation: 'transaction',
    fromId: process.argv[2],
    toId: process.argv[3],
    amount: parseInt(process.argv[4])
};
let privateKey = parseInt(process.argv[5]);


crypto.crypt(JSON.stringify(message), privateKey)
    .then(signature => {
        let body = Object.assign({}, message, {signature});

        console.log(body);
        request.send({ id: message.fromId }, body);
    })
    .then(response => console.log('Response: ',response));

