#!/usr/bin/env bash

# Remove original index.
rm index.html
# Process some stuff.
cat _header.html >> index.html
kramdown index.markdown >> index.html
cat _footer.html >> index.html
# Pretty print everything.
sed -ibak  's/<pre>/<pre class="prettyprint">/' index.html
rm -rf ./index.htmlbak

echo "redid it."
