chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    document.querySelector('#output').innerHTML = request.text;
    sendResponse({foo: 'worked'});
});