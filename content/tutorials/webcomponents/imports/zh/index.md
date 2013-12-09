{% include "warning.html" %}

<h2 id="why">为什么需要导入？</h2>

先想想你在 web 上是如何加载不同类型的资源。对于 JS，我们有 `<script src>`。`<link rel="stylesheet">` 应该是 CSS 的首选。图片可以用 `<img>`。视频则有 `<video>`。音频，`<audio>`…… 你明白我在说什么了吧！ web 上绝大部分的内容都有简单明了的加载方式。可对于 HTML 呢？下面是可选的几种方案：

1. **`<iframe>`** - 可用但笨重。iframe 中的内容全部存在于一个不同于当前页的独立上下文中。这是个很棒的特性，但也为开发者们带来了额外的挑战 (将 frame 按照内容尺寸来缩放已经有点难度，在 iframe 和当前页面之间写点 JS 能把人绕晕，更别提操作样式了)。
-  **AJAX** - [我喜欢 `xhr.responseType="document"`](http://ericbidelman.tumblr.com/post/31140607367/mashups-using-cors-and-responsetype-document)，可是加载 HTML 要用 JS？ 这就不大对劲了。
- **CrazyHacks&#8482;** - 用字符串的方式嵌入页面，像注释一样隐藏 (例如 `<script type="text/html">`)。呕!

可笑不？ **作为 web 上最基础的内容，HTML，竟然需要这么麻烦才能得到我们想要的结果**。幸运的是，[Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) 总算找到了一条正确的路。

<h2 id="started">开始</h2>

[HTML 导入](http://www.w3.org/TR/2013/WD-html-imports-20130514/)，[Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) 阵容中的一员，是在其他 HTML 文档中包含 HTML 文档的一种方法。当然并非仅限于此，你还可以包含 CSS，JavaScript，或 `.html` 文件中能包含的任何内容。换句话说，这使得导入成为了**加载相关 HTML/CSS/JS 的神器**。

<h3 id="basics">基础</h3>

通过声明 `<link rel="import">` 来在页面中包含一个导入 ：

    <head>
      <link rel="import" href="/path/to/imports/stuff.html">
    </head>

导入中的 URL 被称为 _导入地址_。若想跨域导入内容，导入地址必须允许 CORS：

    <!-- 其他域内的资源必须允许 CORS -->
    <link rel="import" href="http://example.com/elements.html">

<p class="notice fact">浏览器的网络协议栈(network stack)会对访问相同 URL 的请求自动去重。这意味着从同一个 URL 导入的内容只会被获取一次。无论这个地址被导入多少次，最终它将只执行一次。</p>

<h3 id="featuredetect">特性检测与支持</h3>

要检测浏览器是否支持导入，可验证 `<link>` 元素上是否存在 `import`：

    function supportsImports() {
      return 'import' in document.createElement('link');
    }

    if (supportsImports()) {
      // 支持导入!
    } else {
      // 使用其他的库来加载文件。
    }

目前支持该特性的浏览器比较有限。Chrome 31 最先实现了该特性。你可以在 `about:flags` 页面中启用 **Enable HTML Imports**。对于其他浏览器可以使用 [Polymer 的 polyfill](http://www.polymer-project.org/platform/html-imports.html)。

<figure>
  <img src="aboutflag.png">
  <figcaption>在 <code>about:flags</code> 中 <b>启用 HTML Imports</b>。</figcpation>
</figure>

<p class="notice tip"><b>开启 experimental Web Platform features</b> 可以体验 web component 中的其他实验特性。</p>

<h3 id="bundling">打包资源</h3>

可以使用导入将 HTML/CSS/JS (甚至其他 HTML 导入) 打包成一个单独的可传递文件。这是个不容忽视的特点。假设你写了一套主题，库，或仅仅想把你的应用按照逻辑拆分，你也仅需给其他人提供一个 URL。天呐，你甚至可以用导入来传输整个应用，想想这该有多棒。

<blockquote class="commentary talkinghead">仅用一个 URL，你就可以将多个文件打包成一个文件提供给他人使用。
</blockquote>

一个现实中的例子是 [Bootstrap](http://getbootstrap.com/)。Bootstrap 由多个单独的文件组成 (bootstrap.css，bootstrap.js，字体), 它的插件依赖于 jQuery，并提供了带标记的例子。开发者们喜欢拥有像去餐厅点菜一样的灵活性。这允许开发者只加载框架中 _他们_ 想用的内容。

导入对于类似 Bootstrap 的内容来说意义非凡，下面我将展示未来加载 Bootstrap 的方式：

    <head>
      <link rel="import" href="bootstrap.html">
    </head>

用户只需加载一个 HTML Import 链接。他们再也不用为那些乱七八糟的文件而烦心。相反，整个 Bootstrap 都将包裹在一个导入 bootstrap.html 之中：

    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="fonts.css">
    <script src="jquery.js"></script>
    <script src="bootstrap.js"></script>
    <script src="bootstrap-tooltip.js"></script>
    <script src="bootstrap-dropdown.js"></script>
    ...

    <!-- 脚手架标记 -->
    <template>
      ...
    </template>

让这一切都快点变成现实吧，这玩意简直太棒了！

<h3 id="events">Load/error 事件</h3>

当导入成功时 `<link>` 元素会触发 `load` 事件，加载失败时 (例如资源出现 404) 则会触发 `error`。

导入会尝试立即加载。一个简单的办法是使用 `onload`/`onerror` 特性：

    <script async>
      function handleLoad(e) {
        console.log('Loaded import: ' + e.target.href);
      }
      function handleError(e) {
        console.log('Error loading import: ' + e.target.href);
      }
    </script>

    <link rel="import" href="file.html"
          onload="handleLoad(event)" onerror="handleError(event)">

<p class="notice tip">注意上面事件处理的定义要早于导入开始加载页面。浏览器一旦解析到导入的标签，它就会立即加载资源。如果此时处理函数不存在，你将在控制台看到函数名未定义的错误。</p>

或者，你可以动态创建导入：

    var link = document.createElement('link');
    link.rel = 'import';
    link.href = 'file.html'
    link.onload = function(e) {...};
    link.onerror = function(e) {...};
    document.head.appendChild(link);

<h2 id="usingcontent">使用内容</h2>

在页面中包含导入并不意味着 "把那个文件的内容都塞到这"。它表示 "解析器，去把这个文档给我取回来好让我用"。若想真正的使用该文档的内容，你得写点脚本。

当你意识到导入就是一个文档时，你肯定会 `啊哈！` 一声。事实上，导入的内容被称为 *导入文档*。你可以 **使用标准的 DOM API 来操作导入的内容**！

<h3 id="importprop">link.import</h3>

若想访问导入的内容，需要使用 link 元素的 `import` 属性：

    var content = document.querySelector('link[rel="import"]').import;

在下面几种情况下，`link.import` 值为 `null` ：

- 浏览器不支持 HTML 导入。
- `<link>` 没有 `rel="import"`。
- `<link>` 没有被加入到 DOM 中。
- `<link>` 从 DOM 中被移除。
- 资源没有开启 CORS。

**完整示例**

假设 `warnings.html` 包含如下内容：

    <div class="warning">
      <style scoped>
        h3 {
          color: red;
        }
      </style>
      <h3>Warning!</h3>
      <p>This page is under construction</p>
    </div>

    <div class="outdated">
      <h3>Heads up!</h3>
      <p>This content may be out of date</p>
    </div>

你可以获取导入文档中的一部分并把它们复制到当前页面中：

    <head>
      <link rel="import" href="warnings.html">
    </head>
    <body>
      ...
      <script>
        var link = document.querySelector('link[rel="import"]');
        var content = link.import;

        // 从 warning.html 的文档中获取 DOM。
        var el = content.querySelector('.warning');

        document.body.appendChild(el.cloneNode(true));
      </script>
    </body>

<div class="demoarea" id="warning-example-area"></div>

<link rel="import" id="warning-example-link" href="warning.html">
<script>
  var link = document.querySelector('#warning-example-link');
  if ('import' in link) {
    var content = link.import;
    var alertDOM = content.querySelector('div.alert');
    document.querySelector('#warning-example-area').appendChild(alertDOM.cloneNode(true));
  }
</script>

<h3 id="includejs">在导入中使用脚本</h3>

导入的内容并不在主文档中。它们仅仅作为主文档的附属而存在。即便如此，导入的内容还是能够在主页面中生效。导入能够访问它自己的 DOM 或/和包含它的页面中的 DOM：

**示例** - import.html 向主页面中添加它自己的样式表

    <link rel="stylesheet" href="http://www.example.com/styles.css">
    <link rel="stylesheet" href="http://www.example.com/styles2.css">
    ...

    <script>
      // importDoc 是导入文档的引用
      var importDoc = document.currentScript.ownerDocument;

      // mainDoc 是主文档(包含导入的页面)的引用
      var mainDoc = document;

      // 获取导入中的第一个样式表，复制，
      // 将它附加到主文档中。
      var styles = importDoc.querySelector('link[rel="stylesheet"]');
      mainDoc.head.appendChild(styles.cloneNode(true));
    </script>

留意这里的操作。导入中的脚本获得了导入文档的引用 (`document.currentScript.ownerDocument`)，随后将导入文档中的部分内容附加到了主页面中 (`mainDoc.head.appendChild(...)`)。这段代码看起来不怎么优雅。

<blockquote class="commentary talkinghead">导入中的脚本要么直接运行代码，要么就定义个函数留给主页面使用。这很像 Python 中<a href="http://docs.python.org/2/tutorial/modules.html#more-on-modules">模块</a>定义的方式。
</blockquote>

导入中 JavaScript 的规则：

- 导入中的脚本会在包含导入`文档`的 window 上下文中运行。因此 `window.document` 关联的是主页面文档。这会产生两个有用的推论：
    - 导入中定义的函数最终会出现在 `window` 上。
    - 你不用将导入文档中的 `<script>` 块附加到主页面。再重申一遍，脚本会自动执行。
- 导入不会阻塞主页面的解析。不过，导入文档中的脚本会按照顺序执行。它们对于主页面来说就像拥有了延迟(defer)执行的行为。后面会详细讲解。

<h2 id="deliver-webcomponents">传输 Web Component</h2>

HTML 导入的设计很好的契合了在 web 上加载重用资源的需求。尤其是对于分发 Web Component。无论是基本的 [HTML `<template>`](/webcomponents/template/) 还是十分成熟的[自定义元素](/tutorials/webcomponents/customelements/#registering)/Shadow DOM [[1](/tutorials/webcomponents/shadowdom/)，[2](/tutorials/webcomponents/shadowdom-201/)，[3](/tutorials/webcomponents/shadowdom-301/)]。当把这些技术结合在一起使用时，导入就充当了 Web Component 中 [`#include`](http://en.cppreference.com/w/cpp/preprocessor/include) 的角色。

<h3 id="include-templates">包含模板</h3>

[HTML Template](/tutorials/webcomponents/template/) 元素是 HTML 导入的好搭档。`<template>` 特别适合于为需要导入的应用搭建必要的标记。将内容包裹在一个 `<template>` 元素中还为你提供了延迟加载内容的好处。也就是说，在 template 元素加入到 DOM 之前，它包含的脚本不会执行。

import.html

    <template>
      <h1>Hello World!</h1>
      <img src="world.png"> <!-- 只有当模板生效后才会去请求图片 -->
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

        // 从导入中复制 <template>。
        var template = link.import.querySelector('template');
        var content = template.content.cloneNode(true)

        document.querySelector('#container').appendChild(content);
      </script>
    </body>

<h3 id="include-elements">注册自定义元素</h3>

[自定义元素](tutorials/webcomponents/customelements/)是 Web Component 技术中的另一位成员，它和 HTML 导入也是出奇的搭配。[导入能够运行脚本](#includejs)，既然如此，为什么不定义 + 注册你自己的自定义元素，这样一来用户就避免重复操作了呢？ 让我们就叫它..."自动注册(auto-registration)"。

elements.html

    <script>
      // 定义并注册 <say-hi>。
      var proto = Object.create(HTMLElement.prototype);

      proto.createdCallback = function() {
        this.innerHTML = 'Hello, <b>' +
                         (this.getAttribute('name') || '?') + '</b>';
      };

      document.register('say-hi', {prototype: proto});

      // 定义并注册使用了 Shadow DOM 的 <shadow-element>。
      var proto2 = Object.create(HTMLElement.prototype);

      proto2.createdCallback = function() {
        var root = this.createShadowRoot();
        root.innerHTML = "<style>::content > *{color: red}</style>" +
                         "I'm a " + this.localName +
                         " using Shadow DOM!<content></content>";
      };
      document.register('shadow-element', {prototype: proto2});
    </script>

这个导入定义 (并注册) 了两个元素，`<say-hi>` 和 `<shadow-element>`。主页面可以直接使用它们，无需做任何额外操作。

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

在我看来，这样的工作流程使得 HTML 导入成为了共享 Web Components 的理想方式。

<h3 id="depssubimports">管理依赖和子导入</h3>

> 嘿。听说你挺喜欢导入, 所以我就在你的导入_里_又加了个导入。

<h4 id="sub-imports">子导入(Sub-imports)</h4>

若导入能够嵌套将会提供更多便利。例如，如果你想复用或继承另一个组件，使用导入加载其他元素。

下面是 [Polymer](http://polymer-project.org) 中的真实例子。通过复用布局还有选择器组件，我们得到了一个新的选项卡组件 (`<polymer-ui-tabs>`)。它们的依赖通过 HTML 导入来管理。

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

[完整源码](https://github.com/Polymer/polymer-ui-elements/blob/master/polymer-ui-tabs/polymer-ui-tabs.html)

应用开发者可以引入这个新元素：

    <link rel="import" href="polymer-ui-tabs.html">
    <polymer-ui-tabs></polymer-ui-tabs>

若以后出现了一个更新，更棒的 `<polymer-selector2>`，你就可以毫不犹豫的用它替换 `<polymer-selector>`。多亏有了导入和 web 组件，你再也不用担心惹恼你的用户了。

<h4 id="deps">依赖管理</h4>

我们都知道一个页面载入多个 jQuery 会出问题。若是多个组件引用了相同的库，对于 Web 组件来说会不会是个_严重_的问题？ 如果使用 HTML 引用，你就完全不用担心！ 导入可以用来管理这些依赖。

将库放进一个 HTML 导入中，就自动避免了重复加载问题。文档只会被解析一次。脚本也只执行一次。来举个例子吧，比如说你定义了一个导入，jquery.html，它会加载 JQuery。

jquery.html

    <script src="http://cdn.com/jquery.js"></script>

这个导入可以被其他导入复用：

import2.html

    <link rel="import" href="jquery.html">
    <div>Hello, I'm import 2</div>

ajax-element.html

    <link rel="import" href="jquery.html">
    <link rel="import" href="import2.html">

    <script>
      var proto = Object.create(HTMLElement.prototype);

      proto.makeRequest = function(url, done) {
        return $.ajax(url).done(function() {
          done();
        });
      };

      document.register('ajax-element', {prototype: proto});
    </script>

若主页面也需要这个库，连它也可以包含 jquery.html：

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

尽管 jquery.html 被加进了多个导入树中，浏览器也只会获取一次它的文档。查看网络面板就能证明这一切：

<figure>
  <img src="requests-devtools.png">
  <figcaption>jquery.html is requested once</figcpation>
</figure>

<h2 id="performance">性能注意事项</h2>

HTML 导入绝对是个好东西，但就像许多其他新技术一样，你得明智的去使用它。Web 开发的最佳实践还是需要遵守。下面是一些需要留意的地方。

<h3 id="perf-concat">合并导入</h3>

减少网络请求始终是重点。如果需要很多最顶层的导入，那就考虑把它们合并在一个资源里，然后导入该资源！

[Vulcanizer](https://github.com/Polymer/vulcanize) 是由 [Polymer](http://www.polymer-project.org/) 团队开发的 npm 构建工具，它能够递归的展开一组 HTML 导入并生成一个单独的文件。可以把它看成构建 Web 组件中合并的步骤。

<h3 id="perf-caching">导入影响浏览器缓存</h3>

许多人似乎都忘记了浏览器的网络协议栈经过了多年的精心调整。导入 (包括子导入) 也从中受益。导入 `http://cdn.com/bootstrap.html` 可能包含子资源，但它们都将被缓存起来。

<h3 id="perf-inert">内容只有在被添加后才是可用的</h3>

把导入的内容看成是惰性的，只有当你调用它的服务时它才生效。 看看这个动态创建的样式表：

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles.css';

在 `link` 被加入到 DOM 之前，浏览器不会去请求 styles.css：

    document.head.appendChild(link); // 浏览器请求 styles.css

另一个例子就是动态创建标签：

    var h2 = document.createElement('h2');
    h2.textContent = 'Booyah!';

在你把 `h2` 添加到 DOM 之前它没有意义。

同样的概念对于导入文档也适用。在你将内容追加到 DOM 之前，它就是一个空操作。实际上，在导入文档中直接 "运行" 的只有 `<script>`。参见[导入中的脚本操作](#includejs)。

<h3 id="perf-parsing">优化异步载入</h3>

**导入不会阻塞主页面解析**。导入中的脚本会按照顺序执行，但也不会阻塞主页面。这意味着你在维护脚本顺序时获得了类似于延迟加载的行为。将导入放到 `<head>` 的好处在于它可以让解析器尽快的去解析导入的内容。即便如此，你还得记得主页面中的 `<script>` *仍然* 会阻塞页面:

    <head>
      <link rel="import" href="/path/to/import_that_takes_5secs.html">
      <script>console.log('I block page rendering');</script>
    </head>

根据你的应用架构和使用场景不同，有几种方法可以优化异步行为。下面要使用的技巧可以缓解对主页面渲染的阻塞。

**场景 #1 (推荐)： `<head>` 中没有脚本或 `<body>` 没有内联脚本**

我对放置 `<script>` 的建议就是不要紧跟着你的导入。把它们尽可能远的放置...你肯定早就按照最佳实践这么做了，不是吗！？;)

看个例子：

    <head>
      <link rel="import" href="/path/to/import.html">
      <link rel="import" href="/path/to/import2.html">
      <!-- 避免在这放脚本 -->
    </head>
    <body>
      <!-- 避免在这放脚本 -->

      <div id="container"></div>

      <!-- 避免在这放脚本 -->
      ...

      <script>
        // 其他的脚本。

        // 获得导入内容。
        var link = document.querySelector('link[rel="import"]');
        var post = link.import.querySelector('#blog-post');

        var container = document.querySelector('#container');
        container.appendChild(post.cloneNode(true));
      </script>
    </body>

所有内容都放到底部。

**场景 1.5： 导入添加自己的内容**

另一个选择是让导入[添加自己的内容](#includejs). 若导入的作者和应用开发者之间达成了某种约定，那么导入就可以将它自身加入到主页面的某个位置：

import.html:

    <div id="blog-post">...</div>
    <script>
      var me = document.currentScript.ownerDocument;
      var post = me.querySelector('#blog-post');

      var container = document.querySelector('#container');
      container.appendChild(post.cloneNode(true));
    </script>

index.html

    <head>
      <link rel="import" href="/path/to/import.html">
    </head>
    <body>
      <!-- 不需要写脚本。导入会自己处理 -->
    </body>

**场景 #2: `<head>` 或 `<body>` 中*有*(内联)脚本 **

若某个导入的加载需要耗费很长时间，跟在导入后面的第一个 `<script>` 将会阻塞页面渲染。以 Google Analytics 为例，它推荐将跟踪代码放在 `<head>` 中，若你必须将 `<script>` 放到 `<head>` 中，那么动态的添加导入将会避免阻塞页面：

    <head>
      <script>
        function addImportLink(url) {
          var link = document.createElement('link');
          link.rel = 'import';
          link.href = url;
          link.onload = function(e) {
            var post = this.import.querySelector('#blog-post');

            var container = document.querySelector('#container');
            container.appendChild(post.cloneNode(true));
          };
          document.head.appendChild(link);
        }

        addImportLink('/path/to/import.html'); // 导入被提前添加 :)
      </script>
      <script>
        // 其他脚本
      </script>
    </head>
    <body>
       <div id="container"></div>
       ...
    </body>

或者，将导入放到 `<body>` 结束处：

    <head>
      <script>
        // 其他脚本
      </script>
    </head>
    <body>
      <div id="container"></div>
      ...

      <script>
        function addImportLink(url) { ... }

        addImportLink('/path/to/import.html'); // 导入很晚才能被添加 :(
      </script>
    </body>

<p class="notice"><b>注意：</b> 不推荐最后的方法。解析器在解析页面结束之前不会去操作导入的内容。</p>

<h2 id="tips">要点</h2>

- 导入的 MIME 类型是 `text/html`。

- 导入跨域资源需要启用 CORS。

-  来自相同 URL 的导入仅获取和解析一次。这表示导入中的脚本只在第一次导入的时候执行。

- 导入中的脚本按顺序执行，它们不会阻塞主页面解析。

- 导入链接不代表 "#把内容添加到这里"。它代表 "解析器，去把这个文档取过来，我一会要用"。脚本在导入期间运行，而样式，标记，还有其他资源需要明确的加入到主页面中。这是 HTML 导入和 `<iframe>` 之间的最大区别，后者表示 "在这里加载并渲染资源"。

<h2 id="conclusion">总结</h2>

HTML 导入允许将 HTML/CSS/JS 打包成一个单独资源。这个想法在 Web 组件开发世界中显得极为重要。开发者可以创建重用的组件，其他人通过引入 `<link rel="import">` 就能够在自己的应用中使用这些组件。

HTML 导入是个简单的概念，但却促成了许多有趣的使用案例。

<h3 id="usecases">使用案例</h3>

- 将相关的 [HTML/CSS/JS 作为一个单独的包](#bundling) 来**分发**。理论上来说，你可以在应用里面导入一个完整的 web 应用。
- **代码组织** - 将概念按照逻辑划分为不同的文件，鼓励模块化 &amp; 复用性**。
- **传输** 一或多个[自定义元素](/tutorials/webcomponents/customelements/) 的定义。可以在应用内使用导入来[注册](/tutorials/webcomponents/customelements/#registering) 和包含自定义元素。这符合良好的软件模式，即将接口/定义与使用分离。
- [**管理依赖**](#depssubimports) - 自动解决资源的重复加载。
- **脚本块** - 没有导入之前，一个大型的 JS 库需要在使用前全部解析，这通常很慢。有了导入，只要块 A 解析完毕，库就能够立即使用。延迟更少了！

      `<link rel="import" href="chunks.html">`:

        <script>/* script chunk A goes here */</script>
        <script>/* script chunk B goes here */</script>
        <script>/* script chunk C goes here */</script>
        ...

- **并行 HTML 解析** - 这是首次能够让浏览器并行运行两个 (或多个) HTML 解析器。

- **允许在调试和非调试模式下切换**，只需要修改导入的目标。你的应用无需知道导入的目标是打包/编译好的资源还是一棵导入树。
