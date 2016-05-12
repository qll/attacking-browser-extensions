function write_file(name, content, type) {
    const errorHandler = () => { alert('error'); };
    window.requestFileSystem = window.webkitRequestFileSystem;
    window.requestFileSystem(type, 5 * 1024 * 1024, fs => {
        fs.root.getFile(name, {create: true}, fileEntry => {
            fileEntry.createWriter(fileWriter => {
                fileWriter.onwriteend = function(e) {
                    console.log('File written');
                    console.log(fileEntry.toURL());
                };
                fileWriter.onerror = errorHandler;
                const blob = new Blob([content], {type: 'text/plain'});
                fileWriter.write(blob);
            }, errorHandler);
        }, errorHandler);
    }, errorHandler);
}


document.forms[0].onsubmit = event => {
    event.preventDefault();
    const name = event.target.name.value;
    const content = event.target.content.value;

    // write_file(name, content, window.TEMPORARY);
    window.webkitStorageInfo.requestQuota(PERSISTENT, 5 * 1024 * 1024, () => {
        write_file(name, content, PERSISTENT);
    }, () => { alert('error'); });
};