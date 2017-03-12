module.exports = (txt) => {
    console.log(txt);
    return;
    let data = { from: global.nodeId, ts: (new Date().getTime()), "log": txt };
    let req = http.request(
        { host: '127.0.0.1', port: '2501', method: 'POST', headers: { 'Content-Type': 'application/json' } });
    req.write(JSON.stringify(data));
    req.end();
};



