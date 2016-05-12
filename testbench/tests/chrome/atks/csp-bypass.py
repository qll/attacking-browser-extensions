import flask


BODY = '''
<script src="%s"></script>
<button ng-app ng-csp ng-click="$event.view.success()">1.1.5 bypass</button>
<script src="../../resources/testing.js"></script>
<script src="csp-bypass.js"></script>
'''


def handle(test_globals):
    url = '%s/../angular.min.js' % test_globals['CHROME_EXT_URL']
    response = flask.make_response(BODY % url)
    policy = "script-src 'self'"
    response.headers['Content-Security-Policy'] = policy
    return response
