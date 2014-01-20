{% include "warning.html" %}

<h2 id="intro">引言</h2>

现在的 web 严重缺乏表达能力。你只要瞧一眼“现代”的 web 应用，比如 GMail，就会明白我的意思：

<figure>
  <a href="gmail.png"><img src="gmail.png" style="max-width:75%"></a>
  <figcaption>现代 web 应用：使用 <code>&lt;div></code> 堆砌而成。</figcpation>
</figure>

堆砌 `<div>` 一点都不现代。然而可悲的是，这就是我们构建 web 应用的方式。在现有基础上我们不应该有更高的追求吗？

<h3 id="meaningful">时髦的标记，行动起来！</h3>

HTML 为我们提供了一个完美的文档组织工具，然而 [HTML 规范](http://www.whatwg.org/specs/web-apps/current-work/multipage/)定义的元素却很有限。

假如 GMail 的标记不那么糟糕，而是像下面这样漂亮，那会怎样？

    <hangout-module>
      <hangout-chat from="Paul, Addy">
        <hangout-discussion>
          <hangout-message from="Paul" profile="profile.png"
              profile="118075919496626375791" datetime="2013-07-17T12:02">
            <p>Feelin' this Web Components thing.</p>
            <p>Heard of it?</p>
          </hangout-message>
        </hangout-discussion>
      </hangout-chat>
      <hangout-chat>...</hangout-chat>
    </hangout-module>

<p class="centered">
  <button><a href="https://html5-demos.appspot.com/hangouts">查看演示！</a></button>
</p>

真是令人耳目一新！这个应用太合理了，既**有意义**，又**容易理解**。最妙的是，它是**可维护**的，只要查看声明结构就可以清楚地知道它的作用。

<blockquote class="commentary talkinghead">自定义元素，救救我们！就指望你了！</blockquote>

<h2 id="gettingstarted">赶紧开始吧</h2>

[自定义元素](http://w3c.github.io/webcomponents/spec/custom/)**允许开发者定义新的 HTML 元素类型**。该规范只是 [Web 组件](http://w3c.github.io/webcomponents/explainer/)模块提供的众多新 API 中的一个，但它也很可能是最重要的一个。没有自定义元素带来的以下特性，Web 组件都不会存在：

1. 定义新的 HTML/DOM 元素
2. 基于其他元素创建扩展元素
3. 给一个标签绑定一组自定义功能
4. 扩展已有 DOM 元素的 API

<h3 id="registering">注册新元素</h3>

使用 `document.registerElement()` 可以创建一个自定义元素：

    var XFoo = document.registerElement('x-foo');
    document.body.appendChild(new XFoo());

`document.registerElement()` 的第一个参数是元素的标签名。这个标签名**必须包括一个连字符（-）**。因此，诸如 `<x-tags>`、`<my-element>`、`<my-awesome-app>` 都是合法的标签名，而 `<tabs>` 和 `<foo_bar>` 则不是。这个限定使解析器能很容易地区分自定义元素和 HTML 规范定义的元素，同时确保了 HTML 增加新标签时的向前兼容。

第二个参数是一个（可选的）对象，用于描述该元素的 `prototype`。在这里可以为元素添加自定义功能（例如：公开属性和方法）。稍后[详述](#publicapi)。

自定义元素默认继承自 `HTMLElement`，因此上一个示例等同于：

    var XFoo = document.registerElement('x-foo', {
      prototype: Object.create(HTMLElement.prototype)
    });

调用 `document.registerElement('x-foo')` 向浏览器注册了这个新元素，并返回一个可以用来创建 `<x-foo>` 元素实例的构造器。如果你不想使用构造器，也可以使用其他[实例化元素的技术](#instantiating)。

<p class="notice tip">如果你不希望在 <code>window</code> 全局对象中创建元素构造器，还可以把它放进命名空间（<code>var myapp = {}; myapp.XFoo = document.registerElement('x-foo');</code>）。</p>

<h3 id="extending">扩展原生元素</h3>

假设平淡无奇的原生 `<button>` 元素不能满足你的需求，你想将其增强为一个“超级按钮”，可以通过创建一个继承 `HTMLButtonElement.prototype` 的新元素，来扩展 `<button>` 元素：

    var MegaButton = document.registerElement('mega-button', {
      prototype: Object.create(HTMLButtonElement.prototype)
    });

<p class="notice fact">
要创建扩展自<b>元素 B</b> 的<b>元素 A</b>，<b>元素 A</b> 必须继承<b>元素 B</b> 的 <code>prototype</code>。

这类自定义元素被称为_类型扩展自定义元素_。它们以继承某个特定 `HTMLElement` 的方式表达了“元素 X 是一个 Y”。

示例：

    <button is="mega-button">

<h3 id="upgrades">元素如何提升</h3>

你有没有想过为什么 HTML 解析器对非标准标签不报错？比如，我们在页面中声明一个 `<randomtag>`，一切都很和谐。根据 [HTML 规范](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#htmlunknownelement)的表述：

<blockquote>
  非规范定义的元素必须使用 <code>HTMLUnknownElement</code> 接口。
  <cite>HTML 规范</cite>
</blockquote>

`<randomtag>` 是非标准的，它会继承 `HTMLUnknownElement`。

对自定义元素来说，情况就不一样了。**拥有合法元素名的自定义元素将继承 `HTMLElement`。**你可以按 <span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">J</span>（Mac 系统为 <span class="kbd">Cmd</span>+<span class="kbd">Opt</span>+<span class="kbd">J</span>）打开控制台，运行下面这段代码，得到的结果将是 `true`：

    // “tabs”不是一个合法的自定义元素名
    document.createElement('tabs').__proto__ === HTMLUnknownElement.prototype

    // “x-tabs”是一个合法的自定义元素名
    document.createElement('x-tabs').__proto__ == HTMLElement.prototype

<p class="notice fact">在不支持 <code>document.registerElement()</code> 的浏览器中，<code>&lt;x-tabs></code> 仍为 <code>HTMLUnknownElement</code>。

<h4 id="unresolvedels">unresolved 元素</h4>

由于自定义元素是通过脚本执行 `document.registerElement()` 注册的，因此**它们可能在元素定义被注册到浏览器_之前_就已经声明或创建过了**。例如：你可以先在页面中声明 `<x-tabs>`，以后再调用 `document.registerElement('x-tabs')`。

在被提升到其定义之前，这些元素被称为 **unresolved 元素**。它们是拥有合法自定义元素名的 HTML 元素，只是还没有注册成为自定义元素。

下面这个表格看起来更直观一些：

<table>
  <thead><tr><th>类型</th><th>继承自</th><th>示例</th></tr></thead>
  <tr><td>unresolved 元素</td><td><code>HTMLElement</code></td><td><code>&lt;x-tabs></code>, <code>&lt;my-element></code>, <code>&lt;my-awesome-app></code></td></tr>
  <tr><td>未知元素</td><td><code>HTMLUnknownElement</code></td><td><code>&lt;tabs></code>, <code>&lt;foo_bar></code>
</td></tr>
</table>

<blockquote class="commentary talkinghead">把 unresolved 元素想象成尚处于中间状态，它们都是等待被浏览器提升的潜在候选者。浏览器说：“你具备一个新元素的全部特征，我保证会在赋予你定义的时候将你提升为一个元素”。</blockquote>

<h2 id="instantiating">实例化元素</h2>

我们创建普通元素用到的一些技术也可以用于自定义元素。和所有标准定义的元素一样，自定义元素既可以在 HTML 中声明，也可以通过 JavaScript 在 DOM 中创建。

<h3 id="usecustomtag">实例化自定义标签</h3>

**声明**元素：

    <x-foo></x-foo>

在 JS 中**创建 DOM**：

    var xFoo = document.createElement('x-foo');
    xFoo.addEventListener('click', function(e) {
      alert('Thanks!');
    });

使用 **`new` 操作符**：

    var xFoo = new XFoo();
    document.body.appendChild(xFoo);

<h3 id="usetypeextension">实例化类型扩展元素</h3>

实例化类型扩展自定义元素的方法和自定义标签惊人地相似。

**声明**元素：

    <!-- <button> “是一个”超级按钮 -->
    <button is="mega-button">

在 JS 中**创建 DOM**：

    var megaButton = document.createElement('button', 'mega-button');
    // megaButton instanceof MegaButton === true

看，这是接收第二个参数为 `is=""` 属性的 `document.createElement()` 重载版本。

用 **`new` 操作符**实例化：

    var megaButton = new MegaButton();
    document.body.appendChild(megaButton);

现在，我们已经学习了如何使用 `document.registerElement()` 来向浏览器注册一个新标签。但这还不够，接下来我们要向新标签添加属性和方法。

<h2 id="publicapi">添加 JS 属性和方法</h2>

自定义元素最强大的地方在于，你可以在元素定义中加入属性和方法，给元素绑定特定的功能。你可以把它想象成一种给你的元素创建公开 API 的方法。

这里有一个完整的示例：

    var XFooProto = Object.create(HTMLElement.prototype);

    // 1. 为 x-foo 创建 foo() 方法
    XFooProto.foo = function() {
      alert('foo() called');
    };

    // 2. 定义一个只读的“bar”属性
    Object.defineProperty(XFooProto, "bar", {value: 5});

    // 3. 注册 x-foo 的定义
    var XFoo = document.registerElement('x-foo', {prototype: XFooProto});

    // 4. 创建一个 x-foo 实例
    var xfoo = document.createElement('x-foo');

    // 5. 插入页面
    document.body.appendChild(xfoo);

构造原型的方法多种多样，如果你不喜欢上面这种方式，再看一个更简洁的例子：

    var XFoo = document.registerElement('x-foo', {
      prototype: Object.create(HTMLElement.prototype, {
        bar: {
          get: function() { return 5; }
        },
        foo: {
          value: function() {
            alert('foo() called');
          }
        }
      })
    });

以上两种方式，第一种使用了 ES5 的 [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)，第二种则使用了 [get/set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/get)。

<h3 id="lifecycle">生命周期回调方法</h3>

元素可以定义特殊的方法，来注入其生存期内关键的时间点。这些方法各自有特定的名称和用途，它们被恰如其分地命名为**生命周期回调**：

<table class="table">
  <thead>
    <tr>
      <th>回调名称</th>
      <th>调用时间点</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>createdCallback</td>
      <td>创建元素实例</td>
    </tr>
    <tr>
      <td>attachedCallback</td>
      <td>向文档插入实例</td>
    </tr>
    <tr>
      <td>detachedCallback</td>
      <td>从文档中移除实例</td>
    </tr>
    <tr>
      <td>attributeChangedCallback(attrName, oldVal, newVal)</td>
      <td>添加，移除，或修改一个属性</td>
    </tr>
  </tbody>
</table>

**示例：**为 `<x-foo>` 定义 `createdCallback()` 和 `attachedCallback()`：

    var proto = Object.create(HTMLElement.prototype);

    proto.createdCallback = function() {...};
    proto.attachedCallback = function() {...};

    var XFoo = document.registerElement('x-foo', {prototype: proto});

**所有生命周期回调都是可选的**，你可以只在需要关注的时间点定义它们。例如：假设你有一个很复杂的元素，它会在 `createdCallback()` 打开一个 IndexedDB 连接。在将其从 DOM 移除时，`detachedCallback()` 会做一些必要的清理工作。**注意：**不要过于依赖这些生命周期方法（比如用户直接关闭浏览器标签），仅将其作为可能的优化点。

另一个生命周期回调的例子是为元素设置默认的事件监听器：

    proto.createdCallback = function() {
      this.addEventListener('click', function(e) {
        alert('Thanks!');
      });
    };

<blockquote class="commentary talkinghead">如果你的元素太笨重，是不会有人用它的。生命周期回调可以帮你大忙！</blockquote>

<h2 id="addingmarkup">添加标记</h2>

我们已经创建好 `<x-foo>` 并添加了 JavaScript API，但它还没有任何内容。不如我们给点 HTML 让它渲染？

[生命周期回调](#lifecycle)在这个时候就派上用场了。我们甚至可以用 `createdCallback()` 给一个元素赋予一些默认的 HTML：

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
    };

    var XFoo = document.registerElement('x-foo-with-markup', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-with-markup></x-foo-with-markup>
</div>

实例化这个标签并在 DevTools 中观察（右击，选择“审查元素”），可以看到如下结构：

    ▾<x-foo-with-markup>
       <b>I'm an x-foo-with-markup!</b>
     </x-foo-with-markup>

<h3 id="shadowdom">用 Shadow DOM 封装内部实现</h3>

[Shadow DOM](/tutorials/webcomponents/shadowdom/) 本身是一个封装内容的强大工具，配合使用自定义元素就更神奇了！

Shadow DOM 为自定义元素提供了：

1. 一种隐藏内部实现的方法，从而将用户与血淋淋的实现细节隔离开。
2. 简单有效的[样式隔离](/tutorials/webcomponents/shadowdom-201/)。

从 Shadow DOM 创建元素，跟创建一个渲染基础标记的元素非常类似，区别在于 `createdCallback()` 回调：

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      // 1. 为元素附加一个 shadow root。
      var shadow = this.createShadowRoot();

      // 2. 填入标记。
      shadow.innerHTML = "<b>I'm in the element's Shadow DOM!</b>";
    };

    var XFoo = document.registerElement('x-foo-shadowdom', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-shadowdom></x-foo-shadowdom>
</div>

我们并没有直接设置 `<x-foo-shadowdom>` 的 `innerHTML`，而是为其创建了一个用于填充标记的 Shadow Root。在 DevTools 设置中勾选“Show Shadow DOM”，你就会看到一个可以展开的 `#shadow-root`：

    ▾<x-foo-shadowdom>
       ▾#shadow-root
         <b>I'm in the element's Shadow DOM!</b>
     </x-foo-shadowdom>

这就是 Shadow Root！

<h3 id="fromtemplate">从模板创建元素</h3>

[HTML 模板](http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element) 是另一组跟自定义元素完美融合的新 API。

[`<template>` 元素](/tutorials/webcomponents/template/)可用于声明 DOM 片段。它们可以被解析并在页面加载后插入，以及延迟到运行时才进行实例化。模板是声明自定义元素结构的理想方案。

**示例：**注册一个由 `<template>` 和 Shadow DOM 创建的元素：

    <template id="sdtemplate">
      <style>
        p { color: orange; }
      </style>
      <p>I'm in Shadow DOM. My markup was stamped from a &lt;template&gt;.</p>
    </template>

    <script>
    var proto = Object.create(HTMLElement.prototype, {
      createdCallback: {
        value: function() {
          var t = document.querySelector('#sdtemplate');
          var clone = document.importNode(t.content, true);
          this.createShadowRoot().appendChild(clone);
        }
      }
    });
    document.registerElement('x-foo-from-template', {prototype: proto});
    </script>

<template id="sdtemplate">
  <style>x-foo-from-template p { color: orange; }</style>
  <p>I'm in Shadow DOM. My markup was stamped from a &lt;template&gt;.</p>
</template>

<div class="demoarea">
  <x-foo-from-template></x-foo-from-template>
</div>

短短几行做了很多事情，我们挨个来看都发生了些什么：

1. 我们在 HTML 中注册了一个新元素：`<x-foo-from-template>`
- 这个元素的 DOM 是从一个 `<template>` 创建的
- Shadow DOM 隐藏了该元素可怕的细节
- Shadow DOM 也对元素的样式进行了隔离（比如 `p {color: orange;}` 不会把整个页面都搞成<span style="color: orange;">橙色</span>）

真不错！

<h2 id="styling">为自定义元素增加样式</h2>

和其他 HTML 标签一样，自定义元素也可以用选择器定义样式：

    <style>
      app-panel {
        display: flex;
      }
      [is="x-item"] {
        transition: opacity 400ms ease-in-out;
        opacity: 0.3;
        flex: 1;
        text-align: center;
        border-radius: 50%;
      }
      [is="x-item"]:hover {
        opacity: 1.0;
        background: rgb(255, 0, 255);
        color: white;
      }
      app-panel > [is="x-item"] {
        padding: 5px;
        list-style: none;
        margin: 0 7px;
      }
    </style>

    <app-panel>
      <li is="x-item">Do</li>
      <li is="x-item">Re</li>
      <li is="x-item">Mi</li>
    </app-panel>

<div class="demoarea" style="width:300px;">

<app-panel>
  <li is="x-item">Do</li>
  <li is="x-item">Re</li>
  <li is="x-item">Mi</li>
</app-panel>
</div>

<h3 id="styling">为使用 Shadow DOM 的元素增加样式</h3>

有了 Shadow DOM 场面就热闹得多了，它可以[极大增强自定义元素的能力](#shadowdom)。

Shadow DOM 为元素增加了样式封装的特性。Shadow Root 中定义的样式不会暴露到宿主外部或对页面产生影响。**对自定义元素来说，元素本身就是宿主。**样式封装的属性也使得自定义元素能够为自己定义默认样式。

Shadow DOM 的样式是一个很大的话题！如果你想更多地了解它，推荐你阅读我写的其他文章：

- [Polymer](http://www.polymer-project.org) 文档：[《元素样式指南》](http://www.polymer-project.org/articles/styling-elements.html)。
- 发表于 html5rocks.com 的[《Shadow DOM 201：CSS 和样式》](/tutorials/webcomponents/shadowdom-201/)。

<h3 id="fouc">使用 :unresolved 伪类避免无样式内容闪烁（FOUC）</h3>

为了缓解[无样式内容闪烁](http://en.wikipedia.org/wiki/Flash_of_unstyled_content)的影响，自定义元素规范提出了一个新的 CSS 伪类 `:unresolved`。在浏览器调用你的 `createdCallback()`（见[生命周期回调方法](#lifecycle)一节）之前，这个伪类都可以匹配到 [unresolved 元素](#unresolvedels)。一旦产生调用，就意味着元素已经完成提升，成为它被定义的形态，该元素就不再是一个 unresolved 元素了。

<p class="notice">Chrome 29 已经原生支持 CSS <code>:unresolved</code> 伪类。</p>

**示例：**注册后渐显的 `<x-foo>` 标签：

    <style>
      x-foo {
        opacity: 1;
        transition: opacity 300ms;
      }
      x-foo:unresolved {
        opacity: 0;
      }
    </style>

请记住 `:unresolved` 伪类只能用于 [unresolved 元素](#unresolvedels)，而不能用于继承自 `HTMLUnkownElement` 的元素（见[元素如何提升](#upgrades)一节）。

    <style>
      /* 给所有 unresolved 元素添加边框 */
      :unresolved {
        border: 1px dashed red;
        display: inline-block;
      }
      /* unresolved 元素 x-panel 的文本内容为红色 */
      x-panel:unresolved {
        color: red;
      }
      /* 定义注册后的 x-panel 文本内容为绿色 */
      x-panel {
        color: green;
        display: block;
        padding: 5px;
        display: block;
      }
    </style>
    
    <panel>
      I'm black because :unresolved doesn't apply to "panel".
      It's not a valid custom element name.
    </panel>

    <x-panel>I'm red because I match x-panel:unresolved.</x-panel>

<div class="demoarea">
  <panel>I'm black because :unresolved doesn't apply to "panel". It's not a valid custom element name.</panel>
  <x-panel>I'm red because I match x-panel:unresolved.</x-panel>
  <p><button id="register-x-panel">Register &lt;x-panel></button></p>
</div>

了解更多 `:unresolved` 伪类的知识，请看 Polymer 文档[《元素样式指南》](http://www.polymer-project.org/articles/styling-elements.html#preventing-fouc)。


<h2 id="historysupport">历史和浏览器支持</h2>

<h3 id="featuredetect">特性检测</h3>

特性检测就是检查 `document.registerElement()` 是否存在：
    
    function supportsCustomElements() {
      return 'registerElement' in document;
    }

    if (supportsCustomElements()) {
      // Good to go!
    } else {
      // Use other libraries to create components.
    }

<h3 id="support">浏览器支持</h3>

Chrome 27 和 Firefox 23 都提供了对 `document.registerElement()` 的支持，不过之后规范又有一些演化。Chrome 31 将是第一个真正支持新规范的版本。

<p class="notice fact">在 Chrome 31 中使用自定义元素，需要开启 <code>about:flags</code> 中的“实验性 web 平台特性（Experimental Web Platform features）”选项。</p>

在浏览器支持稳定之前，也有一些很好的兼容方案：

- Google 的 [Polymer](http://polymer-project.org) 集成了一个[兼容方案](http://www.polymer-project.org/platform/custom-elements.html)
- Mozilla 的 [x-tags](http://www.x-tags.org/)

<h3 id="elementel">HTMLElementElement 怎么了？</h3>

一直关注标准的人都知道曾经有一个 `<element>` 标签。它非常好用，你只要像下面这样就可以声明式地注册一个新元素：

    <element name="my-element">
      ...
    </element>

然而很不幸，在它的[提升过程](#upgrades)、边界案例，以及末日般的复杂场景中，需要处理大量的时序问题。`<element>` 因此被迫搁置。2013 年 8 月，Dimitri Glazkov 在 [public-webapps](http://lists.w3.org/Archives/Public/public-webapps/2013JulSep/0287.html) 邮件组中宣告移除 `<element>`。

值得注意的是，Polymer 实现了以 `<polymer-element>` 的形式声明式地注册元素。这是怎么做到的？它用的正是 `document.registerElement('polymer-element')` 以及我在[从模板创建元素](#fromtemplate)一节介绍的技术。

<h2 id="conclusion">结语</h2>

自定义元素为我们提供了一个工具，通过它我们可以扩展 HTML 的词汇，赋予它新的特性，并把不同的 web 平台连接在一起。结合其他新的基本平台，如 Shadow DOM 和 `<template>`，我们领略了 web 组件的宏伟蓝图。标记语言将再次变得很时髦！

如果你对使用 web 组件感兴趣，建议你看看 [Polymer](http://polymer-project.org)，就它已经够你玩的了。

<script>
if ('registerElement' in document) {
  (function() {
    if ('registerElement' in document) {
      var XFooProto = Object.create(HTMLElement.prototype);

      XFooProto.createdCallback = function() {
        this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
      };

      var XFoo = document.registerElement('x-foo-with-markup', {prototype: XFooProto});
    }
  })();

  (function() {
    document.querySelector('#register-x-panel').addEventListener('click', function(e) {
      var XFoo = document.registerElement('x-panel', {prototype: Object.create(HTMLElement.prototype)});
      document.querySelector('x-panel').textContent = "x-panel is registered!";
    });
  })();
}

if ('createShadowRoot' in document.body && 'registerElement' in document) {

(function() {
    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      var shadow = this.createShadowRoot();
      shadow.innerHTML = "<b>I'm in the element's Shadow DOM!</b>";
    };

    var XFoo = document.registerElement('x-foo-shadowdom', {prototype: XFooProto});
})();

(function() {
  var proto = Object.create(HTMLElement.prototype, {
    createdCallback: {
      value: function() {
        var t = document.querySelector('#sdtemplate');
        var clone = document.importNode(t.content, true);
        this.createShadowRoot().appendChild(clone);
      }
    }
  });
  document.registerElement('x-foo-from-template', {prototype: proto});
})();

}
</script>

