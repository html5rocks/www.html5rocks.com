#!/bin/bash
#
# Runs YUI Compressor on the css and js of the entire site.
#
# Copyright 2011 Eric Bidelman <ericbidelman@chromium.org>

CSS_EXT=css
JS_EXT=js
CSSDIR='../static/css'
JSDIR='../static/js'

YUI_COMPRESSOR=yuicompressor-2.4.7.jar

JS_FILES=("${JSDIR}/app.${JS_EXT}" "${JSDIR}/profiles.${JS_EXT}"
          "${JSDIR}/prettify.${JS_EXT}" "${JSDIR}/feature.${JS_EXT}"
          "${JSDIR}/boom/asteroids.${JS_EXT}" "${JSDIR}/tutsapp.${JS_EXT}"
          "${JSDIR}/3rdpartyinit.${JS_EXT}" "${JSDIR}/search.${JS_EXT}"
          "${JSDIR}/persona.${JS_EXT}"
          "${JSDIR}/slidesapp.${JS_EXT}" "${JSDIR}/parseuri.${JS_EXT}"
          "${JSDIR}/slides-polyfills.${JS_EXT}" "${JSDIR}/handlebars-1.${JS_EXT}")

#if [[ "$1" == "" ]]; then
#  echo 'Usage '$0' <inputfile.js|css>' >&2
#  exit
#fi

# Remove existing *.min.css files.
rm ${CSSDIR}/*.min.$CSS_EXT

for i in $CSSDIR/*.$CSS_EXT; do
  # $1=./path/to/file.css -> filename=file.css, name=file, ext=css, dir=./path/to
  filename=`basename $i`
  name=`basename ${filename%%.*}`
  ext=`basename ${filename##*.}`
  dir=`dirname $i`
  java -jar ${YUI_COMPRESSOR} $i -o $dir/$name.min.$ext
done

for i in ${JS_FILES[*]}; do
  filename=`basename $i`
  name=`basename ${filename%%.*}`
  ext=`basename ${filename##*.}`
  dir=`dirname $i`
  java -jar ${YUI_COMPRESSOR} $i -o $dir/$name.min.$ext
done
