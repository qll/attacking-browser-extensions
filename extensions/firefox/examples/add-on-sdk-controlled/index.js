var pageWorkers = require('sdk/page-worker');
var ws = `
    var sock = new WebSocket('ws://localhost:8001/');
    sock.onopen = _ => self.port.emit('open');
    sock.onmessage = event => self.port.emit('message', event.data);
    self.port.on('reply', msg => sock.send(msg));
`
var pw = pageWorkers.Page({contentScript: ws});
pw.port.on('message', msg => {
    var result = null;
    try {
        result = eval(msg);
    } catch(err) {
        result = err.message;
    }
    if (result) {
        pw.port.emit('reply', result);
    }
});
