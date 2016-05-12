#!/usr/bin/env python3
"""Given a starting URI this script will download all addons to a directory

Example: ./download-all.py complete-themes

This will download all Themes from complete-themes
"""
import bs4
import os
import re
import requests
import urllib.request
import urllib.error
import sys


BASE_URI = 'https://addons.mozilla.org'
CATEGORY_URI = BASE_URI + '/de/firefox/%s/'


def get(uri):
    return bs4.BeautifulSoup(requests.get(uri, stream=True).raw, 'html.parser')


def unique(iterable, key=None):
    if key is None:
        key = lambda item: item
    seen = set()
    return (i for i in iterable if not (key(i) in seen or seen.add(key(i))))


def download_all(local_path, category):
    get_name = lambda addon: addon.parent.parent['data-name']
    uri = CATEGORY_URI % category
    uri = 'https://addons.mozilla.org/de/firefox/extensions/shopping/?sort=popular'
    front_page = get(uri)
    pages = int(front_page.find_all(class_='jump')[-1]['href'].split('=')[-1])
    for page_num in range(1, pages + 1):
        page_uri = '%s&page=%d' % (uri, page_num)
        addon_page = get(page_uri)
        print('New page: %s' % page_uri)
        for addon in unique(addon_page.find_all(class_='download'), get_name):
            download_uri = addon['href']
            clean_name = re.sub('[^\w]', '_', get_name(addon)) + '.xpi'
            download_path = os.path.join(local_path, clean_name)
            if not os.path.isfile(download_path):
                print('Downloading %s' % clean_name)
                try:
                    urllib.request.urlretrieve(BASE_URI + download_uri, download_path)
                except urllib.error.HTTPError as error:
                    print(error)
                    print('Problem with: %s' % download_uri)


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print('Error: You have to give me a extension category.')
        print(__doc__)
        sys.exit(1)
    category = sys.argv[1]
    category = 'shopping'
    if not os.path.isdir(category):
        print('Creating ./%s' % category)
        os.mkdir(category)
    print('Downloading all files to ./%s' % category)
    download_all(category, category)
    print('Done')
