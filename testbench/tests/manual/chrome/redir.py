import flask


URL = '%s/manual/success.html'


def handle(test_globals):
    url = URL % test_globals['CHROME_APP_URL']
    return flask.redirect(url)
