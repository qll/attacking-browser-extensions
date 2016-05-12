test(globals => {
    return new Promise((resolve, reject) => {
        const code = '<script>top.success()</script>';
        window.success = resolve;
        window.requestFileSystem = window.requestFileSystem ||
                                   window.webkitRequestFileSystem;
        window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, fs => {
            fs.root.getFile('xss.html', {create: true}, fileEntry => {
                fileEntry.createWriter(fileWriter => {
                    fileWriter.onwriteend = () => {
                        const iframe = document.createElement('iframe');
                        iframe.src = fileEntry.toURL();
                        document.body.appendChild(iframe);
                    };
                    fileWriter.onerror = reject;
                    const blob = new Blob([code], {type: 'text/plain'});
                    fileWriter.write(blob);
                }, reject);
            }, reject);
        }, reject);
    });
});
