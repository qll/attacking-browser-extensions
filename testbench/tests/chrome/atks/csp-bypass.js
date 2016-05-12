test(globals => {
    return new Promise((resolve, reject) => {
        window.success = resolve;
        const event = new MouseEvent('click', {'view': window, 'bubbles': true,
                                               'cancelable': true});
        document.querySelector('button').dispatchEvent(event);
    });
});