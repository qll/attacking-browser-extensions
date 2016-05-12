test(globals => {
    const url = globals.CHROME_TEST_URL + '/chrome/privs/include-me.js';
    return testBench.include(url);
});