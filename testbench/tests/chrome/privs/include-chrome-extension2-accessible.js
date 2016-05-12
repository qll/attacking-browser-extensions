test(globals => {
    const url = globals.CHROME_EXT_URL + '/chrome/privs/include-chrome-extension2-accessible-file.js';
    return testBench.include(url);
});