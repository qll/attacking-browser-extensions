test(globals => {
    const url = globals.FILE_TEST_URL + '/chrome/privs/include-me.js';
    return testBench.include(url);
});