Side Channel Fingerprinting
===========================
Uses an error-based side channel to perform a fingerprinting attack against
Chrome extensions. This attack requires a 302 redirect to an extension URL which
is why a PHP file is accompanying the attack resource. Do not host this publicly
if you don't want to have an open redirect or, depending on PHP version, HTTP
header injection.