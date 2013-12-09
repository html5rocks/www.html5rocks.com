#!/bin/bash
#
# Combines CSS files for articles

cat ../static/css/v2-base.css > ../static/css/v2-combined.css
cat ../static/css/v2-article.css >> ../static/css/v2-combined.css
cat ../static/css/v2-tutorials.css >> ../static/css/v2-combined.css
