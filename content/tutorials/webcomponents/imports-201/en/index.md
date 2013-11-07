<p class="notice tip">If you haven't already, read up on the basics of HTML Imports in "<a href="/tutorials/webcomponents/imports/">HTML Imports: #include for the web</a>".
</p>

The design of HTML Imports lends itself nicely to loading reusable content on the web. In particular, it's an ideal way to distribute Web Components. Everything from basic [HTML `<template>`](/webcomponents/template/)s to full blown [Custom Elements](/tutorials/webcomponents/customelements/#registering) with Shadow DOM [[1](/tutorials/webcomponents/shadowdom/), [2](/tutorials/webcomponents/shadowdom-201/), [3](/tutorials/webcomponents/shadowdom-301/)]. When these technologies are used in tandem, imports become a [`#include`](http://en.cppreference.com/w/cpp/preprocessor/include) for Web Components.

<h2 id="include-templates">Including templates</h2>

The [HTML Template](/tutorials/webcomponents/template/) element is a natural fit for HTML Imports. `<template>` is great for scaffolding out sections of markup for the importing app to use as it desires. Wrapping content in a `<template>` also gives you the added benefit of its inertness (e.g. scripts don't run until the template is added to the DOM). Boom!

import.html

    <template>
      <h1>Hello World!</h1>
      <img src="world.png"> <!-- !requested until the template goes live. -->
      <script>alert("Executed when the template is activated.");</script>
    </template>

index.html

    <head>
      <link rel="import" href="import.html">
    </head>
    <body>
      <div id="container"></div>
      <script>
        var link = document.querySelector('link[rel="import"]');

        // Clone the <template> in the import.
        var template = link.import.querySelector('template');
        var content = template.content.cloneNode(true)

        document.querySelector('#container').appendChild(content);
      </script>
    </body>

<h2 id="include-elements">Registering custom elements</h2>

[Custom Elements](tutorials/webcomponents/customelements/) is another Web Component technology that plays absurdly well with HTML Imports. [Imports can execute script](/tutorials/webcomponents/imports/#includejs), so why not define + register your custom elements so users don't have to? Call it..."auto-registration". 

elements.html

    <script>
      // Define and register <one-element>.
      var proto = Object.create(HTMLElement.prototype);
      
      proto.createdCallback = function() {
        this.innerHTML = 'Hello, <b>' +
                         (this.getAttribute('name') || '?') + '</b>';
      };

      document.register('say-hi', {prototype: proto});

      // Define and register <two-element> that uses Shadow DOM.
      var proto2 = Object.create(HTMLElement.prototype);

      proto2.createdCallback = function() {
        var root = this.createShadowRoot();
        root.innerHTML = "<style>::content > *{color: red}</style>" +
                         "I'm a " + this.localName +
                         " using Shadow DOM!<content></content>";
      };
      document.register('shadow-element', {prototype: proto2});
    </script>

This import defines (and registers) two elements, `<one-element>` and `<two-element>`. The importer can simply declare them on their page. No wiring needed.

index.html

    <head>
      <link rel="import" href="elements.html">
    </head>
    <body>
      <say-hi name="Eric"></say-hi>
      <shadow-element>
        <div>( I'm in the light dom )</div>
      </shadow-element>
    </body>

<link rel="import" href="elements.html">

<div class="demoarea">
  <say-hi name="Eric"></say-hi><br><br>
</div>

<div class="demoarea">
  <shadow-element>
    <div>( I'm in the light dom )</div>
  </shadow-element>
</div>

In my opinion, this workflow alone makes HTML Imports an ideal way to share Web Components.

<h2 id="depssubimports">Managing dependencies and sub-imports</h2>

Yo dawg. I hear you like imports, so I included an import _in_ your import.

<h3 id="sub-imports">Sub-imports</h3>

It can be useful for one import to include another. For example, if you want to reuse or extend another component, use an import to load the other element(s).

Below is a real example from [Polymer](http://polymer-project.org). It's a new tab component (`<polymer-ui-tabs>`) that reuses a layout and selector component. The dependencies are managed using HTML Imports. 

polymer-ui-tabs.html

    <link rel="import" href="polymer-selector.html">
    <link rel="import" href="polymer-flex-layout.html">

    <polymer-element name="polymer-ui-tabs" extends="polymer-selector" ...>
      <template>
        <link rel="stylesheet" href="polymer-ui-tabs.css">
        <polymer-flex-layout></polymer-flex-layout>
        <shadow></shadow>
      </template>
    </polymer-element>

[full source](https://github.com/Polymer/polymer-ui-elements/blob/master/polymer-ui-tabs/polymer-ui-tabs.html)

Then user can import this new element:

    <link rel="import" href="polymer-ui-tabs.html">
    <polymer-ui-tabs.html></polymer-ui-tabs.html>

When a new, more awesome `<polymer-selector2>` comes along in the future, we can swap out `<polymer-selector>` and start using it straight away. We won't break users thanks to imports and web components.

<h3 id="deps">Dependency management</h3>

We all know that loading JQuery more than once per page causes errors. Isn't this
going to be a _huge_ problem for Web Components when multiple components use the same library? Not if we use HTML Imports! They can be used to manage dependencies.

**HTML Imports from the same URL are only loaded once**. By wrapping libraries in an HTML Import, you can automatically de-duped resources. Say we define an import, jquery.html, that includes jquery.js:

jquery.html

    <script src="jquery.js"></script>

In subsequent imports, that import gets reused:

ajax-element.html

    <link rel="import" href="jquery.html">

    <script>
      var proto = Object.create(HTMLElement.prototype);

      proto.makeRequest = function(url, done) {
        return $.ajax(url).done(function() { ... });
      };

      document.register('ajax-element', {prototype: proto});
    </script>

index.html (main page)

    <head>
      <link rel="import" href="jquery.html">
      <link rel="import" href="ajax-element.html">
    </head>
    <body>

    ...

    <script>
      $(document).ready(function() {
        var el = document.createElement('ajax-element');
        el.makeRequest('http://example.com');
      });
    </script>
    </body>

Despite JQuery being used in many places, it's only loaded once because we're reusing the import.

<h2 id="conslusion">Conclusion</h2>

While HTML Imports is useful as a standalone technology, it becomes extremely powerful
when used in conjunction with Web Component specs like Custom Elements and `<template>`. Developers can create reusable components for others to consume, bring into their app (or own import), all delivered through a single link.
