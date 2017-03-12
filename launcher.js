var spawn = require('child_process').spawn;

var prcs = (new Array(3)).fill(null).map((prc, index) => spawn('node', ['node.js', index]));

prcs.forEach(prc => {
    prc.stdout.setEncoding('utf8');
    prc.stdout.on('data', function (data) {
        var str = data.toString()
        var lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    prc.on('close', function (code) {
        console.log('process exit code ' + code);
    });
});


