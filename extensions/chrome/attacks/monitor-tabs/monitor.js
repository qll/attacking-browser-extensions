function inject(tab) {
    if (!tab.url.startsWith('chrome://')) {
        chrome.tabs.executeScript(tab.id, {
            code: 'document.body.style.background="red"',
            allFrames: true,  // inject into all frames
        });
    }
}


chrome.tabs.onCreated.addListener(inject);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => inject(tab));
chrome.tabs.query({}, tabs => tabs.forEach(inject));  // process active tabs
