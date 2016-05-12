test(globals => {
    const url = globals.CHROME_EXT_URL + '/chrome/privs/include-me.js';
    return testBench.include(url);
});