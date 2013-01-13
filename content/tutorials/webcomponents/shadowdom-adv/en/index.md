{% include "warning.html" %}

<h2 id="toc-intro">Introduction</h2>

This article discusses more of the amazing things you can do with ShadowDOM, more
of its JS and declarative APIs, styling options, and more. It builds on the concepts discussed in [Shadow DOM 101](/tutorials/webcomponents/shadowdom/). For an introduction to ShadowDOM and its language, see [Dominic Cooney](/profiles/#dominiccooney)'s most excellent article.

<h2 id="toc-shadow-inception">Shadow DOM Inception</h2>

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

A couple of observations about this:

1. "Root 2 FTW" still renders above "Root 1 FTW" because of where we've placed
the <code>&lt;shadow></code>. If we wanted the reverse, move the insertion point: <code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code>.
- Notice I've added a `<content>` insertion point to root1. This makes
"Host node" come along for the ride.

<h3 id="toc-shadow-insertion-implicit">DOM Interfaces</h3>

As with existing parts of the web platform, there are DOM interfaces if you
prefer going the implicit route:

<pre class="prettyprint">
&lt;div id="example3">&lt;span>Host node&lt;/span>&lt;/div>
&lt;script>
var container = document.querySelector('#example2');
var root1 = container.webkitCreateShadowRoot();
var root2 = container.webkitCreateShadowRoot();
  
var div = document.createElement('div');
div.textContent = 'Root 1 FTW';
root1.appendChild(div);

<b>var content = document.createElement('content'); // HTMLContentElement
content.select = '*';</b>
root1.appendChild(content);

var div = document.createElement('div');
div.textContent = 'Root 2 FTW';
root2.appendChild(div);

<b>var shadow = document.createElement('shadow'); // HTMLShadowElement</b>
root2.appendChild(shadow);
&lt;/script>
</pre> 

`HTMLShadowElement.olderShadowRoot` returns the shadow tree rendered in place the
`<shadow>` insertion point:

<pre class="prettyprint">
console.log(<b>shadow.olderShadowRoot === root1</b>) // true
console.log(<b>root2.querySelector('shadow').olderShadowRoot</b> === root1) //true
&lt;/script>
</pre>

shadow insertion point.

`content.getDistributedNodes()`

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


