import flask


PATH = '/tmp/csp-file-write'


def handle(_):
    response = flask.make_response('<script>violate</script>')
    policy = "script-src 'self'; report-uri file://%s" % PATH
    response.headers['Content-Security-Policy'] = policy
    return response
