/** Firefox restartless extension boostrap file. */
const {classes: Cc, interfaces: Ci, utils: Cu} = Components;
const extId = 'tests@iceqll.eu';
const extUrl = 'chrome://test/content/index.html';


Cu.import('resource://gre/modules/NetUtil.jsm');
Cu.import('resource://gre/modules/Services.jsm');


function waitForBrowser() {
    // TODO first check if window is already there
    return new Promise((resolve, _) => {
        Services.ww.registerNotification((window, topic) => {
            if (topic !== 'domwindowopened') {
                return
            }
            window.addEventListener('load', function runOnce() {
                window.removeEventListener('load', runOnce, false);
                if (window.gBrowser) {
                    resolve(window.gBrowser);
                }
            }, false);
        });
    });
}


function startup(data, reason) {
    waitForBrowser().then(browser => browser.addTab(extUrl));
}


function shutdown(data, reason) {}
function install(data, reason) {}
function uninstall(data, reason) {}
