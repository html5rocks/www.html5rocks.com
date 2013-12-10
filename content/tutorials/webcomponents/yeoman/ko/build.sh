#!/usr/bin/env bash
#
# Generates the HTML5Rocks template from a markdown file containing content.
#
# Author: Boris Smus <smus@html5rocks.com>
# Modified: Eric Bidelman <ericbidelman@html5rocks.com>
# Modified: Chang W. Doh <changwook.doh@gmail.com> : concat header & footer from ../en/ at building

rm index.html
cat ./header.html >> index.html
/usr/local/bin/markdown_py index.md >> index.html
cat ../en/footer.html >> index.html

sed -i -e 's/<pre>/<pre class="prettyprint">/g' index.html

rm index.html-e
