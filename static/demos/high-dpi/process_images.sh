#!/usr/bin/env bash
QUAL_HI=90
QUAL_MID=50
QUAL_LOW=20
ORIG=hq2x.jpg


# Create 2x version.
convert original.jpg -quality $QUAL_HI hq2x.jpg
# Create 1x version.
convert hq2x.jpg -resize 50% hq1x.jpg
# Create compressed versions.
convert hq2x.jpg -quality $QUAL_MID lq2x.jpg
convert hq1x.jpg -quality $QUAL_MID lq1x.jpg
# Create very compressed versions.
convert hq2x.jpg -quality $QUAL_LOW ulq2x.jpg
convert hq1x.jpg -quality $QUAL_LOW ulq1x.jpg
# Crop everything into little samples for clarity.
for img in *1x.jpg
do
  convert $img -crop 160x120+0+0 preview/$img;
done
for img in *2x.jpg
do
  convert $img -crop 320x240+0+0 preview/$img;
done
# Tile into a preview.
montage -label '%f, %b -- quality: %Q' preview/*x.jpg -shadow -border 5 -geometry 320x240+5+5 preview/tile.jpg
