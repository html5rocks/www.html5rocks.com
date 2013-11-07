{% include "warning.html" %}

<h2 id="why">Why imports?</h2>

Think about how we load different types of resources on the web. For JS, we have `<script src>`. For CSS, your go-to is probably `<link rel="stylesheet">`. For images it's `<img>`. Video has `<video>`. Audio, `<audio>`.... Get to the point! The majority of the web's content has a simple and declarative way to load itself. Not so for HTML. Here's your options:

1. **`<iframe>`** - tried and true but heavy weight. An iframe's content lives entirely in a separate context than your page. While that's mostly a great feature, it creates additional challenges (shrink wrapping the size of the frame to its content is tough, insanely frustrating to script into/out of, nearly impossible to style).
-  **AJAX** - [I love `xhr.responseType="document"`](http://ericbidelman.tumblr.com/post/31140607367/mashups-using-cors-and-responsetype-document), but you're saying I need JS to load HTML? That doesn't seem right.
- **CrazyHacks&#8482;** - embedded in strings, hidden as comments (e.g. `<script type="text/html">`). Yuck!

See the irony? **The web's most basic content, HTML, requires the greatest amount
of effort to work with**. Fortunately, [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) are here to get us back on track.

<h2 id="started">Getting started</h2>

[HTML Imports](http://www.w3.org/TR/2013/WD-html-imports-20130514/), a cast member of [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html), are a way to include HTML documents in other HTML documents. You're not limited to markup either. An import can also include CSS, JavaScript, or anything else an `.html` file can contain. In other words, this makes imports a **fantastic tool for loading related HTML/CSS/JS**.

<h3 id="basics">The basics</h3>

Include an import on your page by declaring a `<link rel="import">`:

    <head>
      <link rel="import" href="/path/to/imports/stuff.html">
    </head>

The URL of an import is called an _import location_. To load content from another domain, the import location needs to be CORs-enabled:

    <!-- Resources on other origins must be CORs-enabled. -->
    <link rel="import" href="http://example.com/elements.html">

<p class="notice fact">Thanks to browser caching, multiple imports that reference the same URL will only be retrieved once. Resources are automatically de-duped for you!</p>

<h3 id="featuredetect">Feature detection and support</h3>

To detect support, check if `.import` exists on the `<link>` element:

    function supportsImports() {
      return 'import' in document.createElement('link');
    }

    if (supportsImports()) {
      // Good to go!
    } else {
      // Use other libraries/require systems to load files.
    }

Browser support is still in the early days. Chrome 31 is the first browser to have an implementation. You can enable the flag by turning on **Enable HTML Imports** in `about:flags`. For other browsers, [Polymer's polyfill](http://www.polymer-project.org/platform/html-imports.html) works great until things are widely supported.

<figure>
  <img src="aboutflag.png">
  <figcaption><b>Enable HTML Imports</b> in <code>about:flags</code>.</figcpation>
</figure>

<p class="notice tip">Also <b>Enable experimental Web Platform features</b> to get the other bleeding edge web component goodies.</p>

<h3 id="bundling">Bundling resources</h3>

Imports provide convention for bundling HTML/CSS/JS (even other HTML Imports) into a single deliverable. It's an intrinsic feature, but a powerful one. If you're creating a theme, library, or just want to segment your app into logical chunks, giving users a single URL is compelling. Heck, you could even deliver an entire app via an import. Think about that for a second.

<blockquote class="commentary talkinghead">Using only one URL, you can package together a single relocatable bundle of web goodness for others to consume.
</blockquote>

A real-world example is [Bootstrap](http://getbootstrap.com/). Bootstrap is comprised of
individual files (bootstrap.css, bootstrap.js, fonts), requires JQuery for its plugins, and provides markup examples. Developers like à la carte flexibility. It allows them buy in to the parts of the framework _they_ want to use. That said, I'd wager your typical JoeDeveloper&#8482; goes the easy route and downloads all of Bootstrap.

Imports make a ton of sense for something like Bootstrap. I present to you, the future of loading Bootstrap:

    <link rel="import" href="bootstrap.html">

bootstrap.html:

    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="fonts.css">
    <script src="jquery.js"></script>
    <script src="bootstrap.js"></script>
    <script src="bootstrap-tooltip.js"></script>
    <script src="bootstrap-dropdown.js"></script>
    ...

    <!-- scaffolding markup -->
    <template>
      ...
    </template>

Let this sit. It's exciting stuff.

<h3 id="events">Load/error events</h3>

The `<link>` element fires a `load` event when an import is loaded successfully
and `onerror` when the attempt fails (e.g. if the resource 404s). 

Imports try to load immediately. An easy way avoid headaches
is to use `onload`/`onerror` attributes:

    <script async>
      function handleLoad(e) {
        console.log('Loaded import: ' + e.target.href);
      }
      function handleError(e) {
        console.log('Error loading import: ' + e.target.href);
      }
    </script>

    <link rel="import" href="file.html"
          onload="handleLoad(event)" onerror="handleError(event)">

<p class="notice tip">Notice the event handlers are defined before the import is loaded on the page. This is because the import tries to load immediately. If the functions don't exist yet, you'll get console errors for missing function names.</p>

Or, if you're creating the import dynamically:

    var link = document.createElement('link');
    link.rel = 'import';
    link.href = 'file.html'
    link.onload = function(e) {...};
    link.onerror = function(e) {...};
    document.head.appendChild(link);

<h2 id="usingcontent">Using the content</h2>

Including `<link rel="import" href="file.html"`> on a page doesn't mean "plop the content of file.html here". It means "parser, go off an fetch this document so I can use it". To actually use the content, we have to take action and write some script.

A critical aha! moment is realizing that an import is just a document. In fact, the content of an import is called an *import document*. We're able to **manipulate the guts of an import using standard DOM APIs**!

<h3 id="importprop">link.import</h3>

The content of an import is accessed through the `<link>`'s `.import` property:

    var content = document.querySelector('link[rel="import"]').import;

`link.import` is `null` under the following conditions:

1. the browser doesn't support HTML Imports
- the `<link>` doesn't have `rel="import"`
- the `<link>` has not been added to the DOM
- the `<link>` has been removed from the DOM
- the resource is not CORS-enabled

**Full example**

Let's say `warnings.html` contains:

    <div class="warning">
      <style scoped>
        h3 {
          color: red;
        }
      </style>
      <h3>Warning!</h3>
      <p>This page is under construction</p>
    </div>

    <div class="outdated">
      <h3>Heads up!</h3>
      <p>This content may be out of date</p>
    </div>

Importers can grab specific portions of this document and clone it into their page:

    <head>
      <link rel="import" href="warnings.html">
    </head>
    <body>
      ...
      <script>
        var link = document.querySelector('link[rel="import"]');
        var content = link.import;

        // Grab DOM from warning.html's document.
        var el = content.querySelector('.warning');

        document.body.appendChild(el.cloneNode(true));
      </script>
    </body>

<p class="notice">Notice there's no need for <code>DOMContentLoaded</code>/<code>load</code> event handling. Things are assumed to be ready when we start to drill into the import.</p>

<div class="demoarea" id="warning-example-area"></div>

<link rel="import" id="warning-example-link" href="warning.html">
<script>
  var link = document.querySelector('#warning-example-link');
  if ('import' in link) {
    var content = link.import;
    var alertDOM = content.querySelector('div.alert');
    document.querySelector('#warning-example-area').appendChild(alertDOM.cloneNode(true));
  }
</script>

<h3 id="includejs">Scripting in imports</h3>

Imports are not in the main document. They're satellite to it. However, your import can still act on the main page even though it reigns supreme. An import can access its own DOM and/or the DOM of the page that's importing it:

**Example** - import.html that adds one of its stylesheets to the main page

    <link rel="stylesheet" href="http://www.example.com/styles.css">
    <link rel="stylesheet" href="http://www.example.com/styles2.css">
    ...

    <script>
      // importDoc references this import's document
      var importDoc = document.currentScript.ownerDocument;

      // mainDoc references the main document (the page that's importing us)
      var mainDoc = document;

      // Grab the first stylesheet from this import, clone it,
      // and append it to the importing document.
      var styles = importDoc.querySelector('link[rel="stylesheet"]');
      mainDoc.head.appendChild(styles.cloneNode(true));
    </script>

Notice what's going on here. From within an import, we're not only able to reference the import itself (`document.currentScript.ownerDocument`), but have it _append itself_ to the page that's importing it (`mainDoc.head.appendChild(...)`). Pretty gnarly if you ask me.

<blockquote class="commentary talkinghead">Using script in imports makes them conceptually similar to <a href="http://docs.python.org/2/tutorial/modules.html#more-on-modules">Python modules</a>. They can be loaded as definitions or execute code by running directly.
</blockquote>

Rules of JavaScript in an import

1. Script is executed, and executed in the context of the main document (e.g. `window.document`) in an import refers to the main page. This is inherently useful if you're loading resources that depend on this to be true. Today, that's essentially every library out there.
    - functions defined in an import end up on `window`.
    - you don't have to do anything crazy like append the import's `<script>` blocks to the main page. Again, script gets executed.
- Imports do not block parsing the main page. However, scripts inside them are processed in order. This means you get defer-like behavior while maintaining proper script order. More on this below.

<h2 id="performance">Performance considerations</h2>

<h3 id="perf-concat">Consider concatenating imports</h3>

[Vulcanizer](https://github.com/Polymer/vulcanize) is an npm build tool from the [Polymer](http://www.polymer-project.org/) team that recursively flattens a set of HTML Imports into a single file. Think of it as a concatenation build step for Web Components. If you're keen on reducing network requests, check out Vulcanizer.

<h3 id="perf-caching">Imports leverage browser caching</h3>

Many people often forget that the browser's
networking stack has been finely tuned over the years. Imports (and sub-imports) take advantage of this logic too.

<h3 id="perf-inert">Content is "inert" until you use it</h3>

Think of content as inert until you call upon its services. Take normal, dynamically created stylesheet:

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles.css';

The browser won't request styles.css until `link` is added to the DOM:

    document.head.appendChild(link); // browser requests styles.css

Another example is dynamically created markup:

    var h2 = document.createElement('h2');
    h2.textContent = 'Booyah!';

The `h2` is relatively meaningless until you add it to the DOM.

The same concept holds true for the import document. Unless you append it's content to the DOM, it's a no-op. In fact, the only thing that "executes" in the import document directly is `<script>`. See [scripting in imports](#includejs).

<h3 id="perf-parsing">Optimizing for async loading</h3>

**Imports don't block parsing the main page**. Scripts inside imports are processed in order but don't block the importing page. This means you get defer-like behavior while maintaining proper script order. One benefit of putting your imports in the `<head>` is that it lets the parser start working on the content as soon as possible. With that said, it's critical to remember `<script>` in the main document *still* continues to block the page:

    <head>
      <link rel="import" href="/path/to/import_that_takes_5secs.html">
      <script>console.log('I block page rendering');</script>
    </head>

Depending on your app structure and use case, there are several ways to optimize to get async behavior. All of these methods do not block the main page rendering.

**Scenario #1 (preferred): you don't have script in `<head>` or inlined in `<body>`**

My recommendation for placing `<script>` is to avoid immediately following your imports. Move scripts as late in the game as possible...but you're already doing that best practice, AREN'T YOU!? ;)

Here's an example:

    <head>
      <link rel="import" href="/path/to/import.html">
      <link rel="import" href="/path/to/import2.html">
      <!-- avoid including script -->
    </head>
    <body>
      <!-- avoid including script -->

      <div id="container"></div>

      <!-- avoid including script -->
      ...

      <script>
        // Other scripts n' stuff.

        // Bring in the import content.
        var link = document.querySelector('link[rel="import"]');
        var post = link.import.querySelector('#blog-post');
        
        var container = document.querySelector('#container');
        container.appendChild(post.cloneNode(true));
      </script>
    </body>

Everything is at the bottom.

**Scenario 1.5: the import adds itself**

Another option, though brittle, is to have the import [add its own content](#includejs). *I don't recommend this technique* because it requires the import to know the structure of the main page ahead of time. I'm including it here for the sake of completeness.

import.html:

    <div id="blog-post">...</div>
    <script>
      var me = document.currentScript.ownerDocument;
      var post = me.querySelector('#blog-post');

      var container = document.querySelector('#container');
      container.appendChild(post.cloneNode(true));
    </script>

index.html

    <head>
      <link rel="import" href="/path/to/import.html">
    </head>
    <body>
      <!-- no need for script. the import takes care of things -->
    </body>

**Scenario #2: you *have* script in `<head>` or inlined in `<body>`**

If you can't avoid `<script>` in the `<head>`, dynamically add the import:

    <head>
      <script>
        function addImportLink(url) {
          var link = document.createElement('link');
          link.rel = 'import';
          link.href = url;
          link.onload = function(e) {
            var post = this.import.querySelector('#blog-post');

            var container = document.querySelector('#container');
            container.appendChild(post.cloneNode(true));
          };
          document.head.appendChild(link);
        }

        addImportLink('/path/to/import.html'); // Import is added early :)
      </script>
      <script>
        // other scripts
      </script>
    </head>
    <body>
       <div id="container"></div>
       ...
    </body>

Alternatively, do things near `</body>`:

    <head>
      <script>
        // other scripts
      </script>
    </head>
    <body>
      <div id="container"></div>
      ...

      <script>
        function addImportLink(url) { ... }

        addImportLink('/path/to/import.html'); // Import is added very late :(
      </script>
    </body>

<p class="notice"><b>Note:</b> This very last approach is least preferable. The parser doesn't start to work on the import content until late in the page.</p>

<h2 id="tips">Things to remember</h2>

1. An import's mimetype is `text/html`.

- Resources from other origins need to be CORs-enabled.

-  Consecutive imports from the same URL are retrieved once. That shouldn't be surprising given that stylseheets behave the same way. For example:

        <link rel="import" href="file.html">
        <link rel="import" href="file.html">

    results in a single request for `file.html`.

- Scripts in an import are processed in order, but do not block the main document parsing.

- While scripts execute in an import, stylesheets, markup, and other resources need to be added to the main page.

-  `<link rel="import" href="file.html"`> doesn't mean "#include the content of file.html here". It means "parser, go off an fetch this document so I can use it later". This is a major difference between HTML Imports and `<iframe>`, which says "load and render this content here".

<h2 id="conclusion">Conclusion</h2>

HTML Imports allow bundling HTML/CSS/JS as a single resource. While useful by themselves, this idea becomes extremely [powerful in the world of Web Components](/tutorials/webcomponents/imports-201/). Developers can create reusable components for others to consume and bring in to their own app, all delivered through `<link rel="import">`.

HTML Imports are a simple concept, but enable a number of interesting use cases
for the platform.

<h3 id="usecases">Use cases</h3>

- distribute related [HTML/CSS/JS as a single bundle](#bundling). Theoretically, one could import an entire web app into another.
- encourages **modularity &amp; reusability**.
- **code organization** - segment concepts logically into different files.
- wrapping up one or more [Custom Element](/tutorials/webcomponents/customelements/) definitions, an import can be used to [register](/tutorials/webcomponents/customelements/#registering) and deliver them to an app. This practices good software patterns, keeping the element's interface/definition separate from how its used.
- [**eases dependency management**](/tutorials/webcomponents/imports-201/#depssubimports) - resources are automatically de-duped.
- **Chunking scripts** - before imports, a large-sized JS library would have its file wholly parsed in order to start running, which was slow. With imports, the library can start working as soon as chunk A is parsed. Less latency!

      `<link rel="import" href="chunks.html">`

        <script>/* script chunk A goes here */</script>
        <script>/* script chunk B goes here */</script>
        <script>/* script chunk C goes here */</script>
        ...

- First time the **browser is able to run two (or more) HTML parsers in parallel**.
