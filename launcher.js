var spawn = require('child_process').spawn;


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
(new Array(3)).fill(null).map((val, index) => {
    setTimeout(() => launch(index + 1), Math.floor(Math.random() * 5000))
});
