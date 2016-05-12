import os


PATH = '/tmp/csp-file-write'


def handle(_):
    if os.path.isfile(PATH):
        os.remove(PATH)  # clean up
        return 'succeedTest()'
    return 'failTest()'
