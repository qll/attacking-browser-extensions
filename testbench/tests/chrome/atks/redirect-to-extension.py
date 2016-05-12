import flask


URL = '%s/chrome/atks/redirect-to-extension.html'


def handle(test_globals):
    url = (URL % test_globals['CHROME_TEST_URL'] + '#' +
           URL % test_globals['WEB_TEST_URL'])
    return flask.redirect(url)
