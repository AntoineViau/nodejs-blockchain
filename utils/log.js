let http = require('http');

module.exports = (txt) => {
    console.log(txt);
    let data = { from: global.id, ts: (new Date().getTime()), "log": txt };
    let req = http.request({ host: '127.0.0.1', port: 4001, method: 'POST', headers: { 'Content-Type': 'application/json' } });
    req.on('error', () => { });
    req.write(JSON.stringify(data));
    req.end();
};



