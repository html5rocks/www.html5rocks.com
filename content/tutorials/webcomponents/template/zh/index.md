{% include "warning.html" %}

<h2 id="toc-intro">介绍</h2>

在 web 开发领域中，模板这个概念并不新鲜。实际上，服务端的
[模板语言/引擎](http://en.wikipedia.org/wiki/Template_engine_(web))，比如 Django (Python)，ERB/Haml (Ruby)，和 Smarty (PHP) 早已应用多时。近些年来，众多 MVC 框架蓬勃涌现。这些框架各有特色，但绝大多数在展现层(即：视图层)都使用同样的渲染机制：模板。

模板是个好东西，不信你就问问周围人。连它的[定义](http://www.thefreedictionary.com/template)都让人感到温暖舒适：

> **模板** (n) - 一个拥有预制格式的文档或文件，可作为特定应用的出发点，这样就避免在每次使用格式的时候都重复创建。

"...避免在每次....重复创建"不知道你是怎么想的，但我喜欢避免重复工作。可为什么对这个开发者明确需要的技术，web 平台没有提供原生支持呢？

[WhatWG HTML 模板规范][spec-link]便是答案。它定义了一个新的 `<template>` 元素，用于描述一个标准的以 DOM 为基础的方案来实现客户端模板。该模板允许你定义一段可以被转为 HTML 的标记，在页面加载时不生效，但可以在后续进行动态实例化。引用 [Rafael Weinstein](https://plus.google.com/111386188573471152118/posts)(规范作者)的话：

<blockquote>
  它们是用来放置一大团 HTML 的地方，就是那些你不想让浏览器弄乱的标记...不管它是出于什么理由。
  <cite>Rafael Weinstein (规范作者)</cite>
</blockquote>

<h3 id="toc-detect">特性检测</h3>

欲特性检测 `<template>`，需要创建一个 DOM 元素并检查它是否拥有 `.content` 属性：

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // 检测通过！
    } else {
      // 使用旧的模板技术或库。
    }

<h2 id="toc-started">声明模板内容</h2>

HTML `<template>` 元素代表标记中的一个模板。它包含"模板内容"；本质上是**一大块的惰性可复制 DOM**。
可以把模板想象成一个脚手架的零件，在应用的整个生命周期中你都可以使用(和重用)它。

要创建模板的内容，需要声明一些标记并用 `<template>` 元素将它们包裹起来：

    <template id="mytemplate">
      <img src="" alt="great image">
      <div class="comment"></div>
    </template>

<blockquote class="commentary talkinghead">
细心的读者可能会注意到那个空图片。这是故意留空的。因为页面加载时不会请求图片，因此就不会产生 404 或控制台错误。我们可以随后动态生成图片的 URL。参见<a href="#toc-pillars">the pillars</a>.
</blockquote>

<h2 id="toc-pillars">支柱(The pillars)</h2>

用 `<template>` 来包裹内容为我们提供了几个重要属性。

1. 它的**内容在激活之前一直处于惰性状态**。本质上，这些标记就是隐藏的 DOM，它们不会被渲染。

2. 处于模板中的内容不会有副作用。**脚本不会运行，图片不会加载，音频不会播放**，...直到模板被使用。

3. **内容不在文档中**。在主页面使用 `document.getElementById()` 或 `querySelector()` 不会返回模板的子节点。

4. 模板**能够**被放置在任何位置，包括 `<head>`，`<body>`，或 `<frameset>`，并且任何能够出现在以上元素中的内容都可以放到模板中。 注意，"任何位置"意味着 `<template>` 能够安全的出现在 HTML 解析器不允许出现的位置...几乎可以作为任何[内容模型](http://www.w3.org/TR/html5-diff/#content-model)的子节点。 它也可以作为 `<table>` 或 `<select>` 的子元素：

        <table>
        <tr>
          <template id="cells-to-repeat">
            <td>some content</td>
          </template>
        </tr>
        </table>

<h2 id="toc-using">激活一个模板</h2>

要使用模板，你得先激活它。否则它的内容将永远无法渲染。
激活模板最简单的方法就是使用 `document.importNode()` 对模板的 `.content` 进行深拷贝。
`.content` 为只读属性，关联一个包含模板内容的 `DocumentFragment`。

    var t = document.querySelector('#mytemplate');
    // 在运行时填充 src。
    t.content.querySelector('img').src = 'logo.png';

    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);

在对模板进行冲压(stamping out)后，它的内容开始"启用"。 在本例中，内容被拷贝，发出图片请求，最终的标记得以渲染。

<h2 id="toc-using">Demos</h2>

<h3 id="toc-demo-insert">例子：惰性脚本</h3>

该示例示范了模板内容的惰性。`<script>` 只有在按钮被按下，模板被激活后才会运行。

    <button onclick="useIt()">Use me</button>
    <div id="container"></div>
    <script>
      function useIt() {
        var content = document.querySelector('template').content;
        // 更新 template DOM 中的内容。
        var span = content.querySelector('span');
        span.textContent = parseInt(span.textContent) + 1;
        document.querySelector('#container').appendChild(
            document.importNode(content, true));
      }
    </script>

    <template>
      <div>Template used: <span>0</span></div>
      <script>alert('Thanks!')</script>
    </template>

<div class="demoarea">
<button onclick="useIt()">Use me</button>
<div id="container"></div>
<template id="inert-demo">
  <div>Template used <span>0</span></div>
  <script>if ('HTMLTemplateElement' in window) {alert('Thanks!')}</script>
</template>
<script>
  function useIt() {
    var content = document.querySelector('#inert-demo').content;
    var span = content.querySelector('span');
    span.textContent = parseInt(span.textContent) + 1;
    document.querySelector('#container').appendChild(document.importNode(content, true));
  }
</script>
</div>

<h3 id="toc-demo-sd">例子：从模板中生成 Shadow DOM</h3>

大部分人通过为 `.innerHTML` 赋值一串标记来将 [Shadow DOM](/tutorials/webcomponents/shadowdom/) 挂载到 host 上：

    <div id="host"></div>
    <script>
      var shadow = document.querySelector('#host').createShadowRoot();
      shadow.innerHTML = '<span>Host node</span>';
    </script>

该做法的弊端在于，你的 Shadow DOM 越复杂，就需要越多的字符串拼接操作。这不利于扩展，用不了多久你就该傻眼了。此外该做法最容易滋生 XSS！不过别怕，`<template>` 前来帮助。

合理的做法是直接操作 DOM，将模板内容附加到 shadow root 上：

    <template>
    <style>
      :host {
        background: #f8f8f8;
        padding: 10px;
        transition: all 400ms ease-in-out;
        box-sizing: border-box;
        border-radius: 5px;
        width: 450px;
        max-width: 100%;
      }
      :host:hover {
        background: #ccc;
      }
      div {
        position: relative;
      }
      header {
        padding: 5px;
        border-bottom: 1px solid #aaa;
      }
      h3 {
        margin: 0 !important;
      }
      textarea {
        font-family: inherit;
        width: 100%;
        height: 100px;
        box-sizing: border-box;
        border: 1px solid #aaa;
      }
      footer {
        position: absolute;
        bottom: 10px;
        right: 5px;
      }
    </style>
    <div>
      <header>
        <h3>Add a Comment</h3>
      </header>
      <content select="p"></content>
      <textarea></textarea>
      <footer>
        <button>Post</button>
      </footer>
    </div>
    </template>

    <div id="host">
      <p>Instructions go here</p>
    </div>

    <script>
      var shadow = document.querySelector('#host').createShadowRoot();
      shadow.appendChild(document.querySelector('template').content);
    </script>

<template id="demo-sd-template">
<style>
  :host {
    background: #f8f8f8;
    padding: 10px;
    transition: all 400ms ease-in-out;
    box-sizing: border-box;
    border-radius: 5px;
    width: 450px;
    max-width: 100%;
  }
  :host:hover {
    background: #ccc;
  }
  #unsupportedbrowsersneedscoping {
    position: relative;
  }
  #unsupportedbrowsersneedscoping header {
    padding: 5px;
    border-bottom: 1px solid #aaa;
  }
  #unsupportedbrowsersneedscoping h3 {
    margin: 0 !important;
  }
  #unsupportedbrowsersneedscoping textarea {
    font-family: inherit;
    width: 100%;
    height: 100px;
    box-sizing: border-box;
    border: 1px solid #aaa;
  }
  #unsupportedbrowsersneedscoping footer {
    position: absolute;
    bottom: 10px;
    right: 5px;
  }
</style>
<div id="unsupportedbrowsersneedscoping">
  <header>
    <h3>添加评论</h3>
  </header>
  <content select="p"></content>
  <textarea></textarea>
  <footer>
    <button>发表</button>
  </footer>
</div>
</template>

<div id="demo-sd-host">
  <p>Instructions go here</p>
</div>

<script>
(function() {
  var host = document.querySelector('#demo-sd-host');
  var compat = HTMLElement.prototype.webkitCreateShadowRoot ||
               HTMLElement.prototype.createShadowRoot ? true : false;
  if (compat && 'HTMLTemplateElement' in window) {
    var shadow = host.createShadowRoot();
    shadow.applyAuthorStyles = true;
    shadow.appendChild(document.querySelector('#demo-sd-template').content);
  } else {
    document.querySelector('#unsupportedbrowsersneedscoping').style.display = 'none';
    host.style.display = 'none';
  }
})();
</script>

<h2 id="toc-gotcha">坑</h2>

以下是我在使用 `<template>` 中遇到的一些坑：

- 如果你正在使用 [modpagespeed](http://code.google.com/p/modpagespeed/)，那么留心这个 [bug](http://code.google.com/p/modpagespeed/issues/detail?id=625)。定义了行内 `<style scoped>` 的模板，可能会因为 PageSpeed 的 CSS 重写规则而被移动到头部。
- 没有办法"预渲染"一个模板，也就是说无法预加载资源，处理 JS，下载初始 CSS 等等。这对于服务端和客户端都适用。模板被渲染的唯一时机就是在它被激活后。
- 注意嵌套模板。它们的行为不会如你所愿。例如：

        <template>
          <ul>
            <template>
              <li>Stuff</li>
            </template>
          </ul>
        </template>

    激活外层模板并不会激活内层模板。也就是说，嵌套模板需要手动激活它的子模板。

<h2 id="toc-old">标准之路</h2>

不要忘了我们从何而来。HTML 模板的标准化进程耗时已久。多年以来，出现不少十分聪明的用于创建可重用模板的方法。下面将介绍我碰到过的两种常见方法。出于比较的目的，我将它们收录在了本文中。

<h3 id="toc-offscreen">方法 1：幕后 DOM</h3>

一个长期被人们使用的方法是创建"幕后" DOM 并使用 `hidden` 特性或 `display:none` 来将其从视图中隐藏。

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

使用该方法有若干的弊端。以下是该方法的总结：

- <label class="good"></label> *使用 DOM*——浏览器了解 DOM。它们擅长处理它。我们可以轻易的复制这些 DOM。
- <label class="good"></label> *没有内容渲染*——增加 `hidden` 来阻止区块的显示。
- <label class="bad"></label> *非惰性*——即便内容是隐藏的，当仍然会发起图片请求。
- <label class="bad"></label> *难以设置样式和主题*——嵌入页面需要为所有 CSS 规则增加 `#mytemplate` 前缀，以此来将样式限定在模板范围内。这种做法十分脆弱，并且无法确保未来可能出现的命名冲突。比如说，要是嵌入页面早就拥有一个 id 为 `mytemplate` 的元素，我们可就麻烦了。

<h3 id="toc-overloadingscript">方法 2:重载脚本</h3>

另一个技巧是重载 `<script>` 并将它的内容作为字符串来操作。
John Resig 可能是第一个展示该技巧的人——在 2008 年他的[Micro Templating utility](http://ejohn.org/blog/javascript-micro-templating/)中。
目前又出现了许多新的工具，例如 [handlebars.js](http://handlebarsjs.com/)。

例如：

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

该技巧的总结：

- <label class="good"></label> *没有内容渲染*——浏览器不会渲染该块，因为
`<script>` 默认为 `display:none`。
- <label class="good"></label> *惰性*——若脚本的类型不为 "text/javascript"，那么浏览器就不会将它的内容当作 JS 来解析。
- <label class="bad"></label> *安全问题*——鼓励使用 `.innerHTML`。对户提供的数据进行运行时字符串解析很容易导致 XSS 漏洞。

<h2 id="toc-conclusion">总结</h2>

还记得当 jQuery 使得操作 DOM 变为异常简单吗？结果就是 `querySelector()`/`querySelectorAll()` 被添加到了平台中。很明显的胜利，不是吗？
由于一个库推广了使用 CSS 选择器来获取 DOM 的方法从而使得它被规范采纳。这并不是常有的事，但我*喜欢*看到这样的事情发生。

我觉得 `<template>` 也是类似的案例。它将客户端模板进行了标准化，更为重要的是，它使我们
不再需要[疯狂的 2008 hacks](#toc-old)。
促使整个 web 开发过程更健全，更容易维护，功能更多，在我看来，始终都是个好事情。

<h2 id="toc-resources">额外资源</h2>

- [W3C 规范][spec-link]
- [Web 组件入门](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#template-section)
- [&lt;web>components&lt;/web>](http://html5-demos.appspot.com/static/webcomponents/index.html) ([视频](http://www.youtube.com/watch?v=eJZx9c6YL8k)) - 真诚的为您献上一份精彩详实的介绍。

[spec-link]: http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element
