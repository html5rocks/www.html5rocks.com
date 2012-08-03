#!/bin/bash
#
# Compresses the site's JS/CSS and cache busts links before uploading the app
# to App Engine.
# 
# Note: This script should be used in place of using appcfg.py update directly
# to update the application on App Engine.
#
# Copyright 2012 Eric Bidelman <ericbidelman@html5rocks.com>

for arg in $@
do
 if [ $arg = "--release" ] ; then
   versionStr=v`date +%Y%m%d`
   
   git checkout -b $versionStr

   if [ $? -ne 0 ] ; then
     git checkout $versionStr
     git merge master
     git commit -m "merging with master"
   else
     # Change app.yaml version to current date timestamp.
     fl=../app.yaml
     mv $fl $fl.old
     sed "s/version: master/version: $versionStr/g" $fl.old > $fl
     rm -f $fl.old

     # Commit the new release branch.
     git commit -m "Cutting release $versionStr" ../app.yaml
   fi

   git push origin $versionStr
 fi
done

./compress_js_css.sh
# Cache busting is handled by the GAE PageSpeed feature generating unique URLs.
#./cachebust.py
echo \# `date` >> ../cache.appcache
appcfg.py update ../

# Clean up our modified cache busted files and switch back to master.
git checkout ../
git checkout master
