/** Implement firefox-specific functions and load tests. */
window.firefoxHandler = (function() {
'use strict';


const require_uri = 'resource://gre/modules/commonjs/toolkit/require.js';
const { require } = Components.utils.import(require_uri, {});
const tabs = require('sdk/tabs');


function createTab(url) {
    return new Promise(resolve => {
        tabs.open({
            url: url,
            inBackground: true,
            onOpen: tab => resolve(tab)
        });
    });
}


function closeTab(tab) {
    tab.close();
}


function _createPrivTests(base_url, name, invert_list) {
    invert_list = invert_list || [];
    const _addTest = function(url, title) {
        const id = testBench.getUniqueTestID(base_url + url);
        const invert = invert_list.indexOf(id.split(':')[1]) > -1;
        return {
            url: base_url + url,
            title: name + ': ' + (invert ? 'Blocked: ' : 'Allowed: ' ) + title,
            invert: invert,
        };
    };
    return [
        _addTest('/sanity.html', 'Working Test-Framework (Self-Check)'),
        _addTest('/firefox/privs/xul.xul', 'Render XUL'),
        _addTest('/firefox/privs/xbl.html', 'Execute scripts from XBL'),
        _addTest('/firefox/privs/access-privileged-apis.html',
                 'Access privileged APIs'),
        _addTest('/firefox/privs/redirect-content.html',
                 'Redirect to chrome://test/content/*'),
        _addTest('/firefox/privs/iframe-content.html',
                 'Iframe chrome://test/content/*'),
        _addTest('/firefox/privs/iframe-file.html', 'Iframe file:///*'),
        _addTest('/firefox/privs/include-content.html',
                 'Include chrome://test/content/*'),
        _addTest('/firefox/privs/include-resource.html',
                 'Include resource://test/*'),
        _addTest('/firefox/privs/include-file.html', 'Include file:///*'),
        _addTest('/firefox/privs/xhr-content.html',
                 'Receive XHR response from chrome://test/content/*'),
        _addTest('/firefox/privs/xhr-resource.html',
                 'Receive XHR response from resource://test/*'),
        _addTest('/firefox/privs/xhr-file.html',
                 'Receive XHR response from file:///*'),
        _addTest('/firefox/privs/moz-icon.html', 'Embed moz-icon://*'),
    ];
}


function getTests(globals) {
    var tests = [
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/fp-onload.html',
            title: 'Fingerprinting: Via onload: chrome://*/content/* with ' +
                   'contentaccessible=yes',
        },
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/fp-onload-resource.html',
            title: 'Fingerprinting: Via onload: resource://*',
        },
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/fp-objleak.html',
            title: 'Fingerprinting: Via object leak: chrome://*/content/* ' +
                   'with contentaccessible=yes',
        },
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/fp-objleak.html',
            title: 'Fingerprinting: Via object leak: resource://*'
        },
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/fp-css-bg.html',
            title: 'Fingerprinting: Via CSS background'
        },
        {
            url: globals.WEB_TEST_URL + '/firefox/atks/csp-file-write.html',
            title: 'Browser Bug: File write via CSP report-uri'
        },
    ];
    tests = tests.concat(_createPrivTests(
        globals.FF_CONTENT_URL,
        'chrome://test/content/*'
    ));
    tests = tests.concat(_createPrivTests(
        globals.FF_SKIN_URL,
        'chrome://test/skin/*',
        [
            'xul',
            'xbl',
            'access-privileged-apis',
            'xhr-resource',
            'xhr-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.FF_LOCALE_URL,
        'chrome://test/locale/*',
        [
            'xul',
            'xbl',
            'access-privileged-apis',
            'xhr-resource',
            'xhr-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.FF_RESOURCE_URL,
        'resource://test/*',
        [
            'xul',
            'xbl',
            'access-privileged-apis',
            'redirect-content',
            'iframe-content',
            'iframe-file',
            'include-file',
            'xhr-content',
            'xhr-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.FILE_TEST_URL,
        'file:///*',
        [
            'xul',
            'xbl',
            'access-privileged-apis',
            'redirect-content',
            'iframe-content',
            'include-content',
            'xhr-content',
            'xhr-resource',
            'xhr-file',
        ]
    ));
    tests = tests.concat(_createPrivTests(
        globals.WEB_TEST_URL,
        'https?://*',
        [
            'xul',
            'xbl',
            'access-privileged-apis',
            'redirect-content',
            'iframe-content',
            'iframe-file',
            'include-content',
            'include-file',
            'xhr-content',
            'xhr-resource',
            'xhr-file',
        ]
    ));
    return tests;
}


// kill all tabs but the runner
for (var tab of tabs) {
    if (!tab.url.startsWith('chrome://test')) {
        tab.close();
    }
}


// exports
return {
    createTab: createTab,
    closeTab: closeTab,
    getTests: getTests,
};


})();
