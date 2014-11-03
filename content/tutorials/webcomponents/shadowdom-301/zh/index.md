{% include "warning.html" %}

本文将讨论更多有关 Shadow DOM 应用的精彩内容！文中内容基于在 [Shadow DOM 101](/tutorials/webcomponents/shadowdom/)
和 [Shadow DOM 201](/tutorials/webcomponents/shadowdom-201/) 中讨论的概念。

<p class="tip notice">在 Chrome 中，开启 about:flags 页面中的"Enable experimental Web Platform features"就可以体验本文介绍的所有内容。</p>

<h2 id="toc-shadow-multiple">使用多个 shadow root</h2>

假如你举办了一场聚会，要是把所有人都聚集在同一间屋子里会显得拥挤不堪。你希望能将人们按组分散到不同的房间内。托管 Shadow DOM 的元素也具有这样的能力，也就是说，宿主元素能够在同一时间内托管多个 shadow root。

让我们来试着将多个 shadow root 托管到同一个宿主元素里会发生什么：

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

<p class="notice tip">在开发者工具中，开启 "Show Shadow DOM" 以便观察 ShadowRoots。</p>

尽管我们已经为宿主元素附加上了一个 shadow 树，但最终显示的内容却是 "Root 2 FTW"。这是因为最后被加入到宿主元素中的 shadow 树获胜。就渲染而言，它就像后进先出(LIFO)的栈一样。可以检查开发者工具来验证这一行为。

<p class="notice fact">添加进宿主元素中的 shadow 树按照它们的添加顺序而堆叠起来，从最先加入的 shadow 树开始。最终渲染的是最后加入的 shadow 树。</p>

<blockquote class="commentary talkinghead" id="youngest-tree">
最近添加的树称为 <b>younger tree</b>。之前添加的树称为 <b>older tree</b>。在本例中，<code>root2</code> 是 younger tree，<code>root1</code> 是 older tree。
</blockquote>

如果只有最后加入的 shadow 树才能被渲染，那么使用多个 shadow 的意义何在？别着急，让我们来认识下 shadow 插入点(insertion points)。

<h3 id="toc-shadow-insertion">Shadow 插入点</h3>

"Shadow 插入点" (`<shadow>`) 与普通[插入点](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`)均为占位符。不过，相比作为宿主*内容*的占位符，它们算得上是其他 *shadow 树*的宿主。它是 Shadow DOM 的基石！

正如你想象得到的，在兔子洞( rabbit hole)中陷的越深，事情变得越复杂。有鉴于此，规范对于同时存在多个 `<shadow>` 的行为作了明确的解释：

<p class="notice fact">如果一个 shadow 树中存在多个 <code>&lt;shadow></code> 插入点，那么仅第一个被确认，其余的被忽略。</p>

回过头来看看之前的例子，第一个 shadow `root1` 不在邀请名单中。增加一个 `<shadow>` 插入点来把它召回：

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

这个例子中有些有趣的地方：

1. "Root 2 FTW" 依然渲染在 "Root 1 FTW" 上面。原因和我们放置 <code>&lt;shadow></code> 插入点的位置有关。如果你想颠倒顺序，那就移动插入点：<code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code>。
- 注意此时在 root1 中存在一个 `<content>` 插入点。正因为如此，文本节点 "Light DOM" 也一并显示出来。

<b id="toc-shadow-older">&lt;shadow&gt; 里究竟渲染了什么？</b>

有些时候，了解一个 `<shadow>` 中渲染的旧的 shadow 树很有用。你可以通过 `.olderShadowRoot` 获取到那棵树的引用：

<pre class="prettyprint">
<b>root2.olderShadowRoot</b> === root1 //true
</pre>

<h2 id="toc-get-shadowroot">获取宿主元素的 shadow root</h2>

如果一个元素托管着 Shadow DOM，你可以使用 `.shadowRoot` 来访问它的 [youngest shadow root](#youngest-tree)：

<pre class="prettyprint">
var root = host.createShadowRoot();
console.log(host.shadowRoot === root); // true
console.log(document.body.shadowRoot); // null
</pre>

如果不想别人乱动你的 shadow，那就将 `.shadowRoot` 重定义为 null：

<pre class="prettyprint">
Object.defineProperty(host, 'shadowRoot', {
  get: function() { return null; },
  set: function(value) { }
});</pre>

有点取巧，但是很有效。最后要牢记的是，虽然 Shadow DOM 很棒，**但它并没有被设计成一个安全特性**。不要想着依赖它来实现完整的内容隔离。

<h2 id="toc-creating-js">在 JS 中构建 Shadow DOM</h2>

如果你偏好在 JS 中构建 DOM，尽可以使用 `HTMLContentElement` 和 `HTMLShadowElement` 接口。

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

这个例子与[前面部分](#toc-shadow-insertion)的版本基本一样。唯一的区别是在这里我使用了 `select` 将新增加的 `<span>` 提取出来。

<h2 id="toc-distributed-nodes">使用插入点</h2>

从宿主元素中选择并"分发"到 shadow 树中的节点称为……鼓声响起……分布式节点！当插入点邀请它们时便可以越过 shadow 边界。

从概念上讲很奇怪的是，插入点并不会真正的移动 DOM。宿主元素的节点保持不动。插入点仅仅是将节点从宿主元素重新投射(re-project)到 shadow 树中。这是展现/渲染层面的事情：<s>"把节点移动到这"</s> "把节点渲染在这个位置。"

<p class="notice fact">你无法遍历 <code>&lt;content></code> 中的 DOM。</p>

例如：

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

瞧！`h2` 并不是 Shadow DOM 的子节点。这便引出了另一个结论：

<blockquote class="commentary talkinghead">
插入点的功能极其强大。把它想象成一个为你的 Shadow DOM 创建"声明式 API" 的方法。宿主元素可以包含任意标记，但除非我使用插入点将它们引入到 Shadow DOM 中，否则它们毫无意义。
</blockquote>

<h3 id="toc-getDistributedNodes">Element.getDistributedNodes()</h3>

我们虽然无法遍历 `<content>`，但 `.getDistributedNodes()` API 却允许我们查询一个插入点的分布式节点：

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

与 `.getDistributedNodes()` 类似，你可以在分布式节点上调用它的 `.getDestinationInsertionPoints()` 来查看它被分发进了哪个插入点中：

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

<h2 id="toc-shadow-visualizder">工具：Shadow DOM Visualizer</h2>

要了解 Shadow DOM 背后的黑魔法很困难。我还记得第一次尝试理解它的情形。

为了使 Shadow DOM 的渲染过程更加形象化，我用 [d3.js](http://d3js.org/) 写了一个工具。左边框中的标记都是可编辑的。你可以把自己的代码粘贴进去，然后观察它们是如何工作的，插入点是如何将宿主的子节点混入 shadow 树中。

<figure>
<a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html"><img src="visualizer.png" title="Shadow DOM Visualizer" alt="Shadow DOM Visualizer"></a>
<figcaption><a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html">启动 Shadow DOM Visualizer</a></figcaption>
</figure>

<p>
<iframe width="420" height="315" src="http://www.youtube.com/embed/qnJ_s58ubxg" frameborder="0" allowfullscreen></iframe>
</p>

尝试一下，再告诉我你的想法！

<h2 id="toc-events">事件模型</h2>

有些事件会越过 shadow 边界，有些不会。在越过 shadow 边界的情况中，事件目标会因为维护由 shadow root 上边界提供的封装而进行调整。也就是说，**事件会被重定向，使它看起来是从宿主元素上发出，而并非是 Shadow DOM 的内部元素**。

<p class="tip notice">访问 <code>event.path</code> 来查看调整后的事件路径。</p>

如果你的浏览器支持 Shadow DOM (它<span class="featuresupported no">不</span>支持)，你应该能在下方看到一个用于可视化事件的测试区。<span style="color:#ffcc00">黄色</span>的元素属于 Shadow DOM 中的标记。<span style="color:steelblue">蓝色</span>的元素属于宿主元素。环绕在 "I'm a node in the host" 的<span style="color:#ffcc00">黄色</span>边框表明了它是一个分布式节点，通过 shadow 的 `<content>` 插入点混入在 Shadow DOM 中。

"Play Action" 按钮表示可以进行多种尝试。你可以点击它们来观察 `mouseout` 和 `focusin` 事件是如何冒泡到主页面的。

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

- 这个很有意思。你会看到一个 `mouseout` 事件从宿主元素 (`<div data-host>`)
传递到<span style="color:steelblue">蓝色</span>的节点。即便它是个分布式节点，但它始终处于宿主中，而不是在 Shadow DOM 里。随后继续移动鼠标至<span style="color:#ffcc00">黄色</span>区域内，再次导致<span style="color:steelblue">蓝色</span>的节点触发 `mouseout` 事件。

**Play Action 2**

- 这是发生在宿主元素(发生的非常晚)上的一次 `mouseout` 事件。通常你会看到 `mouseout` 事件会在所有的<span style="color:#ffcc00">黄色</span>块上触发。但是这一次不同，这些元素都在 Shadow DOM 的内部，事件的冒泡不会超出它的上边界。

**Play Action 3**

- 注意当你点击输入框时，`focusin` 并没有发生在输入框上，而是在
- 点自身上。事件被重定向了！ 

<h3 id="toc-events-stopped">始终停止的事件</h3>

以下事件永远无法越过 shadow 边界：

- abort
- error
- select
- change
- load
- reset
- resize
- scroll
- selectstart

<h2 id="toc-conclusion">总结</h2>

我希望你能认同 **Shadow DOM 的功能令人难以置信的强大**。这是有史以来第一次，我们有了合适的封装，不必再使用问题重重的 `<iframe>` 或其他古老的技巧。

Shadow DOM 是个难以驯服的猛兽，但是它却值得被加入到 web 平台中。花点时间去了解它，学习它，提出问题。

如果你想学习更多内容，看看 Dominic 的入门文章 [Shadow DOM 101](/tutorials/webcomponents/shadowdom/) 和我的 [Shadow DOM 201: CSS &amp; Styling](/tutorials/webcomponents/shadowdom-201/)。

<p class="small-notice">
感谢 <a href="/profiles/#dominiccooney">Dominic Cooney</a> 和
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> 对本教程的审阅。
</p>


