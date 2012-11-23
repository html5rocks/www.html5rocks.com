#!/usr/bin/env bash
#
# Generates the HTML5Rocks template from a markdown file containing content.
#
# Author: Boris Smus <smus@html5rocks.com>
# Modified: Eric Bidelman <ericbidelman@html5rocks.com>
# Modified: Razvan Caliman <rcaliman@adobe.com>
# get markdown2 from https://github.com/trentm/python-markdown2/

rm index.html
cat header.html >> index.html
markdown2 --extras markdown-in-html index.md >> index.html
cat footer.html >> index.html

sed -i -e 's/<pre>/<pre class="prettyprint">/g' index.html

rm index.html-e
