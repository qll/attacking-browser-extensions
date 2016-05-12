/*
function write_file(name, content, type) {
    const errorHandler = () => { alert('error'); };
    window.requestFileSystem = window.webkitRequestFileSystem;
    window.requestFileSystem(type, 5 * 1024 * 1024, fs => {
        fs.root.getFile(name, {create: true}, fileEntry => {
            fileEntry.createWriter(fileWriter => {
                fileWriter.onwriteend = function(e) {
                    console.log('File written');
                    console.log(fileEntry.toURL());
                    document.querySelector('iframe').src = fileEntry.toURL();
                };
                fileWriter.onerror = errorHandler;
                const blob = new Blob([content], {type: 'text/plain'});
                fileWriter.write(blob);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}

write_file('test.html', '<script>top.console.log("fooba")</script>', window.TEMPORARY);
document.querySelector('#location').textContent = location.href;
*/

//document.querySelector('div').innerHTML = chrome.desktopCapture;

// var blob = new Blob(['<iframe src="chrome-extension://banllaanemancieokcafchngfebhodga/window/foo.html"></iframe><script>setTimeout(() => { var iframe=document.querySelector("iframe");document.write(iframe.contentWindow.chrome.storage); },1000)</script>'], {type: 'text/html'});
// var url = URL.createObjectURL(blob);
// var iframe = document.querySelector('#foo');
// iframe.setAttribute('src', url);
