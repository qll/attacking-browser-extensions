#!/usr/bin/env python3
"""Download extension with specified ID to a PATH"""
import requests
import sys


URL = 'https://clients2.google.com/service/update2/crx?response=redirect&prodversion=38.0&x=id%%3D%(ID)s%%26installsource%%3Dondemand%%26uc'


def download(extid, path):
    req = requests.get(URL % {'ID': extid}, stream=True)
    if req.status_code != 200:
        raise Exception('Status code is %s' % req.status_code)
    with open(path, 'wb') as file:
        for chunk in req:
            file.write(chunk)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: ./%s EXTENSION_ID [PATH]' % sys.argv[0])
        sys.exit(1)
    extid = sys.argv[1]
    path = sys.argv[2] if len(sys.argv) > 2 else '%s.crx' % extid
    download(extid, path)
