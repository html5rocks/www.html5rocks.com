{% include "warning.html" %}

This article discusses more of the amazing things you can do with Shadow DOM.
It builds on the concepts discussed in [Shadow DOM 101](/tutorials/webcomponents/shadowdom/).
If you're looking for an introduction, see [Dominic Cooney](/profiles/#dominiccooney)'s most [excellent article](/tutorials/webcomponents/shadowdom/).

<h2 id="toc-intro">Introduction</h2>

Let's face it. There's nothing sexy about unstyled markup. Lucky for us, [the brilliant folks behind Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#acknowledgements)
foresaw this and didn't leave us hanging. There are a number of options when it
comes to styling the content in a shadow tree.

<h2 id="toc-style-scoped">Style encapsulation</h2>

One of the core features of Shadow DOM is the [shadow boundary](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#shadow-trees). It's got a lot of nice properties,
but one of the best is that it provides style encapsulation for free. Stated another way:

<p class="notice fact">By default, CSS styles defined in Shadow DOM are scoped to its shadow root.</p>

Below is an example. If all goes well and your browser supports Shadow DOM (it does<span class="featuresupported no">n't</span>!), you'll see "Shadow DOM Title" in red.

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

There are two interesting observations worth noting:

- Even though there are
<a href="javascript:alert('There are ' + document.querySelectorAll('h3').length + ' &#60;h3&#62; on this page.')">other h3s on this page</a>, the only one that matches my h3 selector, and therefore styled
red, is the one in the shadow root. Again, scoped styles by default.
- The h3 style rules defined by this page don't bleed into my content. Outside
styles don't cross the shadow boundary unless you let them.

Moral of the story: we have style encapsulation from the outside world. Thanks Shadow DOM!

<h2 id="toc-style-host">Styling the host element</h2>

The `@host` [at-rule](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/shadow/index.html#host-at-rule) allows you to select and style the element hosting your Shadow DOM:

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

One gotcha is that rules wrapped in an `@host` have higher specificity than
any selector in the parent page, but a lower specificity than a `style` attribute
defined on the host element. Another gotcha is that it only works in the context
of a shadow root. You can't use `@host{}` outside of Shadow DOM.

A common use case for `@host` is if you're creating a custom element and you
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

In this example, I've used "*" to select any type of element. Basically, I don't care
what type of element is hosting me. Just style it!

Another need for `@host` is if you're creating a custom element and want to be
able to style multiple types of hosts from within the same Shadow DOM or you're
linking in a style sheet for theming.

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
        /* Applies to any type of element hosting this shadow root. */
      }
    }

<h2 id="toc-style-hooks">Creating style hooks</h2>

Customization is good. In certain cases, you want to poke holes in your
shadow boundary styling shield to create styling hooks for others tap in to.

<h3 id="toc-custom-pseduo">Using custom pseudo elements</h3>

Both [WebKit](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css?format=txt) and
[Firefox](https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference/Mozilla_Extensions#Pseudo-elements_and_pseudo-classes) define pseudo elements to style internal pieces of native browser elements. A good example
is the `input[type=range]`. You can style the slider thumb <span style="color:blue">blue</span> by targeting `::-webkit-slider-thumb`:

    input[type=range].custom::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: blue;
      width: 10px;
      height: 40px;
    }

Similar to WebKit/FF providing styling hooks into their internal elements,
authors of Shadow DOM content can designate certain elements as styleable by
outsiders. This is done through custom pseudo elements.

The name of a custom pseudo element needs to be prefixed with "x-". Doing so creates
an association with that element in the shadow tree and allows outsiders another
way to cross the shadow boundary.

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

Another powerful way to create theming hooks will be through [CSS Variables](http://dev.w3.org/csswg/css-variables/).
Essentially, you create "style placeholders" for others to fill in.

A possible scenario might be a custom element author defining variable placeholders
in their Shadow DOM. One for styling an internal button's font and another for
its color:

    button {
      color: {% mixin var(button-text-color, pink) %} /* default color will be pink */
      font: {% mixin var(button-font) %}
    }

Then, the embedder of the element defines those values to their liking, perhaps
to match the awesome Comic Sans theme of their own page:

    #host {
      {% mixin var-button-text-color: green %}
      {% mixin var-button-font: "Comic Sans MS", "Comic Sans", cursive %}
    }

Due to the way CSS variables inherit, everything is peachy and this
works beautifully!

The whole picture looks like this:

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
A prime example is a commenting widget. Most authors embedding said widget
probably want the thing to look like it belongs on the page. I know I would.
Basically, we need a way to take on the look and feel of the page by inheriting
the host's styles (fonts, colors, line-height, etc.).

For flexibility, Shadow DOM allows us to poke holes in its style shield.
There are two properties to control what gets in:

- **.resetStyleInheritance**
    - `false` - Default. [inheritable CSS properties](http://www.impressivewebs.com/inherit-value-css/) continue to inherit.
    - `true` - resets inheritable properties to `initial` at the boundary.
- **.applyAuthorStyles**
    - `true` - styles defined in the author's document are applied. This of this
    as allowing styles to "bleed" across the boundary.
    - `false` - Default. Author styles are not applied to the shadow tree.

Below is a demo for seeing how a shadow tree is effected by changing this properties.

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

You can easily see how `.applyAuthorStyles` works. It makes the h3 in the shadow root
take on the look of the other h3s on this page. Thus, "applying the page author's styles".
Author being the author of the page.

<p class="notice fact">Even with the <code>apply-author-styles</code> attribute set,
CSS selectors defined in the document do not cross the shadow boundary.
<b>Style rules only match when they're entirely inside or outside of the shadow tree.</b></p>

<img src="showinheritance.gif" title="DevTools inherited properties" alt="DevTools inherited properties" style="height:215px;border:1px solid #ccc;float:right;margin-left:10px;">

Understanding `.resetStyleInheritance` is a bit trickier, primarily because it
only has an effect on CSS properties which are inheritable. It says: when
you're looking for a property to inherit, at the boundary between the page and
the ShadowRoot, don't inherit values from the host but use the `initial`
value (per the CSS spec) instead.

If you're unsure about which properties inherit in CSS, check out [this handy list](http://www.impressivewebs.com/inherit-value-css/) check the "Show inherited"
checkbox in the Element panel.

<b id="style-inherit-cheetsheet">Scenario cheatsheet for applyAuthorStyles/resetStyleInheritance</b>

To better understand when you might use these properties, below is a decision matrix.
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
styling of the nodes defined in the Shadow DOM. 

Distributed nodes are a different beast because they're not logically in the
Shadow DOM; they're still children of the host element and are swizzled into place at "render time."
Naturally, they get their styles from the document they're in (the host's document).
The only exception to that is they might gain additional styles from the place
they have been swizzled into (the Shadow DOM).

<b id="toc-distributed">::distributed() pseudo element</b>

Distributed nodes are children of the host element. How then do we target + style
them from within the Shadow DOM? The answer is the `::distributed()` pseudo element. It's the
first-ever *functional* pseudo element. It's parameter is a CSS selector.

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
"Host title" still retains the styles from its document; in this case, the page.

<h3 id="toc-shadow-resetstyles">Resetting styles at insertion points</h3>

When creating a ShadowRoot, you have the option of resetting the inherited styles.
`<content>` and `<shadow>` insertion points ([see below](#toc-shadow-insertion)) also have this option. When creating
these element, either set the `.resetStyleInheritance` in JS or use the boolean
`reset-style-inheritance` attribute on the element itself.

- For ShadowRoot or `<shadow>` insertion points: `reset-style-inheritance`
means inheritable CSS properties are set to `initial` at the host, before the
shadow root. **Also known as the upper boundary**.

- For `<content>` insertion points: `reset-style-inheritance` means inheritable
CSS properties are set to `initial` before the host's children are distributed
at the insertion point. **Also known as the lower boundary**.

<blockquote class="commentary talkinghead">
Remember: styles defined in the host document continue to apply to those nodes,
even when they're distributed "inside" the Shadow DOM. Going into an
insertion point doesn't change that.
</blockquote>

<h2 id="toc-shadow-multiple">Using multiple shadow roots</h2>

If you're hosting a party, it gets stuffy if everyone is crammed into the same room.
You want the option of distributing groups of people across multiple rooms. Elements hosting
Shadow DOM can do this too, that is to say, they can host more than one shadow
root at a time.

Let's see what happens if we try to attach multiple shadow roots to a host:

<pre>
&lt;div id="example1">Host node&lt;/div>
&lt;script>
var container = document.querySelector('#example1');
var root1 = container.webkitCreateShadowRoot();
var root2 = container.webkitCreateShadowRoot();
root1.innerHTML = '&lt;div>Root 1 FTW&lt;/div>';
root2.innerHTML = '&lt;div>Root 2 FTW&lt;/div>';
&lt;/script>
</pre>

<div class="demodevtools"> 
<img src="stacking.png" title="Attaching multiple shadow trees" alt="Attaching multiple shadow trees" style="width:200px;">
</div>
<div class="demoarea">
  <div id="example1">Host node</div>
</div>
<script>
(function() {
var container = document.querySelector('#example1');
var root1 = container.createShadowRoot();
var root2 = container.createShadowRoot();
root1.innerHTML = '<div>Root 1 FTW</div>';
root2.innerHTML = '<div>Root 2 FTW</div>';
})();
</script>

What renders is "Root 2 FTW", despite the fact that we added root2 last.
This is because the last shadow tree added to a host, wins. It's a LIFO stack as
far as rendering is concerned. Examining the DevTools verifies things.

<blockquote class="commentary talkinghead" id="youngest-tree">
The most recently added tree is called the <b>younger tree</b>, while the more
recent one is called the <b>older tree</b>. In this example, <code>root2</code>
is the younger tree and  <code>root1</code>, the older tree.
</blockquote>

<p class="notice fact">Shadow trees added to a host are stacked in the order they're added,
starting with the most recent first. The last one added is the one that renders.</p>

So what's the point of using multiple shadows? Only the last is invited to the party.

<h3 id="toc-shadow-insertion">Shadow Insertion Points</h3>

"Shadow insertion points" (`<shadow>`) are similar to [insertion points](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`)
in that they're placeholders. However, unlike regular insertion points, which
selectively funnel and render the *content* of a host into a shadow tree,
shadow insertion points are hosts for other *shadow trees*. It's Shadow DOM Inception!

As you can probably imagine, things get more complicated the farther you drill down
the rabbit hole. For this reason, the spec is clear about what should happen with
multiple `<shadow>`s:

<p class="notice fact">If multiple <code>&lt;shadow></code> insertion points exist
in a shadow tree, only the first is recognized. The rest are ignored.</p>

Looking back to our original example, the first shadow `root1` got left off the
invite list. Adding a `<shadow>` insertion point brings it back:

<pre class="prettyprint">
&lt;div id="example2">Host node&lt;/div>
&lt;script>
var container = document.querySelector('#example2');
var root1 = container.webkitCreateShadowRoot();
var root2 = container.webkitCreateShadowRoot();
root1.innerHTML = '&lt;div>Root 1 FTW&lt;/div>&lt;content>&lt;/content>';
<b>root2.innerHTML = '&lt;div>Root 2 FTW&lt;/div>&lt;shadow>&lt;/shadow>';</b>
&lt;/script>
</pre>

<div class="demodevtools"> 
<img src="shadow-insertion-point.png" title="Shadow insertion points" alt="Shadow insertion points" style="width:200px;">
</div>
<div class="demoarea">
  <div id="example2">Host node</div>
</div>
<script>
(function() {
var container = document.querySelector('#example2');
var root1 = container.createShadowRoot();
var root2 = container.createShadowRoot();
root1.innerHTML = '<div>Root 1 FTW</div><content></content>';
root2.innerHTML = '<div>Root 2 FTW</div><shadow></shadow>';
})();
</script>

There are a couple of interesting things about this example:

1. "Root 2 FTW" still renders above "Root 1 FTW". This is because of where we've placed
the <code>&lt;shadow></code> insertion piont. If we wanted the reverse, move the insertion point: <code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code>.
- Notice there's now a `<content>` insertion point in root1. This makes
the text node "Host node" come along for the rendering ride.

<b id="toc-shadow-older">What's rendered at &lt;shadow&gt;?</b>

Sometimes it's useful to actually know the (shadow) tree that was rendered at a
`<shadow>` insertion point. You can get a reference to that tree through `.olderShadowRoot`:

<pre class="prettyprint">
<b>root2.querySelector('shadow').olderShadowRoot</b> === root1 //true
</pre>

`.olderShadowRoot` isn't vendor prefixed because `HTMLShadowElement`s only makes
sense in the context of Shadow DOM...which is already prefixed :)

<h2 id="toc-dom-apis">DOM APIs</h2>

As with other parts of the web platform, we have DOM APIs and properties
to make our scripting life easier.

<h3 id="toc-get-shadowroot">Obtain a host's shadow root</h3>

If an element is hosting Shadow DOM, you can access it's [youngest shadow root](#youngest-tree) with
`.webkitShadowRoot`:

<pre class="prettyprint">
var root = host.webkitCreateShadowRoot();
console.log(host.webkitShadowRoot === root); // true
console.log(document.body.webkitShadowRoot); // null
</pre>

I'm not even sure why `.shadowRoot` is spec'd. It defeats the encapsulation
principles of Shadow DOM and gives outsiders an outlet for traversing into my
supposed-to-be-hidden DOM.

If you're worried about people crossing into your shadows, redefine
 `.shadowRoot` to be null. A bit of a hack, but it works:

<pre class="prettyprint">
Object.defineProperty(host, 'webkitShadowRoot', {
  get: function() { return null; },
  set: function(value) { }
});</pre>

In the end, it's important to remember that while amazingly fantastic,
**Shadow DOM wasn't designed to be a security feature**. Don't rely on it for
complete content isolation.

<h3 id="toc-creating-js">Building Shadow DOM in JS</h3>

If you prefer to building Shadow DOM in JS, `HTMLContentElement` and `HTMLShadowElement`
have interfaces for that.

<pre class="prettyprint">
&lt;div id="example3">
  &lt;span>Host node&lt;/span>
&lt;/div>
&lt;script>
var container = document.querySelector('#example3');
var root1 = container.webkitCreateShadowRoot();
var root2 = container.webkitCreateShadowRoot();
  
var div = document.createElement('div');
div.textContent = 'Root 1 FTW';
root1.appendChild(div);

<b>var content = document.createElement('content'); // HTMLContentElement
content.select = 'span';</b> // selects any spans the host node contains
root1.appendChild(content);

var div = document.createElement('div');
div.textContent = 'Root 2 FTW';
root2.appendChild(div);

<b>var shadow = document.createElement('shadow'); // HTMLShadowElement</b>
root2.appendChild(shadow);
&lt;/script>
</pre> 

This example is nearly identical to the one in the [previous section](#toc-shadow-insertion).
The only difference is that I'm now using `select` to pull out the new `<span>`.

<h3 id="toc-distributed-nodes">Fetching distributed nodes</h3>

Nodes that are selected out of host element and "distribute" into the shadow tree
are called,...drumroll...distributed nodes! They're allowed to cross the shadow boundary
when insertion points invite them.

<blockquote class="commentary talkinghead">
Insertion points are incredibly powerful. Think of them as a way to create a
"declarative API" for your Shadow DOM. A host element can include all the markup in the world,
but unless I invite it into my Shadow DOM with an insertion point, it's meaningless.
</blockquote>

What's conceptually bizarre about insertion points is that they don't physically
move DOM. The host's nodes stay intake. Insertion points merely re-project nodes
from the host into the shadow tree. It's a presentation/rendering thing: <s>"Move these nodes over here"</s> "Render these nodes at this location."

<p class="notice fact">You cannot traverse the DOM into a <code>&lt;content></code>.</p>

For example:

<pre class="prettyprint">
&lt;div>&lt;h2>Host node&lt;/h2>&lt;/div>
&lt;script>
var shadowRoot = document.querySelector('div').webkitCreateShadowRoot();
shadowRoot.innerHTML = '&lt;content select="h2">&lt;/content>';

var h2 = document.querySelector('h2');
console.log(shadowRoot.querySelector('content[select="h2"] h2')); // null;
console.log(shadowRoot.querySelector('content').contains(h2)); // false
&lt;/script>
</pre>

Voilà! The `h2` isn't a child of the shadow DOM.

**getDistributedNodes()**

We can't traverse into a `<content>`, but the `.getDistributedNodes()` API
allows us to query the distributed nodes at an insertion point:

<pre class="prettyprint">
&lt;div id="example4">
  &lt;h2>Eric&lt;/h2>
  &lt;h2>Bidelman&lt;/h2>
  &lt;div>Digital Jedi&lt;/div>
  &lt;h4>footer text&lt;/h4>
&lt;/div>

&lt;template id="sdom">
  &lt;header>
    &lt;content select="h2">&lt;/content>
  &lt;/header>
  &lt;section>
    &lt;content select="div">&lt;/content>
  &lt;/section>
  &lt;footer>
    &lt;content select="h4:first-of-type">&lt;/content>
  &lt;/footer>
&lt;/template>

&lt;script>
var container = document.querySelector('#example4');

var root = container.webkitCreateShadowRoot();
root.appendChild(document.querySelector('#sdom').content.cloneNode(true));
  
var html = [];
[].forEach.call(root.querySelectorAll('content'), function(el) {
  html.push(el.outerHTML + ': ');
  var nodes = el.getDistributedNodes();
  [].forEach.call(nodes, function(node) {
    html.push(node.outerHTML);
  });
  html.push('\n');
});
&lt;/script>
</pre>

<div id="example4" style="display:none">
  <h2>Eric</h2>
  <h2>Bidelman</h2>
  <div>Digital Jedi</div>
  <h4>footer text</h4>
</div>

<template id="sdom">
  <header>
    <content select="h2"></content>
  </header>
  <section>
    <content select="div"></content>
  </section>
  <footer>
    <content select="h4:first-of-type"></content>
  </footer>
</template>

<div id="example4-log" class="demoarea">
 <textarea readonly></textarea>
</div>

<script>
(function() {
if ('HTMLTemplateElement' in window) {
  var container = document.querySelector('#example4');

  var root1 = container.createShadowRoot();
  //root1.applyAuthorStyles = false;
  //root1.resetStyleInheritance = true;
  root1.appendChild(document.querySelector('#sdom').content.cloneNode(true));

  var html = [];
  [].forEach.call(root1.querySelectorAll('content'), function(el) {
    html.push(el.outerHTML + ': ');
    var nodes = el.getDistributedNodes();
    [].forEach.call(nodes, function(node) {
      html.push(node.outerHTML);
    });
    html.push('\n');
  });

  document.querySelector('#example4-log textarea').value = html.join('');
}
})();
</script>

<h2 id="toc-shadow-visualizder">Tool: Shadow DOM Visualizer</h2>

Understanding the black magic that is Shadow DOM is difficult. I remember trying
to wrap my head around it.

To help visualize how host nodes render at insertion points, I've built a tool
using [d3.js](http://d3js.org/). Give it a try and let me know what you think!
Both markup boxes on the left-hand side are editable. Feel free to paste in your
own markup and play around to see how things work.

<figure>
<a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html"><img src="visualizer.png" title="Shadow DOM Visualizer" alt="Shadow DOM Visualizer"></a>
<figcaption><a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html">Launch Shadow DOM Visualizer</a></figcaption>
</figure>

<h2 id="toc-events">Event Model</h2>

Some events cross the shadow boundary and some do not. In the cases where events
cross the boundary, the event target is adjusted in order to maintain the
encapsulation that the shadow root's upper boundary provides. That is, **events
are retargeted to look like they've come from the host element rather than internal
elements to the Shadow DOM**.

If your browser supports Shadow DOM (it does<span class="featuresupported no">n't</span>),
you should see a play area below that helps visualize events. Elements in <span style="color:#ffcc00">yellow</span> are part of the Shadow DOM's markup. Elements in <span style="color:steelblue">blue</span> are
part of the host element. The <span style="color:#ffcc00">yellow</span> border
around "I'm a node in the host" signifies that it is a distributed node, passing
through the shadow's `<content>` insertion point.

The "Play Action" buttons show you different things to try. Give them a go to see
how the `mouseout` and `focusin` events bubble up to the main page.

<div id="example5" class="demoarea">
  <div data-host>
    <div class="blue">I'm a node in the host</div>
  </div>

  <template style="display:none;"> <!-- display:none used for older browsers -->
    <style>
    .scopestyleforolderbrowsers * {
      border: 4px solid #FC0;
    }
    .scopestyleforolderbrowsers input {
      padding: 5px;
    }
    .scopestyleforolderbrowsers div {
      background: #FC0;
      padding: 5px;
      border-radius: 3px;
      margin: 5px 0;
    }
    content::-webkit-distributed(*) {
      border: 4px solid #FC0;
    }
    </style>
    <section class="scopestyleforolderbrowsers">
      <div>I'm a node in Shadow DOM</div>
      <div>I'm a node in Shadow DOM</div>
      <content></content>
      <input type="text" placeholder="I'm in Shadow DOM">
      <div>I'm a node in Shadow DOM</div>
      <div>I'm a node in Shadow DOM</div>
    </section>
  </template>

  <aside class="cursor"></aside>

  <div class="buttons">
    <button data-action="playAnimation" data-action-idx="1">Play Action 1</button><br>
    <button data-action="playAnimation" data-action-idx="2">Play Action 2</button><br>
    <button data-action="playAnimation" data-action-idx="3">Play Action 3</button><br>
    <button data-action="clearLog">Clear log</button>
  </div>

  <output></output>
</div>
    
<script>
(function() {
function stringify(node) {
  return node.outerHTML.match(".*?>")[0].replace('<', '&lt;').replace('>', '&gt;');
}

var out = document.querySelector('#example5 output');
var host = document.querySelector('#example5 [data-host]');
var wrapper = document.querySelector('#example5');

var root = host.createShadowRoot();
root.innerHTML = document.querySelector('#example5 template').innerHTML;

host.addEventListener('mouseout', function(e) {
  out.innerHTML += [
    '<span>[' + e.type + ']</span>', 
    'on:', stringify(e.target) + ',', 
    'from', stringify(e.fromElement),
    '&rarr;', stringify(e.toElement), '<br>'].join(' ');
  out.scrollTop = out.scrollHeight;
});

document.addEventListener('focusin', function(e) {
  out.innerHTML += [
    '<span>[' + e.type + ']</span>',
    'on:', stringify(e.target), '<br>'].join(' ');
  out.scrollTop = out.scrollHeight;
});

function clearLog() {
  out.innerHTML = '';
}

function cleanUpAnimations(node) {
  [].forEach.call(node.classList, function(c) {
    if (c.indexOf('animation') == 0) {
      node.classList.remove(c);
    }
  });
}

function playAnimation(idx) {
  clearLog();
  wrapper.classList.add('playing');
  wrapper.classList.add('animation' + idx);
}

wrapper.addEventListener('webkitAnimationEnd', function(e) {
  this.classList.remove('playing');
  cleanUpAnimations(this);
});

document.querySelector('#example5 .buttons').addEventListener('click', function(e) {
  if (e.target.tagName == 'BUTTON') {
    switch(e.target.dataset.action) {
      case 'clearLog':
        clearLog();
        break;
      case 'playAnimation':
        cleanUpAnimations(wrapper);
        playAnimation(parseInt(e.target.dataset.actionIdx));
        break;
      default:
        break;
    }
  }
});

})();
</script>

**Play Action 1**

- This one is interesting. You should see a `mouseout` from the host element (`<div data-host>`)
to the <span style="color:steelblue">blue</span> node. Even though it's a distributed
node, it's still in the host, not the ShadowDOM. Mousing further down into 
<span style="color:#ffcc00">yellow</span> again causes a `mouseout` on the <span style="color:steelblue">blue</span> node.

**Play Action 2**

- There is one `mouseout` that appears on host (at the very end). Normally you'd
see `mouseout` events trigger for all of the <span style="color:#ffcc00">yellow</span> blocks.
However, in this case these elements are internal to the Shadow DOM and the event
doesn't bubble through its upper boundary.

**Play Action 3**

- Notice that when you click the input, the `focusin` doesn't appear on the
input but on the host node itself. It's been retargeted!

<h3 id="toc-events-stopped">Events that are always stopped</h3>

The following events never cross the shadow boundary:

- abort
- error
- select
- change
- load
- reset
- resize
- scroll
- selectstart

<h2 id="toc-conclusion">Conclusion</h2>

Todo

<p class="small-notice">
Thanks to <a href="/profiles/#dominiccooney">Dominic Cooney</a> and 
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> for reviewing
the content of this tutorial.
</p>


