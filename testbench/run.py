#!/usr/bin/env python3
"""Testbench accompanying the "Attacking Browser Extensions" thesis.

Will create a new, temporary browser profile and show you a testbench. Tested
only on Linux systems.

Written by Nicolas Golubovic
"""
import argparse
import flask
import flask.ext.socketio as socketio
import importlib
import json
import logging as log
import logging.config
import os
import random
import shutil
import string
import subprocess
import sys
import tempfile
import time


###############################################################################
# constants ###################################################################
###############################################################################
BASE_PATH = os.path.abspath(os.path.dirname(__file__))
TESTS_PATH = os.path.join(BASE_PATH, 'tests')
RUNNER_PATH = os.path.join(BASE_PATH, 'runner')
GLOBALS_PATH = os.path.join(TESTS_PATH, 'resources', 'globals.js')
DOCUMENT_ROOT = TESTS_PATH


FF_BINARY_PATH = '/usr/bin/firefox'
FF_RUNNER_EXTID = 'tests@iceqll.eu'
# data structure found in the extensions.json file in a firefox profile
FF_EXTS_STRUCTURE = {
    'schemaVersion': 17,
    'addons': [{
        'id': 'tests@iceqll.eu',
        'location': 'app-profile',
        'defaultLocale': {},
        'descriptor': RUNNER_PATH,
        'locales': [],
    }]
}


CHROME_BINARY_PATH = '/usr/bin/chromium'
CHROME_RUNNER_EXTID = 'ejnmedbpjaknofjbalnofehlpjimlmna'
CHROME_APP_PATH = os.path.join(RUNNER_PATH, 'chrome-app')
CHROME_EXT_PATH = os.path.join(RUNNER_PATH, 'chrome-ext')
CHROME_APP_EXTID = 'khamcaecjkomfpnimldpibpnfpkocejh'
CHROME_EXT_EXTID = 'kbiehinbllcfpilgcdbeifkjdnlekaec'


###############################################################################
# globals #####################################################################
###############################################################################
_test_globals = {
    'CHROME_TEST_URL': 'chrome-extension://%s/tests' % CHROME_RUNNER_EXTID,
    'CHROME_EXT_URL': 'chrome-extension://%s/tests' % CHROME_EXT_EXTID,
    'CHROME_APP_URL': 'chrome-extension://%s/tests' % CHROME_APP_EXTID,
    'FF_CONTENT_URL': 'chrome://test/content/tests',
    'FF_SKIN_URL': 'chrome://test/skin/tests',
    'FF_LOCALE_URL': 'chrome://test/locale/tests',
    'FF_RESOURCE_URL': 'resource://test/tests',
    'FF_ACCESSIBLE_URL': 'chrome://test-accessible/content/tests',
    'FILE_TEST_URL': 'file://%s' % TESTS_PATH,
}


###############################################################################
# HTTP Server #################################################################
###############################################################################
app = flask.Flask(__name__)
socket = socketio.SocketIO(app)


def _import(path):
    sys_path = sys.path
    sys.path.append(os.path.dirname(path))
    module_name = os.path.basename(path).split('.', 1)[0]
    module = importlib.import_module(module_name)
    module = importlib.reload(module)
    sys.path = sys_path
    return module


def _execute_in_webserver(path):
    module = _import(path)
    if hasattr(module, 'handle'):
        return module.handle(_test_globals)
    else:
        return 'Please define a handle() function in your .py file'


# catch all URLs and serve their files
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if '..' in path or path.startswith('/'):
        flask.abort(400)
    full_path = os.path.join(DOCUMENT_ROOT, path)
    if not os.path.isfile(full_path):
        flask.abort(404)
    if os.path.splitext(path)[1] == '.py':
        return _execute_in_webserver(full_path)
    return flask.send_file(full_path)


@socket.on('result', namespace='/_/notify')
def broadcast_result(data):
    log.debug('Obtained a result: %s' % data)
    socketio.emit('result', data, broadcast=True)


def start_webserver(host, port):
    log.info('Please first close the browser and then this script in order to '
             'ensure the temporary browser profile is cleaned up properly.')
    socket.run(app, host=host, port=port)


###############################################################################
# utility #####################################################################
###############################################################################
class TempDir:
    def __init__(self):
        self.path = tempfile.mkdtemp(prefix='test')

    def __enter__(self):
        return self.path

    def __exit__(self, exc_type, exc_val, exc_tb):
        shutil.rmtree(self.path)


def gen_random_str(length=10):
    return ''.join(random.choice(string.ascii_letters) for _ in range(length))


def execute(*cmd):
    log.debug('Executing: %s', cmd)
    return subprocess.Popen(cmd, stdout=subprocess.DEVNULL,
                            stderr=subprocess.STDOUT)


def update_globals(locals_):
    """Update test globals and write them to a reachable location."""
    _test_globals.update(locals_)
    with open(GLOBALS_PATH, 'w') as globals_file:
        globals_file.write('loadGlobals(%s)' % json.dumps(_test_globals))


###############################################################################
# firefox #####################################################################
###############################################################################
def _start_firefox(binary, profile_path):
    return execute(binary, '--new-instance', '--profile', profile_path)


def _create_firefox_profile(binary, profile_name, profile_path):
    process = execute(binary, '-CreateProfile',
                      '%s %s' % (profile_name, profile_path))
    # firefox will create the profile for us and exit
    process.wait()


def _register_firefox_runner(profile_path):
    with open(os.path.join(profile_path, 'prefs.js'), 'a') as prefs_file:
        data = 'user_pref("xpinstall.signatures.required", false);\n'
        prefs_file.write(data)
    with open(os.path.join(profile_path, 'extensions.json'), 'w') as exts_file:
        json.dump(FF_EXTS_STRUCTURE, exts_file)
    extensions_path = os.path.join(profile_path, 'extensions')
    os.makedirs(extensions_path)
    with open(os.path.join(extensions_path, FF_RUNNER_EXTID), 'w') as ext_file:
        ext_file.write(RUNNER_PATH)


def test_firefox(host, port, binary):
    binary = binary if binary is not None else FF_BINARY_PATH
    profile_name = 'test' + gen_random_str()
    with TempDir() as tmp_path:
        profile_path = os.path.join(tmp_path, profile_name)
        _create_firefox_profile(binary, profile_name, profile_path)
        _register_firefox_runner(profile_path)
        _start_firefox(binary, profile_path)
        try:
            start_webserver(host, port)
        except KeyboardInterrupt:
            log.debug('Stopping after <Ctrl+C>')
        except:
            log.exception('An exception occured')


###############################################################################
# chrome ######################################################################
###############################################################################
def test_chrome(host, port, binary):
    binary = binary if binary is not None else CHROME_BINARY_PATH
    profile_name = 'test' + gen_random_str()
    with TempDir() as tmp_path:
        profile_path = os.path.join(tmp_path, profile_name)
        # create a new profile and load an extension in to it
        process = execute(binary, '--profile-directory=%s' % profile_name,
                          '--user-data-dir=%s' % tmp_path,
                          '--load-extension=%s,%s,%s' % (RUNNER_PATH,
                                                         CHROME_APP_PATH,
                                                         CHROME_EXT_PATH))
        try:
            start_webserver(host, port)
        except KeyboardInterrupt:
            log.debug('Stopping after <Ctrl+C>')
        except:
            log.exception('An exception occured')


###############################################################################
# startup #####################################################################
###############################################################################
def main(host, port, binary, browser):
    update_globals({'BROWSER': browser,
                    'WEB_TEST_URL': 'http://%s:%d' % (host, port),
                    'WEBSOCKET_URL': 'http://%s:%d/_/notify' % (host, port)})
    if browser == 'firefox':
        test_firefox(host, port, binary)
    else:
        test_chrome(host, port, binary)


def _parse_cmdline():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='localhost',
                        help='Host to listen on with the local webserver')
    parser.add_argument('-p', '--port', default=7357, type=int,
                        help='Port to listen on with the local webserver')
    parser.add_argument('-b', '--binary', default=None,
                        help='Specify the path to the binary of FF or Chrome')
    parser.add_argument('-l', '--loglevel', choices=('DEBUG', 'INFO'),
                        default='INFO',
                        help='The desired verbosity of the output')
    parser.add_argument('browser', metavar='BROWSER',
                        choices=('firefox', 'chrome'),
                        help='The browser you want to test')
    return vars(parser.parse_args())


def _setup_logging(loglevel):
    logging.config.dictConfig({
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '%(asctime)s-%(levelname)s: %(message)s',
                'datefmt': '%H:%S',
            },
        },
        'handlers': {
            'default': {
                'level': loglevel,
                'class': 'logging.StreamHandler',
                'formatter': 'standard'
            },
        },
        'loggers': {
            '': {
                'handlers': ['default'],
                'level': loglevel,
                'propagate': True
            }
        }
    })


if __name__ == '__main__':
    args = _parse_cmdline()
    _setup_logging(args.pop('loglevel'))
    main(**args)
