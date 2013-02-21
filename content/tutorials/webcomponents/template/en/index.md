{% include "warning.html" %}

<h2 id="toc-intro">Introduction</h2>

The concept of templating is not new to web development. In fact, server-side
templating languages/engines like Django (Python), ERB/Haml (Ruby), and Smarty (PHP)
have been around for a long time. In the last couple of years however, we've seen
an explosion of MVC frameworks spring up. All of them are slightly different,
yet most share a common mechanic for rendering their presentational layer (view): templates.

Templates are fantastic. Go ahead. Ask around. Even the [definition](http://www.thefreedictionary.com/template) 
of makes you feel warm and cozy:

> **template** (n) - A document or file having a preset format, used as a starting point for a particular application so that the format does not have to be recreated each time it is used.

"...does not have to be recreated each time...." I don't know about you, but I love
saving myself from extra work. Why then does the web platform lack
native support for something developers clearly want and care about?

The [W3C HTML Templates specification][spec-link] is the answer. It defines a
new `<template>` element for creating client-side templates.

<h2 id="toc-started">Declaring template content</h2>

An HTML `<template>` contains content which is **inert chunks of cloneable DOM**.
Think of them as pieces of scaffolding that you can use (and reuse) throughout
the lifetime of your app.

To create a template, you declare some markup and wrap it in a `<template>`:

    <template id="mytemplate">
      <img src="">
      <div class="comment"></div>
    </template>

<blockquote class="commentary talkinghead">
The observant reader may notice the empty image. That's perfectly fine
and intentional. A broken image won't 404 or produce console errors because it
won't be fetched. We can dynamically generate the source URL later on. See 
<a href="#toc-pillars">the pillars</a>.
</blockquote>

<h2 id="toc-pillars">The pillars</h2>

Wrapping content in a `<template>` gives us four important properties.

1. Its **content is effectively inert until activated**. Essentially,
your markup is hidden DOM and does not render.

2. Any content within a template won't have side effects. **Script doesn't run,
images don't load, audio doesn't play**,...until the template is used.

3. **content is consider not to be in the document**. Using
`document.getElementById()` or `querySelector()` in the main page won't return
child nodes of a template.

4. Templates **can** be placed anywhere inside of `<head>`, `<body>`, or `<frameset>` and can
contain any type of content which is allowed in those elements. It can 
also be placed as a child of `<table>` or `<select>`.

<h2 id="toc-using">Activating a template</h2>

To use a template, you first need to activate it. Do this by cloning its inner
content:

    var t = document.querySelector('#mytemplate');
    t.content.querySelector('img').src = 'logo.png'; // Populate the src at runtime.
    document.body.appendChild(t.content.cloneNode(true));

`.content` is a `DocumentFragement` that provides access to the guts of a template.

<h3 id="toc-detect">Feature Detection</h3>

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // Good to go!
    } else {
      // Use old templating techniques or libraries.
    }


<h3 id="toc-old">The Road to templates</h3>

The road to proper HTML templates has been a long one. Over the years, we've come
up with some pretty clever tricks for creating reusable templates. Below are
two common ones that I've come across. I'm including them in this article for
comparison.

<h4 id="toc-offscreen"><b>Method 1</b>: Offscreen DOM</h4>

One approach people have been using for a long time is to create "offscreen"
DOM and hide it from view using the `hidden` attribute or `display:none`.

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

While this technique works, there are a number of downsides. The rundown of this technique:

- <label class="good"></label> *Using DOM* - the browser knows DOM. It's good at it. We can easily clone it.
- <label class="good"></label> *Nothing is rendered* - adding `hidden` prevents the block from showing
- <label class="bad"></label> *Not inert* - even though our content is hidden,
a network request is still made for the image.
- <label class="bad"></label> *Painful styling and theming* - an embedding page must prefix all of its
CSS rules with `#mytemplate` in order to scope styles down to the template. This 
is brittle and there are no guarantees we won't encounter future naming collisions.
For example, we're hosed if the embedding page already has an element with that id.

<h4 id="toc-offscreen"><b>Method 2</b>: Overloading <code>&lt;script></code></h4>

Another technique is overloading a `<script>` and manipulating its contents
as string. John Resig was probably the first to show this back in 2008 with
his [Micro Templating utility](http://ejohn.org/blog/javascript-micro-templating/).
Now there are many others, including new kid on the block,
[handlebars.js](http://handlebarsjs.com/).

Handlebars example:

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

The rundown of this technique:

- <label class="good"></label> *Nothing is rendered* - the browser doesn't render this block because
`<script>` is `display:none` by default.
- <label class="good"></label> *Inert* - the browser doesn't parse the script content
as JS because its type is set to something other than "text/javascript".
- <label class="bad"></label> *Security issues* - encourages the use of `.innerHTML`.
Run-time string parsing of user-supplied data can easily lead to XSS vulnerabilities.

<h2 id="toc-conclusion">Conclusion</h2>

Remember when JQuery made working with DOM dead simple? The result was `querySelector()`/`querySelectorAll()`
being added to platform. Obvious wins, right? A library popularized fetching DOM
with CSS selectors; standards adopted it. It doesn't always work that was, but I *love* when it does.

In my opinion, `<template>` is a similar case. It standardizes client-side templating,
removes the need for our [crazy hacks](#toc-old), and makes the entire web
authoring process more sane and more maintainable.


<h2 id="toc-resources">Additional Resources</h2>

- [W3C Specification][spec-link]
- [Introduction to Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#template-section)

[spec-link]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html


