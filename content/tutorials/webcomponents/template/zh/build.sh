#!/usr/bin/env bash
#
# Generates the HTML5Rocks template from a markdown file containing content.
#
# Author: Boris Smus <smus@html5rocks.com>
# Modified: Eric Bidelman <ericbidelman@html5rocks.com>

rm index.html
cat header.html >> index.html
/usr/local/bin/markdown_py index.md >> index.html

cat footer.html >> index.html

sed -i -e 's/<pre>/<pre class="prettyprint">/g' index.html

rm index.html-e