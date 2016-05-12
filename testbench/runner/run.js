(function() {
'use strict';


const TEST_TIMEOUT = 2000;


/** Build a counter in a node. */
function _buildNodeCounter(id) {
    const node = document.querySelector(id);
    var counter = 0;
    return offset => {
        counter += offset;
        node.textContent = counter;
    };
}
const _updateFinished = _buildNodeCounter('#finished');
const _updateTotal = _buildNodeCounter('#total');


function _createTestNode(url, title) {
    const testNode = document.createElement('div');
    testNode.className = 'test';
    const titleNode = document.createElement('a');
    titleNode.href = url;
    titleNode.target = '_blank';
    titleNode.textContent = title;
    testNode.appendChild(titleNode);
    document.querySelector('main').appendChild(testNode);
    _updateTotal(1);
    return testNode;
}


function _updateTestNode(node, msg, success) {
    node.title = msg;
    node.className = 'test ' + ((success) ? 'positive' : 'negative');
    _updateFinished(1);
}


function _waitForResult(id, socket) {
    return new Promise(resolve => {
        const timeout_data = {success: false, msg: 'Timeout'};
        const timeout = setTimeout(() => resolve(timeout_data), TEST_TIMEOUT);
        const _checkResult = data => {
            if (id !== data.id) {
                console.warn('Received out-of-order response from ' + data.id +
                             ' with status ' + data.success + ' and message ' +
                             data.msg);
                return;
            }
            clearTimeout(timeout);
            socket.removeListener('result', _checkResult);
            resolve(data);
        };
        socket.on('result', _checkResult);
    });
}


/** Start a test. Handle cleaning up after the test is done, too. */
function _startTest(handler, socket, url) {
    const id = testBench.getUniqueTestID(url);
    console.debug('Starting ' + id);
    const wait_for_result = _waitForResult(id, socket);
    const tab_creation = handler.createTab(url);
    wait_for_result.then(() => tab_creation.then(tab => handler.closeTab(tab)));
    return wait_for_result;
}


// startup
testBench.init.then(testBench.connect).then(args => {
    const socket = args[0];
    const globals = args[1];
    testBench.include(globals.BROWSER + '.js').then(() => {
        const handler = window[globals.BROWSER + 'Handler'];
        const tests = handler.getTests(globals);
        var testSequence = new Promise(resolve => resolve());
        tests.forEach(test => {
            const node = _createTestNode(test.url, test.title);
            testSequence = testSequence.then(() => {
                return _startTest(handler, socket, test.url).then(data => {
                    const success = test.invert ? !data.success : data.success;
                    _updateTestNode(node, data.msg, success);
                });
            });
        });
        if ('oncreate' in handler) {
            handler.oncreate();
        }
    });
});


})();
