/** Implement chrome-specific functions and load tests. */
window.chromeHandler = (function() {
'use strict';


function createTab(url) {
    return new Promise(resolve => {
        chrome.tabs.create({url: url, active: false}, tab => resolve(tab.id));
    });
}


function closeTab(id) {
    chrome.tabs.remove(id);
}


/** Fix file:// links since they are not clickable from extensions. */
function fixDOM() {
    const nodes = document.querySelectorAll('.test > a');
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].href.startsWith('file:')) {
            nodes[i].onclick = event => {
                event.preventDefault();
                chrome.tabs.create({url: nodes[i].href});
            };
        }
    }
}


function _createPrivTests(base_url, name, invertList) {
    invertList = invertList || [];
    const _addTest = function(url, title) {
        const id = testBench.getUniqueTestID(base_url + url);
        const invert = invertList.indexOf(id.split(':')[1]) > -1;
        return {
            url: base_url + url,
            title: name + ': ' + (invert ? 'Blocked: ' : 'Allowed: ' ) + title,
            invert: invert,
        };
    };
    return [
        _addTest('/sanity.html', 'Test-Framework works as intended'),
        _addTest('/chrome/privs/include-chrome-extension.html',
                 'Include non-web-accessible chrome-extension URI'),
        _addTest('/chrome/privs/include-chrome-extension2.html',
                 'Include non-web-accessible chrome-extension URI of Extension 2'),
        _addTest('/chrome/privs/include-chrome-extension2-accessible.html',
                 'Include web-accessible chrome-extension URI of Extension 2'),
        _addTest('/chrome/privs/include-file.html', 'Include file URI'),
        _addTest('/chrome/privs/iframe-chrome-extension.html',
                 'Iframe non-web-accessible chrome-extension URI'),
        _addTest('/chrome/privs/iframe-file.html', 'Iframe file URI'),
    ];
}


function getTests(globals) {
    let tests = [
        {
            url: globals.WEB_TEST_URL + '/chrome/atks/redirect-to-extension.py',
            title: 'Attack: Redirect to Extension chrome-extension:// URL'
        },
        {
            url: globals.WEB_TEST_URL + '/chrome/atks/csp-bypass.py',
            title: 'Attack: Bypass CSP by using old AngularJS on ' + 
                   'chrome-extension:// URL'
        },
        {
            url: globals.CHROME_TEST_URL + '/chrome/atks/filesystem-escape.html',
            title: 'Attack: filesystem-URIs can access extension windows and ' +
                   'are not hampered by CSP'
        },
    ];
    tests = tests.concat(_createPrivTests(
        globals.CHROME_TEST_URL,
        'Extension',
        [
            'include-file',
            'include-chrome-extension2',
            'iframe-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.WEB_TEST_URL,
        'Web Content',
        [
            'include-file',
            'include-chrome-extension',
            'include-chrome-extension2',
            'iframe-chrome-extension',
            'iframe-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.FILE_TEST_URL,
        'Files',
        [
            'include-chrome-extension',
            'include-chrome-extension2',
            'iframe-chrome-extension',
        ]
    ));
    return tests;
}


// exports
return {
    createTab: createTab,
    closeTab: closeTab,
    getTests: getTests,
    oncreate: fixDOM,
};


})();
