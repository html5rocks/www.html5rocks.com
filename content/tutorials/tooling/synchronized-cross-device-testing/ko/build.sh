#!/usr/bin/env bash
#
# Generates the HTML5Rocks template from a markdown file containing content.

rm index.html
cat ../en/header.html >> index.html
/usr/local/bin/markdown_py index.md >> index.html
cat ../en/footer.html >> index.html

sed -i -e 's/<pre>/<pre class="prettyprint">/g' index.html

rm index.html-e
