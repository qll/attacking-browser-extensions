import os


PATH = '/tmp/fp-css-bg'


def handle(_):
    if os.path.isfile(PATH):
        os.remove(PATH)  # clean up
        return 'failTest()'
    return 'succeedTest()'
