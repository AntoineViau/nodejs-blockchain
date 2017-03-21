let request = require('./utils/request.js');
let crypto = require('./keys.js');

let fromId = process.argv[2];
let toId = process.argv[3];
let amount = process.argv[4];
let privateKey = parseInt(process.argv[5]);

let message = { operation: 'transaction', fromId, toId, amount };
let messageStr = JSON.stringify(message);
crypto.crypt(messageStr, privateKey)
    .then(signature => request.send({ id: fromId }, { operation: 'transaction', fromId, toId, amount, signature }))
    .then(response => console.log(response));
    
