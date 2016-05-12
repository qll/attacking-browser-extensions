#!/usr/bin/env python3
"""Usage: ./install.py web|local path/to/extension

Either starts a web server for remote install or installs locally.
"""
import hashlib
import http.server
import json
import os
import re
import sys
import tempfile
import xml.etree.ElementTree
import zipfile


HOST = '0.0.0.0'
PORT = 8000


class Extension():
    def __init__(self, path):
        self.path = os.path.abspath(path)

        tree = xml.etree.ElementTree.parse(os.path.join(path, 'install.rdf'))
        namespace = {'em': 'http://www.mozilla.org/2004/em-rdf#'}
        self.id = tree.findtext('.//em:id', namespaces=namespace)
        type = tree.findtext('.//em:type', namespaces=namespace)
        if type == 4:
            self.type = 'theme'
        else:
            # TODO: find out about other types
            self.type = 'unknown'


class SdkExtension(Extension):
    def __init__(self, path):
        self.path = os.path.abspath(path)
        with open(os.path.join(path, 'package.json')) as package:
            info = json.load(package)
        self.id = info['name'] + '@iceqll.eu'
        self.type = 'add-on-sdk'


class ExtensionInstallHandler(http.server.BaseHTTPRequestHandler):
    zip_file = None
    zip_hash = None

    def read_template(self, name, vars={}):
        root_path = os.path.abspath(os.path.dirname(__file__))
        with open(os.path.join(root_path, 'install_templates', name)) as tfile:
            template = tfile.read()
        for key, value in vars.items():
            template = template.replace('{{{{ {} }}}}'.format(key), value)
        return template.encode()

    def build_response(self, body, headers={}, status_code=200):
        finalized_headers = {
            'Content-Type': 'text/html; charset=UTF-8'
        }
        finalized_headers.update(headers)
        self.send_response(status_code)
        for header, value in finalized_headers.items():
            self.send_header(header, value)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/install':
            xpiheaders = {'Content-Type': 'application/x-xpinstall'}
            with open(self.zip_file, 'rb') as zip_file:
                self.build_response(zip_file.read(), headers=xpiheaders)
        else:
            self.build_response(self.read_template('extension.html',
                                {'XPIHASH': self.zip_hash}))


def hash_file(path):
    hasher = hashlib.sha1()
    with open(path, 'rb') as hashfile:
        buf = hashfile.read(1)
        while buf:
            hasher.update(buf)
            buf = hashfile.read(1)
    return hasher.hexdigest()


def read_extension(path):
    if not os.path.isdir(path):
        return None
    root_files = os.listdir(path)
    if 'package.json' in root_files:
        return SdkExtension(path)
    if 'install.rdf' in root_files:
        return Extension(path)
    return None


def choose(options):
    print('\n'.join('{}: {}'.format(i + 1, option)
                    for i, option in enumerate(options)))
    choice = int(input('Your choice (1-{}): '.format(len(options))))
    if choice < 1 or choice > len(options):
        print('Error: Illegal choice ({})'.format(choice))
        sys.exit(5)
    return choice - 1


def install_local(path, extension):
    if extension.type == 'add-on-sdk':
        print('Error: Try jpm for add-on SDK extensions')
        sys.exit(4)

    moz_path = os.path.expanduser('~/.mozilla/firefox')
    if not os.path.isdir(moz_path):
        print('Error: Could not find local Firefox profile dir')
        sys.exit(3)

    def is_profile(entry):
        return os.path.isdir(os.path.join(moz_path, entry)) and '.' in entry

    def label_profile(entry):
        return entry.split('.')[1]

    profiles = [entry for entry in os.listdir(moz_path) if is_profile(entry)]
    if len(profiles) == 0:
        print('Error: No Firefox profiles found')
        sys.exit(4)
    if len(profiles) > 1:
        print('Please choose between these profiles:')
        choice = choose(list(map(label_profile, profiles)))
        profile = profiles[choice]
    else:
        profile = profiles[0]

    extensions_path = os.path.join(moz_path, profile, 'extensions')
    if not os.path.isdir(extensions_path):
        os.makedirs(extensions_path)

    extension_path = os.path.join(extensions_path, extension.id)
    with open(extension_path, 'w') as extension_file:
        extension_file.write(extension.path)


def zip_dir(path, zip_path):
    with zipfile.ZipFile(zip_path, 'w') as zip_file:
        for root, dirs, files in os.walk(path):
            for file in files:
                zip_file.write(os.path.join(root, file))


def install_web(path, extension):
    current_dir = os.path.abspath(os.getcwd())
    os.chdir(extension.path)
    random_file = tempfile.NamedTemporaryFile()
    zip_dir('.', random_file.name)
    ExtensionInstallHandler.zip_file = random_file.name
    ExtensionInstallHandler.zip_hash = hash_file(random_file.name)
    os.chdir(current_dir)

    httpd = http.server.HTTPServer((HOST, PORT), ExtensionInstallHandler)
    print('Starting server at {}:{}'.format(HOST, PORT))
    print('Stop with Ctrl+C')
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()


if __name__ == '__main__':
    if len(sys.argv) < 3 or sys.argv[1] not in ('web', 'local'):
        print(__doc__)
        sys.exit(1)
    mode = sys.argv[1]
    path = sys.argv[2]
    extension = read_extension(path)
    if extension is None:
        print("Error: Given path (%s) is not an extensions' root path" % path)
        sys.exit(2)
    if mode == 'local':
        install_local(path, extension)
    else:
        install_web(path, extension)
