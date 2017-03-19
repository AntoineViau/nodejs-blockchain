var spawn = require('child_process').spawn;

let nbPeers = process.argv[2] || (!console.error('Need nb peers') && process.exit(1));
console.log('Starting ' + nbPeers + ' peers');

function launch(id) {
    let prc = spawn('node', ['peer.js', id]);
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join("").trim());
    });
    prc.on('close', function (code) {
        console.log('process exit code ' + code);
    });
}

launch(0);
(new Array(nbPeers - 1)).fill(null).reduce((prev, cur, index) => {
    let delay = prev + Math.floor(1000 + Math.random() * 1000);
    setTimeout(() => launch(index + 1), delay);
    return delay;
}, 0);
