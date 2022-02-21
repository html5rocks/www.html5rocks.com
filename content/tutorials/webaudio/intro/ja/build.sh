#!/usr/bin/env bash

# Remove original index.
rm index.html
# Process some stuff.
cat header.html >> index.html
markdown-2.7 index.md >> index.html
cat footer.html >> index.html
# Pretty print everything.
sed -i -e 's/<pre>/<pre class="prettyprint">/g' index.html

rm index.html-e
