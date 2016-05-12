document.querySelector('#fs').onsubmit = event => {
    event.preventDefault();
    const code = document.querySelector('#fs-text').value;
    const errorHandler = () => { alert('error'); };
    window.requestFileSystem = window.webkitRequestFileSystem;
    window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, fs => {
        fs.root.getFile('xss.html', {create: true}, fileEntry => {
            fileEntry.createWriter(fileWriter => {
                fileWriter.onwriteend = function(e) {
                    const iframe = document.querySelector('iframe');
                    iframe.style.display = 'block';
                    iframe.src = fileEntry.toURL();
                };
                fileWriter.onerror = errorHandler;
                const blob = new Blob([code], {type: 'text/plain'});
                fileWriter.write(blob);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
};


document.querySelector('#here').onsubmit = event => {
    event.preventDefault();
    const text = document.querySelector('#here-text').value;
    document.querySelector('#output').innerHTML = text;
};
document.querySelector('#bg').onsubmit = event => {
    event.preventDefault();
    const text = document.querySelector('#bg-text').value;
    chrome.runtime.sendMessage({text: text}, response => {
        // foo
    });
};


document.querySelector('#pac').onclick = () => {
    var pacObject = {
        mode: 'pac_script',
        pacScript: {
            url: "http://localhost:8000/test.pac"
        }
    };
    chrome.proxy.settings.set({
        value: pacObject,
        scope: 'regular'
    }, function() {
        alert('proxy set');
    });
};


document.querySelector('#blob').onsubmit = (event) => {
    event.preventDefault();
    var blob = new Blob([document.querySelector('#blob-text').value], {type: 'text/html'});
    var url = URL.createObjectURL(blob);
    var iframe = document.querySelector('iframe');
    iframe.src = url;
    iframe.style.display = 'block';
};
