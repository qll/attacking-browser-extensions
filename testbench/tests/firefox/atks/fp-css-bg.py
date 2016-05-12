import os


PATH = '/tmp/fp-css-bg'


def handle(_):
    # persist something on disk so that we remember we were called
    with open(PATH, 'w') as f:
        f.write('1')
    return ''
