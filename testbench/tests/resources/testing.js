/** General utility for tests and the testBench runner alike. */
const testBench = (function() {
'use strict';


/** Get the path of the directory this file is in.
 *
 * It is not granted to always be the same, since this file could be included
 * from virtually anywhere.
 */
function _getDirPath() {
    const scripts = document.querySelectorAll('script');
    // as we immediately execute, we should always be the last script
    const path = scripts[scripts.length - 1].src;
    const components = path.split('/');
    // rightmost path component is the file name
    return path.slice(0, -1 * components[components.length - 1].length);
}


/** Wait for window.onload since tests should not worry about unfinished DOM. */
function _waitForWindow() {
    return new Promise((resolve, reject) => {
        window.onload = resolve;
    });
}


/** Include all dependencies of the testing framework. */
function include(path) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        script.onload = resolve;
        script.onerror = reject;
        document.documentElement.appendChild(script);
    });
}


/** Retrieve a URL via XMLHttpRequest. */
function retrieve(url) {
    // fetch API sadly cannot load chrome:// resources, thus we use XHR
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.responseText);
            } else {
                reject(Error(req.statusText));
            }
        };
        xhr.onerror = () => reject(Error('Network error'));
        xhr.send();
    });
}


/** Include a JSONP file to collect its data. */
function _includeJSONP(path, funcname) {
    return new Promise((resolve, reject) => {
        window[funcname] = globals => resolve(globals);
        // we actually don't care when the js file is loaded
        include(path);
    });
};


/** Replace globals in DOM elements when asked to. */
function _replaceGlobalsInDOM(globals) {
    globals['OWN_URL'] = location.href;
    const nodes = document.querySelectorAll('*[data-globattr]');
    for (var i = 0; i < nodes.length; i++) {
        var attr = nodes[i].dataset.globattr;
        var value = nodes[i].getAttribute(attr);
        for (var global_key in globals) {
            value = value.replace('$' + global_key, globals[global_key]);
        }
        nodes[i].setAttribute(attr, value);
    };
    return globals;
}


/** Connect to the WebSocket server. */
function connect(globals) {
    return new Promise((resolve, reject) => {
        const socket = io.connect(globals.WEBSOCKET_URL);
        socket.on('connect', () => resolve([socket, globals]));
    });
}


/** Bootstrap the testing framework to enable communication. */
function _bootstrap() {
    const base_dir = _getDirPath();
    const promises = [_waitForWindow(),
                      include(base_dir + 'socket.io-1.4.5.js'),
                      _includeJSONP(base_dir + 'globals.js', 'loadGlobals')];
    return Promise.all(promises)
        .then(results => results[2])
        .then(_replaceGlobalsInDOM);
}


/** Get the unique test identifier from the file name. */
function getUniqueTestID(url) {
    const components = url.split('/');
    const fileName = components[components.length - 1];
    // use a combination of protocol and base file name
    return url.split(':')[0] + ':' + fileName.split('.')[0];
}


/** Add a visual indication of the tests outcome to the page. */
function _notifyVisually(id, success, msg) {
    document.body.style.background = (success) ? 'lightgreen' : 'tomato';
    document.body.textContent = id + ' ' +
                                ((success) ? 'succeeded' : 'failed') + ': ' +
                                msg;
}


/** Notify the WebSocket server about the result of the test. */
function _notify(socket, success, msg) {
    const from_ = location.hash.slice(1) || location.href;
    const id = getUniqueTestID(from_);
    socket.emit('result', {id: id, success: success, msg: msg});
    _notifyVisually(id, success, msg);
}


const init = _bootstrap();


/** Test a function. */
function test(func) {
    init.then(connect).then(args => {
        const socket = args[0];
        const globals = args[1];
        try {
            const result = func(globals);
            if (result.constructor === Array) {
                _notify(socket, result[0], result[1]);
            } else if (result.constructor === Promise) {
                result.then(msg => _notify(socket, true, msg),
                            msg => _notify(socket, false, msg));
            } else {
                _notify(socket, result, 'No message');
            }
        } catch (error) {
            _notify(socket, false, error.toString());
        }
    });
};


// exports
return {
    include: include,
    retrieve: retrieve,
    init: init,
    connect: connect,
    getUniqueTestID: getUniqueTestID,
    test: test
};


})();


// shortcuts
window.test = testBench.test;
