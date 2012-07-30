#!/bin/bash
#
# Resizing images that need resizing
#
# Copyright 2011 Paul Irish

AVATARDIR='../static/images/profiles'
IMG_EXT=png


for i in $AVATARDIR/*.$IMG_EXT; do
  # sips --resampleWidth 64 myimage.png --out myimage-resized.png

  filename=`basename $i`
  name=`basename ${filename%%.*}`
  ext=`basename ${filename##*.}`
  dir=`dirname $i`

  # sips is so cranky with its out folder so we do it and move it.
  sips --resampleWidth 75 $i --out $name.75.$ext
  # also sips fails so we have the original file fallback
  cp $i $dir/75/$name.75.$ext
  # now move that new compiled file
  mv ./$name.75.$ext  $dir/75/
done
