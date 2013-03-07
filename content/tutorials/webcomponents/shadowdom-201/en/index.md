{% include "warning.html" %}

This article discusses more of the amazing things you can do with Shadow DOM.
It builds on the concepts discussed in [Shadow DOM 101](/tutorials/webcomponents/shadowdom/).
If you're looking for an introduction, see [Dominic Cooney](/profiles/#dominiccooney)'s most [excellent article](/tutorials/webcomponents/shadowdom/).

<h2 id="toc-intro">Introduction</h2>

Let's face it. There's nothing sexy about unstyled markup. Lucky for us, [the brilliant folks behind Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#acknowledgements)
foresaw this and didn't leave us hanging. We have many options when it
comes to styling content in a shadow tree.

<h2 id="toc-style-scoped">Style encapsulation</h2>

One of the core features of Shadow DOM is the [shadow boundary](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#shadow-trees). It has a lot of nice properties,
but one of the best is that it provides style encapsulation for free. Stated another way:

<p class="notice fact">By default, CSS styles defined inside Shadow DOM are scoped to its ShadowRoot.</p>

Below is an example. If all goes well and your browser supports Shadow DOM (it does<span class="featuresupported no">n't</span>!), you'll see "<span style="color:red">Shadow DOM Title</span>".

    <div><h3>Host title</h3></div>
    <script>
    var root = document.querySelector('div').webkitCreateShadowRoot();
    root.innerHTML = '<style>h3{ color: red; }</style>' + 
                     '<h3>Shadow DOM Title</h3>';
    </script>

<div class="demoarea">
  <div id="style-ex-scoped"><h3>Host Title</h3></div>
</div>
<script>
(function() {
var container = document.querySelector('#style-ex-scoped');
var root = container.createShadowRoot();
root.innerHTML = '<style>h3{color: red;}</style><h3>Shadow DOM Title</h3>';
})();
</script>

There are two interesting observations about this demo:

- There are
<a href="javascript:alert('There are ' + document.querySelectorAll('h3').length + ' &#60;h3&#62; on this page.')">other h3s on this page</a>, but the only one that matches the h3 selector, and therefore styled
red, is the one in the ShadowRoot. Again, scoped styles by default.
- Other styles rules defined on this page that target h3s don't bleed into my content.
That's because **selectors don't cross the shadow boundary**.

Moral of the story? We have style encapsulation from the outside world. Thanks Shadow DOM!

<h2 id="toc-style-host">Styling the host element</h2>

The `@host` [at-rule](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#host-at-rule) allows you to select and style the element hosting a shadow tree:

    <button class="bigger">My Button</button>
    <script>
    var root = document.querySelector('button').webkitCreateShadowRoot();
    root.innerHTML = '<style>' + 
        '@host{' + 
          'button { text-transform: uppercase; }' +
          '.bigger { padding: 20px; }' +
        '}' +
        '</style>' + 
        '<content select=""></content>';
    </script>

<div class="demoarea">
  <button id="style-athost" class="bigger">My Button</button>
</div>
<script>
(function() {
var container = document.querySelector('#style-athost');
var root = container.createShadowRoot();
root.innerHTML = '<style>' + 
                     '@host{' + 
                        'button { text-transform: uppercase; text-shadow:none }' +
                        '.bigger { padding: 20px; }' +
                      '}' +
                      '</style>' + 
                      '<content select=""></content>';
})();
</script>

One gotcha is that rules wrapped in a `@host` have higher specificity than
any selector in the parent page, but a lower specificity than a `style` attribute
defined on the host element. `@host` also only works in the context
of a ShadowRoot so you can't use it outside of Shadow DOM.

A common use case for `@host` is when you're creating a custom element and
want to react to different user states (:hover, :focus, :active, etc.).

    <style>
    @host {
      * {
        opacity: 0.4;
        {% mixin transition: opacity 420ms ease-in-out; %}
      }
      *:hover {
        opacity: 1;
      }
      *:active {
        position: relative;
        top: 3px;
        left: 3px;
      }
    }
    </style>

<div class="demoarea">
  <button id="style-athost-ex2">My Button</button>
</div>
<script>
(function() {
var container = document.querySelector('#style-athost-ex2');
var root = container.createShadowRoot();
root.innerHTML = '<style>\
     @host {\
      * {\
        opacity: 0.4;\
        -webkit-transition: opacity 200ms ease-in-out;\
      }\
      *:active { position:relative;top:3px;left:3px; }\
      *:hover {\
        opacity: 1;\
      }\
    }</style><content select=""></content>';
})();
</script>

In this example, I've used "*" to select any type of element that's hosting my
shadow tree. "I don't care what type of element you are. Just style yourself like this."

Another need for `@host` is if you want to potentially style multiple types of
hosts from within the same Shadow DOM, say if you're creating a custom element.
Or perhaps you have different themes based on the host element.

    @host {
      g-foo { 
        /* Applies if the host is a <g-foo> element.*/
      }

      g-bar {
        /* Applies if the host is a <g-bar> element. */
      }

      div {
        /* Applies if the host element is a <div>. */
      }

      * {
        /* Applies to any type of element hosting this ShadowRoot. */
      }
    }

<h2 id="toc-style-hooks">Creating style hooks</h2>

Customization is good. In certain cases, you may want to poke holes in your Shadow's
styling shield and create hooks for others to style.

<h3 id="toc-custom-pseduo">Using custom pseudo elements</h3>

Both [WebKit](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css?format=txt) and
[Firefox](https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference/Mozilla_Extensions#Pseudo-elements_and_pseudo-classes) define pseudo elements for styling internal pieces of native browser elements. A good example
is the `input[type=range]`. You can style the slider thumb <span style="color:blue">blue</span> by targeting `::-webkit-slider-thumb`:

    input[type=range].custom::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: blue;
      width: 10px;
      height: 40px;
    }

Similar to how WebKit/FF provides styling hooks into some internals,
authors of Shadow content can designate certain elements as styleable by
outsiders. This is done through custom pseudo elements.

You can designate an element as a custom pseudo element by using the `pseudo` attribute.
It's value, or name, needs to be prefixed with "x-". Doing so creates
an association with that element in the shadow tree and gives outsiders a
designated lane to cross the shadow boundary.

Here's an example of creating a custom slider widget and allowing someone to style
its slider thumb <span style="color:blue">blue</span>:

    <style>
      #host::x-slider-thumb {
        background-color: blue;
      }
    </style>
    <div id="host"></div>
    <script>
    var root document.querySelector('#host').webkitCreateShadowRoot();
    root.innerHTML = '<div>' +
                       '<div pseudo="x-slider-thumb"></div>' + 
                     '</div>';
    </script>

<blockquote class="commentary talkinghead">
What's really neat about custom pseudo elements? You can style them with outside CSS
but can't access them via outside JS. The shadow boundary is preserved for JS
but loosened for custom pseudo element definitions.
</blockquote>

<h3 id="toc-vars">Using CSS Variables</h3>

<p class="notice">CSS Variables can be enabled in Chrome under "Enable experimental WebKit features"
  in about:flags.</p>

Another powerful way to create theming hooks will be through [CSS Variables](http://dev.w3.org/csswg/css-variables/). Essentially, creating "style placeholders" for others to fill in.

A possible scenario might be a custom element author who marks out variable
placeholders in their Shadow DOM. One for styling an internal button's font and another for
its color:

    button {
      color: {% mixin var(button-text-color, pink) %} /* default color will be pink */
      font: {% mixin var(button-font) %}
    }

Then, the embedder of the element defines those values to their liking. Perhaps
to match the awesome Comic Sans theme of their own page:

    #host {
      {% mixin var-button-text-color: green %}
      {% mixin var-button-font: "Comic Sans MS", "Comic Sans", cursive %}
    }

Due to the way CSS variables inherit, everything is peachy and this
works beautifully! The whole picture looks like this:

    <style>
      #host {
        {% mixin var-button-text-color: green %}
        {% mixin var-button-font: "Comic Sans MS", "Comic Sans", cursive %}
      }
    </style>
    <div id="host">Host node</div>
    <script>
    var root document.querySelector('#host').webkitCreateShadowRoot();
    root.innerHTML = '<style>' + 
        'button {' + 
          'color: {% mixin var(button-text-color, pink) %}' + 
          'font: {% mixin var(button-font) %}' + 
        '}' +
        '</style>' +
        '<content></content>';
    </script>

<blockquote class="commentary talkinghead">
I've already mentioned <a href="https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/custom/index.html#the-element-element">Custom Elements</a> a few times in this article. I'm not going to cover
them here. For now, just know that Shadow DOM forms their structural foundation
and the styling concepts in this article pertain to Custom Elements.
</blockquote>

<h2 id="toc-style-inheriting">Inheriting & resetting styles</h2>

In some cases, you may want to let foreign styles into your shadow tree.
A prime example is a commenting widget. Most authors embedding that widget
probably want the thing to look like it belongs on their page. I know I would.
Thus, we need a way to adopt the look and feel of the embedding page; by
inheriting fonts, colors, line-heights, etc.

For flexibility, Shadow DOM allows us to poke more holes in its style shield.
There are two properties to control the what bleeds in:

- **.resetStyleInheritance**
    - `false` - Default. [inheritable CSS properties](http://www.impressivewebs.com/inherit-value-css/) continue to inherit.
    - `true` - resets inheritable properties to `initial` at the boundary.
- **.applyAuthorStyles**
    - `true` - styles defined in the author's document are applied. This of this
    as allowing styles to "bleed" across the boundary.
    - `false` - Default. Author styles are not applied to the shadow tree.

Below is a demo for seeing how a shadow tree is effected by changing these two properties.

<pre class="prettyprint">
&lt;div>&lt;h3>Host title&lt;/h3>&lt;/div>
&lt;script>
var root = document.querySelector('div').webkitCreateShadowRoot();
root.applyAuthorStyles = <span id="code-applyAuthorStyles">true</span>;
root.resetStyleInheritance = <span id="code-resetStyleInheritance">false</span>;
root.innerHTML = '&lt;style>h3{ color: red; }&lt;/style>' + 
                 '&lt;h3>Shadow DOM Title&lt;/h3>' + 
                 '&lt;content select="h3">&lt;/content>';
&lt;/script>
</pre>

<div class="demoarea" style="width:225px;">
  <div id="style-ex-inheritance"><h3>Host Title</h3></div>
</div>
<div id="inherit-buttons">
  <button id="demo-applyAuthorStyles">applyAuthorStyles=true</button>
  <button id="demo-resetStyleInheritance">resetStyleInheritance=false</button>
</div>

<script>
(function() {
var container = document.querySelector('#style-ex-inheritance');
var root = container.createShadowRoot();
root.applyAuthorStyles = true;
//root.resetStyleInheritance = false;
root.innerHTML = '<style>h3{color: red;}</style><h3>Shadow DOM Title</h3><content select="h3"></content>';

document.querySelector('#demo-applyAuthorStyles').addEventListener('click', function(e) {
  root.applyAuthorStyles = !root.applyAuthorStyles;
  e.target.textContent = 'applyAuthorStyles=' + root.applyAuthorStyles;
  document.querySelector('#code-applyAuthorStyles').textContent = root.applyAuthorStyles;
});
document.querySelector('#demo-resetStyleInheritance').addEventListener('click', function(e) {
  root.resetStyleInheritance = !root.resetStyleInheritance;
  e.target.textContent = 'resetStyleInheritance=' + root.resetStyleInheritance;
  document.querySelector('#code-resetStyleInheritance').textContent = root.resetStyleInheritance;
});

})();
</script>

It's easy to see how `.applyAuthorStyles` works. It makes the Shadow DOM's h3
inherit the look of the other h3s on this page (e.g "applying the page author's styles").

<p class="notice fact">Even with the <code>apply-author-styles</code> attribute set,
CSS selectors defined in the document do not cross the shadow boundary.
<b>Style rules only match when they're entirely inside or outside of the shadow tree.</b></p>

<img src="showinheritance.gif" title="DevTools inherited properties" alt="DevTools inherited properties" style="height:215px;border:1px solid #ccc;float:right;margin-left:10px;">

Understanding `.resetStyleInheritance` is a bit trickier, primarily because it
only has an effect on CSS properties which are inheritable. It says: when
you're looking for a property to inherit, at the boundary between the page and
the ShadowRoot, don't inherit values from the host but use the `initial`
value instead (per the CSS spec).

If you're unsure about which properties inherit in CSS, check out [this handy list](http://www.impressivewebs.com/inherit-value-css/) or toggle the "Show inherited" checkbox in the Element panel.

<h3 id="style-inherit-cheetsheet">Scenario cheatsheet</h3>

To better understand when you might use these properties, below is a decision matrix to help.
Carry this around in your pocket. It's gold!

<table>
  <tr><th>Scenario</th><th>applyAuthorStyles</th><th>resetStyleInheritance</th></tr>
  <tr><td>"I have my own appearance, but want to match basic properties like text color."<br>
    <em>basically, you're creating a widget</em></td><td>false</td><td>false</td></tr>
  <tr><td>"Screw the page! I have my own theme"<br>
    <em>you'll still need a "component reset stylesheet" because distributed content gets the styles it had in the page.</em></td><td>false</td><td>true</td></tr>
  <tr><td>"I'm a component designed to get my theme from styles in the page"</td><td>true</td><td>true</td></tr>
  <tr><td>"I want to blend in with the page as much as possible."<br>
    <em>remember selectors don't cross the shadow boundary</em>.</td><td>true</td><td>false</td></tr>
</table>

<h2 id="toc-style-disbtributed-nodes">Styling distributed nodes</h2>

`.applyAuthorStyles`/`.resetStyleInheritance` are strictly for effecting the
styling behavior of the nodes defined **in** the Shadow DOM. 

Distributed nodes are a different beast. They're not logically in the
Shadow DOM; they're still children of the host element which are swizzled into place at "render time."
Naturally, they get their styles from the document they're in (the host's document).
The only exception to that rule is that they may gain additional styles from the place
they've been swizzled into (the Shadow DOM).

<h3 id="toc-distributed">::distributed() pseudo element</h3>

If distributed nodes are children of the host element. How then do we target + style
them from *within* the Shadow DOM? The answer is the `::distributed()` pseudo element. It's the
first-ever *functional* pseudo element which takes a CSS selector for its parameter.

Let's see a simple example:

    <div><h3>Host title</h3></div>
    <script>
    var root = document.querySelector('div').webkitCreateShadowRoot();
    root.innerHTML = '<style>' + 
                       'h3{ color: red; }' + 
                       'content::-webkit-distributed(h3) { color: green; }' + 
                     '</style>' + 
                     '<h3>Shadow DOM Title</h3>' +
                     '<content select="h3"></content>';
    </script>

<div class="demoarea">
  <div id="style-ex-distributed"><h3>Host Title</h3></div>
</div>
<script>
(function() {
var container = document.querySelector('#style-ex-distributed');
var root = container.createShadowRoot();
root.innerHTML = '<style>h3{ color: red; }' + 
                 'content::-webkit-distributed(h3) { color: green; }' + 
                 '</style>' + 
                 '<h3>Shadow DOM Title</h3>' +
                 '<content select="h3"></content>';
})();
</script>

You should see "<span style="color:red">Shadow DOM Title</span>"" and
"<span style="color:green">Host Title</span>" below it. Also note that
"Host title" is still retaining the styles from its document. In this case, the page.

<h3 id="toc-shadow-resetstyles">Resetting styles at insertion points</h3>

When creating a ShadowRoot, you have the option of resetting the inherited styles.
`<content>` and `<shadow>` insertion points also have this option. When using
these elements, either set the `.resetStyleInheritance` in JS or use the boolean
`reset-style-inheritance` attribute on the element itself.

- For a ShadowRoot or `<shadow>` insertion points: `reset-style-inheritance`
means inheritable CSS properties are set to `initial` at the host, before they
hit your shadow content. **This location is known as the upper boundary**.

- For `<content>` insertion points: `reset-style-inheritance` means inheritable
CSS properties are set to `initial` before the host's children are distributed
at the insertion point. **This location is known as the lower boundary**.

<blockquote class="commentary talkinghead">
Remember: styles defined in the host document continue to apply to nodes they target,
even when those nodes get distributed "inside" the Shadow DOM. Going into an
insertion point doesn't change what's applied.
</blockquote>

<h2 id="toc-conclusion">Conclusion</h2>

As authors of custom elements, we have a ton of options for controlling
the look and feel of our content. Shadow DOM forms the basis for this brave new world.

Shadow DOM gives us scoped style encapsulation and a means to let in as much (or as little)
of the outside world as we choose. By defining custom pseudo elements or including
CSS Variable placeholders, authors can provide third-parties convenient styling hooks
to further customize their content. All in all, web authors are in full control
of how their content is represented.

<p class="small-notice">
Thanks to <a href="/profiles/#dominiccooney">Dominic Cooney</a> and 
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> for reviewing
the content of this tutorial.
</p>


