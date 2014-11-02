This article discusses more of the amazing things you can do with Shadow DOM! It builds on the concepts discussed in [Shadow DOM 101](/tutorials/webcomponents/shadowdom/)
and [Shadow DOM 201](/tutorials/webcomponents/shadowdom-201/).

<p class="tip notice">In Chrome, turn on the "Enable experimental Web Platform features" in about:flags to experiment with everything covered in this article.</p>

<h2 id="toc-shadow-multiple">Using multiple shadow roots</h2>

If you're hosting a party, it gets stuffy if everyone is crammed into the same room.
You want the option of distributing groups of people across multiple rooms. Elements hosting
Shadow DOM can do this too, that is to say, they can host more than one shadow
root at a time.

Let's see what happens if we try to attach multiple shadow roots to a host:

<pre>
&lt;div id="example1">Light DOM&lt;/div>
&lt;script>
var container = document.querySelector('#example1');
var root1 = container.createShadowRoot();
var root2 = container.createShadowRoot();
root1.innerHTML = '&lt;div>Root 1 FTW&lt;/div>';
root2.innerHTML = '&lt;div>Root 2 FTW&lt;/div>';
&lt;/script>
</pre>

<div class="demodevtools"> 
<img src="stacking.png" title="Attaching multiple shadow trees" alt="Attaching multiple shadow trees" style="width:250px;">
</div>
<div class="demoarea">
  <div id="example1">Light DOM</div>
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

<p class="notice tip">In the DevTools, turn on "Show Shadow DOM" to be
  able to inspect ShadowRoots.</p>

What renders is "Root 2 FTW", despite the fact that we had already attached a shadow tree.
This is because the last shadow tree added to a host, wins. It's a LIFO stack as
far as rendering is concerned. Examining the DevTools verifies this behavior.

<p class="notice fact">Shadow trees added to a host are stacked in the order they're added,
starting with the most recent first. The last one added is the one that renders.</p>

<blockquote class="commentary talkinghead" id="youngest-tree">
The most recently added tree is called the <b>younger tree</b>. Previous trees are called <b>older trees</b>. In this example, <code>root2</code> is the younger tree and  <code>root1</code> is the older tree.
</blockquote>

So what's the point of using multiple shadows if only the last is invited to the
rendering party? Enter shadow insertion points.

<h3 id="toc-shadow-insertion">Shadow Insertion Points</h3>

"Shadow insertion points" (`<shadow>`) are similar to normal [insertion points](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`) in that they're placeholders. However, instead of being placeholders for a host's *content*, they're hosts for other *shadow trees*.
It's Shadow DOM Inception!

As you can probably imagine, things get more complicated the further you drill down
the rabbit hole. For this reason, the spec is very clear about what happens when
multiple `<shadow>` elements are in play:

<p class="notice fact">If multiple <code>&lt;shadow></code> insertion points exist
in a shadow tree, only the first is recognized. The rest are ignored.</p>

Looking back to our original example, the first shadow `root1` got left off the
invite list. Adding a `<shadow>` insertion point brings it back:

<pre class="prettyprint">
&lt;div id="example2">Light DOM&lt;/div>
&lt;script>
var container = document.querySelector('#example2');
var root1 = container.createShadowRoot();
var root2 = container.createShadowRoot();
root1.innerHTML = '&lt;div>Root 1 FTW&lt;/div>&lt;content>&lt;/content>';
<b>root2.innerHTML = '&lt;div>Root 2 FTW&lt;/div>&lt;shadow>&lt;/shadow>';</b>
&lt;/script>
</pre>

<div class="demodevtools"> 
<img src="shadow-insertion-point.png" title="Shadow insertion points" alt="Shadow insertion points" style="width:250px;">
</div>
<div class="demoarea">
  <div id="example2">Light DOM</div>
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
the <code>&lt;shadow></code> insertion point. If you want the reverse, move the insertion point: <code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code>.
- Notice there's now a `<content>` insertion point in root1. This makes
the text node "Light DOM" come along for the rendering ride.

<b id="toc-shadow-older">What's rendered at &lt;shadow&gt;?</b>

Sometimes it's useful to know the older shadow tree being rendered at a `<shadow>`. You can get a reference to that tree through `.olderShadowRoot`:

<pre class="prettyprint">
<b>root2.olderShadowRoot</b> === root1 //true
</pre>

<h2 id="toc-get-shadowroot">Obtaining a host's shadow root</h2>

If an element is hosting Shadow DOM you can access its [youngest shadow root](#youngest-tree)
using `.shadowRoot`:

<pre class="prettyprint">
var root = host.createShadowRoot();
console.log(host.shadowRoot === root); // true
console.log(document.body.shadowRoot); // null
</pre>

If you're worried about people crossing into your shadows, redefine
 `.shadowRoot` to be null:

<pre class="prettyprint">
Object.defineProperty(host, 'shadowRoot', {
  get: function() { return null; },
  set: function(value) { }
});</pre>

A bit of a hack, but it works. In the end, it's important to remember that while amazingly fantastic,
**Shadow DOM has not been designed to be a security feature**. Don't rely on it for
complete content isolation.

<h2 id="toc-creating-js">Building Shadow DOM in JS</h2>

If you prefer building DOM in JS, `HTMLContentElement` and `HTMLShadowElement`
have interfaces for that.

<pre class="prettyprint">
&lt;div id="example3">
  &lt;span>Light DOM&lt;/span>
&lt;/div>
&lt;script>
var container = document.querySelector('#example3');
var root1 = container.createShadowRoot();
var root2 = container.createShadowRoot();
  
var div = document.createElement('div');
div.textContent = 'Root 1 FTW';
root1.appendChild(div);

 // HTMLContentElement
<b>var content = document.createElement('content');
content.select = 'span';</b> // selects any spans the host node contains
root1.appendChild(content);

var div = document.createElement('div');
div.textContent = 'Root 2 FTW';
root2.appendChild(div);

// HTMLShadowElement
<b>var shadow = document.createElement('shadow');</b>
root2.appendChild(shadow);
&lt;/script>
</pre> 

This example is nearly identical to the one in the [previous section](#toc-shadow-insertion).
The only difference is that now I'm using `select` to pull out the newly added `<span>`.

<h2 id="toc-distributed-nodes">Working with insertion points</h2>

Nodes that are selected out of the host element and "distribute" into the shadow tree
are called...drumroll...distributed nodes! They're allowed to cross the shadow boundary
when insertion points invite them in.

What's conceptually bizarre about insertion points is that they don't physically
move DOM. The host's nodes stay intact. Insertion points merely re-project nodes
from the host into the shadow tree. It's a presentation/rendering thing: <s>"Move these nodes over here"</s> "Render these nodes at this location."

<p class="notice fact">You cannot traverse the DOM into a <code>&lt;content></code>.</p>

For example:

<pre class="prettyprint">
&lt;div>&lt;h2>Light DOM&lt;/h2>&lt;/div>
&lt;script>
var root = document.querySelector('div').createShadowRoot();
root.innerHTML = '&lt;content select="h2">&lt;/content>';

var h2 = document.querySelector('h2');
console.log(root.querySelector('content[select="h2"] h2')); // null;
console.log(root.querySelector('content').contains(h2)); // false
&lt;/script>
</pre>

Voilà! The `h2` isn't a child of the shadow DOM. This leads to another tid bit:

<blockquote class="commentary talkinghead">
Insertion points are incredibly powerful. Think of them as a way to create a
"declarative API" for your Shadow DOM. A host element can include all the markup in the world,
but unless I invite it into my Shadow DOM with an insertion point, it's meaningless.
</blockquote>

<h3 id="toc-getDistributedNodes">Element.getDistributedNodes()</h3>

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

var root = container.createShadowRoot();

var t = document.querySelector('#sdom');
var clone = document.importNode(t.content, true);
root.appendChild(clone);
  
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
  var t = document.querySelector('#sdom');
  var clone = document.importNode(t.content, true);
  root1.appendChild(clone);

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

<h3 id="toc-getDestinationInsertionPoints">Element.getDestinationInsertionPoints()</h3>

Similar to `.getDistributedNodes()`, you can check what insertion points
a node is distributed into by calling its `.getDestinationInsertionPoints()`:

    <div id="host">
      <h2>Light DOM</h2>
    </div>

    <script>
      var container = document.querySelector('div');

      var root1 = container.createShadowRoot();
      var root2 = container.createShadowRoot();
      root1.innerHTML = '<content select="h2"></content>';
      root2.innerHTML = '<shadow></shadow>';

      var h2 = document.querySelector('#host h2');
      var insertionPoints = h2.getDestinationInsertionPoints();
      [].forEach.call(insertionPoints, function(contentEl) {
        console.log(contentEl);
      });
    </script>

<div id="example5-gip" style="display:none">
  <h2>Light DOM</h2>
</div>

<div id="example5-getDestInsertinoPoints" class="demoarea">
 <textarea readonly></textarea>
</div>

<script>
(function() {
if (!!Element.prototype.getDestinationInsertionPoints) { 
  var container = document.querySelector('#example5-gip');
  var h2 = container.querySelector('h2');

  var root1 = container.createShadowRoot();
  var root2 = container.createShadowRoot();
  root1.innerHTML = '<content select="h2"></content>';
  root2.innerHTML = '<shadow></shadow>';

  var html = [];
  var insertionPoints = h2.getDestinationInsertionPoints();
  [].forEach.call(insertionPoints, function(contentEl) {
    html.push(contentEl.outerHTML);
    html.push('\n');
  });

  document.querySelector('#example5-getDestInsertinoPoints textarea').value = html.join('');
}
})();
</script>

<h2 id="toc-shadow-visualizder">Tool: Shadow DOM Visualizer</h2>

Understanding the black magic that is Shadow DOM is difficult. I remember trying
to wrap my head around it for the first time.

To help visualize how Shadow DOM rendering works, I've built a tool
using [d3.js](http://d3js.org/). Both markup boxes on the left-hand side are
editable. Feel free to paste in your own markup and play around to see how things
work and insertion points swizzle host nodes into the shadow tree.

<figure>
<a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html"><img src="visualizer.png" title="Shadow DOM Visualizer" alt="Shadow DOM Visualizer"></a>
<figcaption><a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html">Launch Shadow DOM Visualizer</a></figcaption>
</figure>

<p>
<iframe width="420" height="315" src="http://www.youtube.com/embed/qnJ_s58ubxg" frameborder="0" allowfullscreen></iframe>
</p>

Give it a try and let me know what you think!

<h2 id="toc-events">Event Model</h2>

Some events cross the shadow boundary and some do not. In the cases where events
cross the boundary, the event target is adjusted in order to maintain the
encapsulation that the shadow root's upper boundary provides. That is, **events
are retargeted to look like they've come from the host element rather than internal
elements to the Shadow DOM**.

<p class="tip notice">Access <code>event.path</code> to see the adjusted event path.</p>

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
    ::content * {
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

wrapper.addEventListener('animationend', function(e) {
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

I hope you'll agree that **Shadow DOM is incredibly powerful**. For the first time ever, we have proper encapsulation without the extra baggage of `<iframe>`s or other older techniques. 

Shadow DOM is certainly complex beast, but it's a beast worth adding to the web platform.
Spend some time with it. Learn it. Ask questions.

If you want to learn more, see Dominic's intro article [Shadow DOM 101](/tutorials/webcomponents/shadowdom/)
and my [Shadow DOM 201: CSS &amp; Styling](/tutorials/webcomponents/shadowdom-201/) article.

<p class="small-notice">
Thanks to <a href="/profiles/#dominiccooney">Dominic Cooney</a> and 
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> for reviewing
the content of this tutorial.
</p>


