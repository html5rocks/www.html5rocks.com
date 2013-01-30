{% include "warning.html" %}

<h2 id="toc-intro">Introduction</h2>

This article discusses more of the amazing things you can do with ShadowDOM, more
of its JS and declarative APIs, styling options, and more. It builds on the concepts discussed in [Shadow DOM 101](/tutorials/webcomponents/shadowdom/). For an introduction to ShadowDOM and its language, see [Dominic Cooney](/profiles/#dominiccooney)'s most excellent article.

<h2 id="toc-shadow-multiple">Using Multiple Shadow Roots</h2>

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

<blockquote class="commentary talkinghead">
The most recently added tree is called the <b>younger tree</b>, while the more
recent one is called the <b>older tree</b>. In this example, <code>root2</code>
is the younger tree and  <code>root1</code>, the older tree.
</blockquote>

<p class="notice"><b>Rule 1</b>: Shadow trees added to a host are stacked in the order they're added,
starting with the most recent first. The last one added is the one that renders.</p>

Then what's the point of using multiple shadows if only the last is invited to the party?

<h3 id="toc-shadow-insertion">Shadow Insertion points</h3>

"Shadow insertion points" (`<shadow>`) are similar to [insertion points](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`)
in that they're placeholders. However, unlike regular insertion points, which
selectively funnel and render the *content* of a host into a shadow tree,
shadow insertion points are hosts for other *shadow trees*. It's Shadow DOM Inception!

As you can probably imagine, things get more complicated the farther you drill down
the rabbit hole. For this reason, the spec is clear about what should happen with
multiple `<shadow>`s:

<p class="notice"><b>Rule 2</b>: If multiple <code>&lt;shadow></code> insertion points exist
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

<b id="toc-shadow-older">What was rendered at &lt;shadow&gt;?</b>

Sometimes it's useful to actually know the (shadow) tree that was rendered at a
`<shadow>` insertion point. You can get a reference to that tree through `.olderShadowRoot`:

<pre class="prettyprint">
<b>root2.querySelector('shadow').olderShadowRoot</b> === root1 //true
</pre>

<h2 id="toc-dom-apis">DOM APIs</h2>

As with existing parts of the web platform, there are DOM interfaces for creating
`HTMLContentElement` and `HTMLShadowElement` as well as other APIs and properties
to make scripting easier.

<h3 id="toc-creating-js">Building ShadowDOM in JS</h3>

Here's a near identical example from the previous section:

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
content.select = '*';</b> // selects all of host's nodes (e.g. the &lt;span>)
root1.appendChild(content);

var div = document.createElement('div');
div.textContent = 'Root 2 FTW';
root2.appendChild(div);

<b>var shadow = document.createElement('shadow'); // HTMLShadowElement</b>
root2.appendChild(shadow);
&lt;/script>
</pre> 

The only difference is the use of the `select` attribute on the `<content>` element
to pull out the newly added `<span>`.

<h3 id="toc-distributed-nodes">Getting Distributed Nodes</h3>

Nodes which are selected out of host element and funneled into the shadow tree
are called distributed nodes. They're allowed to cross the shadow boundary and
"distribute" themselves into our Shadow DOM thanks to insertion points. Insertion
points are a means by which the author of a complex Shadow DOM can create a
declarative API for the outside world.

<blockquote class="commentary talkinghead">
Insertion points are incredibly power. Your host element can include all the markup in the world,
but unless I allow it into my Shadow DOM (using insertion points), it's meaningless.
Insertion points are your way into my world!
</blockquote>

We can access an insertion point's distributed nodes with `.getDistributedNodes()`:

<pre class="prettyprint">
&lt;div id="example4">
  &lt;h2>Eric&lt;/h2>
  &lt;h2>Bidelman&lt;/h2>
  &lt;div>Digital Jedi&lt;/div>
  &lt;h4>footer text&lt;/h4>
&lt;/div>

&lt;template id="sdom">
  &lt;style>
    section {
      padding: 10px;
      background: #fff;
    }
    header {
      display: -webkit-flex;
    }
  &lt;/style>
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

var root1 = container.webkitCreateShadowRoot();
root1.appendChild(document.querySelector('#sdom').content.cloneNode(true));
  
[].forEach.call(root1.querySelectorAll('content'), function(el) {
  console.log(el.outerHTML);
  var nodes = el.getDistributedNodes();
  [].forEach.call(nodes, function(node) {
    console.log('  ', node);
  });
});
&lt;/script>
</pre>

<div class="demodevtools"> 
<img src="" title="" alt="" style="width:200px;">
</div>
<div class="demoarea">
  <div id="example4">
    <h2>Eric</h2>
    <h2>Bidelman</h2>
    <div>Digital Jedi</div>
    <h4>footer text</h4>
  </div>

  <template id="sdom">
    <style>
      section {
        padding: 10px;
        background: #fff;
      }
      header {
        display: -webkit-flex;
      }
    </style>
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
</div>

<div>
 <textarea id="example4-log" readonly style="outline:none;border:none;width:300px;height:120px;resize:none;padding:10px;"></textarea>
</div>

<table>
  <tr><th>one</th><th>two</th></tr>
  <tr><td>asdf</td></tr>
</table>

<script>
(function() {
var container = document.querySelector('#example4');

var root1 = container.createShadowRoot();
//root1.applyAuthorStyles = false;
//root1.resetStyleInheritance = true;
root1.appendChild(document.querySelector('#sdom').content.cloneNode(true));

root1.applyAuthorStyles = false;
root1.resetStyleInheritance = true;

var html = [];
[].forEach.call(root1.querySelectorAll('content'), function(el) {
  html.push(el.outerHTML);
  var nodes = el.getDistributedNodes();
  [].forEach.call(nodes, function(node) {
    html.push('  ' + node.outerHTML);
  });
});

document.querySelector('#example4-log').value = html.join('\n');

})();
</script>

<h3 id="toc-get-shadowroot">Getting the host's ShadowRoot</h3>

`host.webkitShadowRoot`

<h2 id="toc-style-encapsulation">Styling</h2>

Style encapsulation by default
Scoped styles by default

http://html5-demos.appspot.com/static/webcomponents/index.html#30

<h3 id="toc-style-outside">Protection from the outside</h3>

Don't let strangers in.

http://html5-demos.appspot.com/static/webcomponents/index.html#31

<h3 id="toc-style-inheriting">Inheriting styles from the outside world</h3>

Don't let strangers in.

<h2 id="toc-style-disbtributed-nodes">Styling distributed nodes at insertion points</h2>

`content::disributed()`

<h2 id="toc-style-host">Styling the host element</h2>

@host

<h2 id="toc-style-hooks">Creating style hooks</h2>

blah

<h3 id="toc-custom-pseduo">Using custom pseudo elements</h3>

Blah

<h3 id="toc-vars">Using CSS Variables</h3>

Blah


<h2 id="toc-conclusion">Conclusion</h2>

Blah


