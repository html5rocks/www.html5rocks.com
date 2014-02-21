{% include "warning.html" %}

这篇文章将继续讨论更多有关 Shadow DOM 的精彩内容。
文中内容完全基于 [Shadow DOM 101](/tutorials/webcomponents/shadowdom/) 中讨论的概念，如果你在找入门文章，那么先去看看那一篇。

<h2 id="toc-intro">介绍</h2>

首先得承认，没有样式的标记谈不上漂亮。好在 [Web 组件背后的那群聪明家伙们](http://w3c.github.io/webcomponents/explainer/#acknowledgements)
早就预见了这一点。所以当我们在样式化 shadow 树中的内容时便拥有了众多选择。

<p class="tip notice">在 Chrome 中，开启 about:flags 页面中的"Enable experimental Web Platform features"就可以体验本文介绍的所有内容。</p>

<h2 id="toc-style-scoped">样式封装</h2>

Shadow DOM 的一个核心特色叫做 [shadow 边界(shadow boundary)](http://w3c.github.io/webcomponents/spec/shadow/#shadow-trees)。它有不少实用属性，其中最棒的一个是免费提供了样式封装。换句话说：

<p class="notice fact">Shadow DOM 中定义的 CSS 样式只在 ShadowRoot 下生效。这意味着样式被封装了起来。</p>

下面是一个示例。如果运行正常并且你的浏览器支持 Shadow DOM (它<span class="featuresupported no">不</span>支持！)，你会看到 "<span style="color:red">Shadow DOM</span>"。

    <div><h3>Light DOM</h3></div>
    <script>
    var root = document.querySelector('div').createShadowRoot();
    root.innerHTML = '<style>h3{ color: red; }</style>' +
                     '<h3>Shadow DOM</h3>';
    </script>

<div class="demoarea">
  <div id="style-ex-scoped"><h3>Light DOM</h3></div>
</div>
<script>
(function() {
var container = document.querySelector('#style-ex-scoped');
var root = container.createShadowRoot();
root.innerHTML = '<style>h3{color: red;}</style><h3>Shadow DOM</h3>';
})();
</script>

从这个示例中能观察到两个有趣的结果：

- 页面中有
<a href="javascript:alert('There are ' + document.querySelectorAll('h3').length + ' &#60;h3&#62; on this page.')">额外的 h3 元素</a>，但被 h3 选择器所匹配并且样式为红色的只有在 ShadowRoot 的那个元素。再重申一遍，Shadow DOM 中的样式默认是有作用域的。
- 页面中定义的其他关于 h3 的样式并没有影响我们的内容。原因在于**选择器无法越过 shadow 边界**。

这里包含的寓意是什么？我们将样式从外部世界中封装了起来。感谢 Shadow DOM！

<h2 id="toc-style-host">样式化宿主元素(host element)</h2>

<p class="notice"><b>注意：</b> Shadow DOM 规范使用 <code>:host()</code> 取代了旧的 <code>@host</code>。</p>

`:host` 允许你选择并样式化 shadow 树所寄宿的元素：

    <button class="red">My Button</button>
    <script>
    var button = document.querySelector('button');
    var root = button.createShadowRoot();
    root.innerHTML = '<style>' +
        ':host { text-transform: uppercase; }' +
        '</style>' +
        '<content></content>';
    </script>

<div class="demoarea">
  <button id="style-athost" class="red">My Button</button>
</div>
<script>
(function() {
var container = document.querySelector('#style-athost');
var root = container.createShadowRoot();
root.innerHTML = '<style>' +
                     ':host { text-transform: uppercase; }' +
                      '</style>' +
                      '<content></content>';
})();
</script>

在这里需要注意的是：父页面定义的样式规则的特异性要高于元素中定义的 `:host` 规则，但低于宿主元素上 `style` 属性定义的规则。
`:host` 仅在 ShadowRoot 的范围内生效，不能在 Shadow DOM 外使用它。

<h3 id="toc-style-states">对用户状态的反馈</h3>

`:host` 的一个常见的使用场景是：你创建了一个[自定义元素](/tutorials/webcomponents/customelements/)，希望对不同的用户状态(:hover，:focus，:active，等等)产生反馈。

    <style>
    :host {
      opacity: 0.4;
      transition: opacity 420ms ease-in-out;
    }
    :host:hover {
      opacity: 1;
    }
    :host:active {
      position: relative;
      top: 3px;
      left: 3px;
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
      :host {\
        opacity: 0.4;\
        transition: opacity 200ms ease-in-out;\
      }\
      :host:active { position:relative;top:3px;left:3px; }\
      :host:hover {\
        opacity: 1;\
      }\
    }</style><content></content>';
})();
</script>


<h3 id="toc-style-themeing">主题化一个元素</h3>

`:host` 的另一个使用场景是主题化。`:host(<selector>)` 接受一个选择器参数，当宿主元素或它的任意祖先元素和该选择器匹配，那么宿主元素就会匹配。

**例子** - 大多数人在主题化时会为 `<html>` 或 `<body>` 应用一个 class：

    <body class="different">
      <x-foo></x-foo>
    </body>

使用 `:host(.different)`，仅当宿主元素是 `.different` 的后代元素时，`<x-foo>` 才会被样式化：

    :host(.different) {
      color: red;
    }

**例子** - 只有当宿主元素本身拥有该类时才会匹配(例如 `<x-foo class="different"></x-foo>`)：

    :host(.different:host) {
      ...
    }

<h3 id="toc-style-multi">在一个 shadow root 内支持多种宿主类型</h3>

`:host` 还有一种使用场景，那就是你创建了一个主题库，想在相同的 Shadow DOM 内为不同类型的宿主元素提供样式化。

    :host(x-foo:host) {
      /* 当宿主是 <x-foo> 元素时生效。 */
    }

    :host(x-bar:host) {
      /* 当宿主是 <x-bar> 元素时生效。 */
    }

    :host(div) {  {
      /* 当宿主或宿主的祖先元素是 <div> 元素时生效。 */
    }

<h2 id="toc-style-cat-hat">^ 和 ^^ 选择器</h2>

`^^` (Cat) 和 `^` (Hat) 选择器就好比是一把 CSS 权威的斩首剑(Vorpal sword)。
它们允许跨越 Shadow DOM 的边界并对 shadow 树内的元素样式化。

<h3 id="toc-style-hat">^ 连接符</h3>

`^` 连接符等价于后代选择器(例如 `div p {...}`)，不过**它只能跨越一个 shadow 边界**。这可以使你便捷的从 shadow 树中选择一个元素：

    <style>
      #host ^ span {
        color: red;
      }
    </style>

    <div id="host">
      <span>Light DOM</span>
    </div>

    <script>
      var host = document.querySelector('div');
      var root = host.createShadowRoot();
      root.innerHTML = "<span>Shadow DOM</span>" +
                       "<content></content>";
    </script>

<div class="demoarea">
  <div id="style-hat-ex">
    <span>Light DOM</span>
  </div>
</div>
<script>
(function() {
var host = document.querySelector('#style-hat-ex');
var root = host.createShadowRoot();
root.innerHTML = '<span>Shadow DOM</span>' +
                 '<content></content>';
})();
</script>

**例子** (自定义元素) - `<x-tabs>` 在它的 Shadow DOM 中拥有一个子元素 `<x-panel>`。每个 panel 中都寄宿了各自的包含了 `h2` 标题的 Shadow 树，若想在主页面修改这些标题的样式，使用：

    x-tabs ^ x-panel ^ h2 {
      ...
    }

<h3 id="toc-style-cat">^^ 连接符</h3>

`^^` 连接符与 `^` 类似，但功能更为强大。形如
`A ^^ B` 的选择器会忽略所有 shadow 边界从而匹配任意后代元素 B。简而言之， `^^` **能够跨越任意数量的 shadow 边界**。

`^^` 连接符特别适用于自定义元素(通常会有多级 Shadow DOM)。比如说嵌套多个自定义元素(每个都拥有独自的 Shadow DOM)或使用 [`<shadow>`](/tutorials/webcomponents/shadowdom-301/#toc-shadow-insertion) 来继承一个元素从而创建新的元素。

**例子** (自定义元素) -  选择 `<x-tabs>` 的所有后代 `<x-panel>`元素，忽略一切 Shadow 边界：

    x-tabs ^^ x-panel {
      ...
    }

<h3 id="toc-css-traverasl">使用 querySelector()</h3>

正如 [`.shadowRoot`](/tutorials/webcomponents/shadowdom-301/#toc-get-shadowroot) 使
shadow 树支持 DOM 遍历，连接符使 shadow 树支持选择器遍历。相比书写令人抓狂的嵌套链，你可以仅用一条语句：

    // 无聊。
    document.querySelector('x-tabs').shadowRoot
            .querySelector('x-panel').shadowRoot
            .querySelector('#foo');

    // 有趣。
    document.querySelector('x-tabs ^ x-panel ^ #foo');

<h3 id="toc-style-native">样式化原生元素</h3>

修改原生 HTML 控件的样式是个挑战。多数人选择了放弃转而自己实现。现在我们有了 ^ 和 ^^，样式化 Shadow DOM 中的元素再也不是难题。比较明显的例子是 `<video>` 和 `<input>`。

    video ^ input[type="range"] {
      background: hotpink;
    }

<div class="demoarea">
  <video id="ex-style-video" controls></video>
</div>

<blockquote class="commentary talkinghead">
^ 和 ^^ 是否破坏了样式的封装？实际上，Shadow DOM 可以防止外部<em>无意的</em>修改样式，但它并非是防弹衣。应该允许开发者<em>有意的</em> 对 Shadow 树的内部设置样式……如果他们知道自己在做什么的话。拥有更多的控制对于灵活性，主题化，元素的重用性都是好事。
</blockquote>

<h2 id="toc-style-hooks">生成样式钩子</h2>

可定制是有用的。在某些情况下，你可能需要在 Shadow 的样式屏障上开几个孔，为其他人设置样式提前埋好钩子。

<h3 id="toc-custom-pseduo">使用 ^ 和 ^^</h3>

`^^` 的威力巨大。它为组件作者提供了一条途径：为指定的单个元素设置样式，或为多个元素修改主题。

**例子** - 为所有拥有 `.library-theme` 类的元素设置样式，忽略所有 shadow 树：

    body ^^ .library-theme {
      ...
    }

{% comment %}
<h3 id="toc-custom-pseduo">使用自定义伪元素</h3>

[WebKit](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css?format=txt) 与
[Firefox](https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference/Mozilla_Extensions#Pseudo-elements_and_pseudo-classes) 都为定义了伪元素来样式化原生浏览器元素的内部细节。一个好的例子是 `input[type=range]`。你可以选择 `::-webkit-slider-thumb` 来将水平滑块设置为<span style="color:blue">蓝色</span>：

    input[type=range].custom::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: blue;
      width: 10px;
      height: 40px;
    }

与浏览器为内部元素提供样式化钩子类似，Shadow DOM 内容的作者也可以指定某个元素可以被外部样式化。这是通过[自定义伪元素](http://www.w3.org/TR/shadow-dom/#custom-pseudo-elements)来完成的。

你可以使用 `pseudo` 属性来指定一个元素为自定义伪元素。该属性的值，或者说名字，需要以 "x-" 为前缀。如此操作后，名字就和 Shadow 树中的该元素关联起来，同时为外部指定了一条跨越 shadow 边界的通道。

下面这个例子生成了一个滑动条部件，并且允许别人将它的滑块样式设置为<span style="color:blue">蓝色</span>：

    <style>
      #host::x-slider-thumb {
        background-color: blue;
      }
    </style>
    <div id="host"></div>
    <script>
    var root = document.querySelector('#host').createShadowRoot();
    root.innerHTML = '<div>' +
                       '<div pseudo="x-slider-thumb"></div>' +
                     '</div>';
    </script>

<blockquote class="commentary talkinghead">
自定义伪元素的灵巧之处在哪里？那就是你可以通过外部 CSS 为这些伪元素设置样式，却无法通过外部的 JS 访问它们。shadow 边界对于 JS 是无法逾越的，但对于自定义伪元素却形同虚设。
What's really neat about custom pseudo elements? You can style them with outside CSS
but can't access them via outside JS. The shadow boundary is preserved for JS
but loosened for custom pseudo element definitions.
</blockquote>
{% endcomment %}

<h3 id="toc-vars">使用 CSS 变量</h3>

<p class="notice">在 Chrome 的 about:flags 页面中开启 "Enable experimental Web Platform features" 即可体验 CSS 变量。</p>

创建主题化钩子的一个强大方法是使用 [CSS 变量](http://dev.w3.org/csswg/css-variables/)。本质上就是创建"样式占位符"来等待其他人填充。

想象一下，当一个自定义元素的作者在 Shadow DOM 中标记出变量的占位符。其中一个用于样式化内部按钮的字体，另一个用于样式化它的颜色：

    button {
      color: {% mixin var(button-text-color, pink) %} /* default color will be pink */
      font: {% mixin var(button-font) %}
    }

然后，元素的使用者按照自己的喜好定义了这些值。很可能是为了和他自己页面中非常酷的漫画字体主题(Comic Sans theme)相搭配： 

    #host {
      {% mixin var-button-text-color: green %}
      {% mixin var-button-font: "Comic Sans MS", "Comic Sans", cursive %}
    }

由于 CSS 变量的这种继承方式，使得这些工作完成的很出色！完整的代码如下：

    <style>
      #host {
        {% mixin var-button-text-color: green %}
        {% mixin var-button-font: "Comic Sans MS", "Comic Sans", cursive %}
      }
    </style>
    <div id="host">Host node</div>
    <script>
    var root = document.querySelector('#host').createShadowRoot();
    root.innerHTML = '<style>' +
        'button {' +
          'color: {% mixin var(button-text-color, pink) %}' +
          'font: {% mixin var(button-font) %}' +
        '}' +
        '</style>' +
        '<content></content>';
    </script>

<blockquote class="commentary talkinghead">
我已经不止一次的在文中提到<a href="/tutorials/webcomponents/customelements/">自定义元素</a>。目前你只需要了解，Shadow DOM为它们的结构基础提供样式化和 DOM 封装即可。这里介绍的都是样式化自定义元素的概念。
</blockquote>

<h2 id="toc-style-inheriting">重置样式</h2>

诸如 font，color，还有 line-height 这些可继承样式仍然会影响 Shadow DOM 中的元素。然而出于最大灵活性的考虑，Shadow DOM 为我们提供了 `resetStyleInheritance` 属性来控制在 shadow 边界能发生什么。当你创建一个新的组件时，可以把它当做从零开始的一个方法。

**resetStyleInheritance**

- `false` - 默认。[可继承 CSS 属性](http://www.impressivewebs.com/inherit-value-css/)仍然能够继承。
- `true` - 在边界处将可继承属性重置为 `initial`。

以下这个例子表明了修改 `resetStyleInheritance` 是如何影响到 shadow 树的：

<pre class="prettyprint">
&lt;div>
  &lt;h3>Light DOM&lt;/h3>
&lt;/div>

&lt;script>
var root = document.querySelector('div').createShadowRoot();
root.resetStyleInheritance = <span id="code-resetStyleInheritance">false</span>;
root.innerHTML = '&lt;style>h3{ color: red; }&lt;/style>' +
                 '&lt;h3>Shadow DOM&lt;/h3>' +
                 '&lt;content select="h3">&lt;/content>';
&lt;/script>
</pre>

<div class="demoarea" style="width:225px;">
  <div id="style-ex-inheritance"><h3 class="border">Light DOM</h3></div>
</div>
<div id="inherit-buttons">
  <button id="demo-resetStyleInheritance">resetStyleInheritance=false</button>
</div>

<script>
(function() {
var container = document.querySelector('#style-ex-inheritance');
var root = container.createShadowRoot();
//root.resetStyleInheritance = false;
root.innerHTML = '<style>h3{ color: red; }</style><h3>Shadow DOM</h3><content select="h3"></content>';

document.querySelector('#demo-resetStyleInheritance').addEventListener('click', function(e) {
  root.resetStyleInheritance = !root.resetStyleInheritance;
  e.target.textContent = 'resetStyleInheritance=' + root.resetStyleInheritance;
  document.querySelector('#code-resetStyleInheritance').textContent = root.resetStyleInheritance;
});

})();
</script>

<img src="showinheritance.gif" title="DevTools inherited properties" alt="DevTools inherited properties" style="height:215px;border:1px solid #ccc;float:right;margin-left:10px;">

理解 `.resetStyleInheritance` 倒有些棘手，主要是因为它只影响那些能继承的 CSS 属性。它的含义是：当你在页面和 ShadowRoot 之间的边界处查找用于继承的属性时，不要继承宿主上的属性值，而应该使用 `initial` 值来代替(按照 CSS 规范)。

如果你拿不准哪些属性在 CSS 中可以继承，查看[这个列表](http://www.impressivewebs.com/inherit-value-css/) 或在开发者工具的元素面板中切换 "Show inherited" 复选框。

<h2 id="toc-style-disbtributed-nodes">样式化分布式节点</h2>

`.resetStyleInheritance` 严格的影响那些定义在 Shadow DOM **内** 的节点的样式化行为。

分布式节点则是另一码事。`<content>` 元素允许你从 Light DOM 中选择节点并将它们渲染到 Shadow DOM 中预先定义的位置。从逻辑上讲，它们并不在 Shadow DOM 中；它们是宿主元素的子元素，在"渲染时期"混入对应的位置。

自然的，分布式节点从它们所在的文档(宿主元素的所在文档)获得样式。不过有个例外，那就是它们还可能从混入的地方(在 Shadow DOM 中)获得额外样式。

<h3 id="toc-distributed">::content 伪元素</h3>

<p class="notice"><b>注意：</b> Shadow DOM 规范使用 <code>::content</code> 替换了旧的 <code>::distributed()</code>。</p>

如果分布式节点是宿主元素的子元素，那么我们如何在 Shadow DOM *内部*来指定它们呢？答案就是使用 CSS `::content` 伪元素。这是穿过插入点(insertion point)来指定节点的方式。比如说：

`::content > h3` 用来样式化任意穿过插入点的 `h3` 标签。

让我们来看一个简单的例子：

    <div>
      <h3>Light DOM</h3>
      <section>
        <div>I'm not underlined</div>
        <p>I'm underlined in Shadow DOM!</p>
      </section>
    </div>

    <script>
    var div = document.querySelector('div');
    var root = div.createShadowRoot();
    root.innerHTML = '\
        <style>\
          h3 { color: red; }\
          content[select="h3"]::content > h3 {\
            color: green;\
          }\
          ::content section p {\
            text-decoration: underline;\
          }\
        </style>\
        <h3>Shadow DOM</h3>\
        <content select="h3"></content>\
        <content select="section"></content>';
    </script>

<div class="demoarea">
  <div id="style-ex-distributed">
    <h3>Light DOM</h3>
    <section>
      <div>I'm not underlined</div>
      <p>I'm underlined in Shadow DOM!</p>
      </section>
  </div>
</div>
<script>
(function() {
var container = document.querySelector('#style-ex-distributed');
var root = container.createShadowRoot();
root.innerHTML = '\
  <style>\
    h3 { color: red; }\
    content[select="h3"]::content > h3 {\
      color: green;\
    }\
    ::content section p {\
      text-decoration: underline;\
    }\
  </style>\
  <h3>Shadow DOM</h3>\
  <content select="h3"></content>\
  <content select="section"></content>';
})();
</script>

你会看到 "<span style="color:red">Shadow DOM</span>" 和它下面的
"<span style="color:green">Light DOM</span>"。要注意的是
"Light DOM" 仍然会保留从该页面中获得的样式(例如 margin)。

<h3 id="toc-shadow-resetstyles">在插入点重置样式</h3>

当创建一个 ShadowRoot 后，你便可以选择重置继承的样式。
`<content>` 和 `<shadow>` 插入点同样可以选择。当使用这些元素时，要么在 JS 中设置 `.resetStyleInheritance`，
或是在元素上设置 `reset-style-inheritance` boolean 属性。

- 对于一个 ShadowRoot 或 `<shadow>` 插入点：`reset-style-inheritance`
意味着可继承的 CSS 属性在宿主元素处被设置为 `initial`，此时这些属性还没有对 shadow 中的内容生效。**该位置称为上边界(upper boundary)**。

- 对于 `<content>` 插入点：`reset-style-inheritance` 意味着在宿主的子元素分发到插入点之前，将可继承的
CSS 属性设置为 `initial`。**该位置称为下边界(lower boundary)**。

<blockquote class="commentary talkinghead">
牢记：在宿主所在的文档中定义的样式依然会对它们指定的节点生效，即使这些节点被分发"进" Shadow DOM 中。
进入一个插入点并不会改变那些已经生效的属性。
</blockquote>

<h2 id="toc-conclusion">总结</h2>

作为自定义元素的作者，我们拥有众多控制内容外观和感觉的选项。Shadow DOM 为这个美丽新世界奠定了基础。

Shadow DOM 为我们提供了范围受限的样式封装，还有控制外部世界对内部样式尽可能多(或尽可能少)影响的手段。
通过定义自定义伪元素或包含 CSS 变量的占位符，作者能够提供对第三方友好的样式化钩子使得他们能够对内容进一步的定制。
总而言之，web 作者对于内容的展现拥有绝对的控制权。

<p class="small-notice">
感谢 <a href="/profiles/#dominiccooney">Dominic Cooney</a> 和
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> 对该教程内容的审阅。
</p>

{% block relatedreading %}
<aside class="panel">
  <h2>相关阅读</h2>
  <ul>
    <li><a href="/tutorials/webcomponents/shadowdom/">Shadow DOM 101</a></li>
    <li><a href="/tutorials/webcomponents/shadowdom-301/">Shadow DOM 301 - Advanced Concepts &amp; DOM APIs</a></li>
    <li><a href="/tutorials/webcomponents/customelements/">Custom Elements - defining new elements in HTML</a></li>
  </ul>
</aside>
{% endblock %}