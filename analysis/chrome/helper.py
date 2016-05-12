#!/usr/bin/env python3
"""Extract an extension ID from an URL and download it to a predefined path"""
import sys
import os
import download
import re
import subprocess


PATH = 'extensions'


def get_ext_id(url):
    return re.search('[a-z]{32}', url).group(0)


if __name__ == '__main__':
    ext_id = get_ext_id(sys.argv[1])
    file_dir = os.path.join(PATH, ext_id)
    file_path = os.path.join(file_dir, ext_id + '.crx')
    try:
        os.makedirs(file_dir)
    except:
        pass
    download.download(ext_id, file_path)
    os.chdir(file_dir)
    subprocess.call(['unzip', ext_id + '.crx'])
    os.remove(ext_id + '.crx')
