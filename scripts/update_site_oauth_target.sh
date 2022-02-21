#!/bin/bash
#
# Compresses the site's JS/CSS and cache busts links before uploading the app
# to App Engine.
# 
# Note: This script should be used in place of using appcfg.py update directly
# to update the application on App Engine.
#
# Copyright 2012 Eric Bidelman <ericbidelman@html5rocks.com>

versionStr=${1:-master}

./combine_css_files.sh
./compress_js_css.sh

appcfg.py --oauth2 --version=$versionStr update ../

