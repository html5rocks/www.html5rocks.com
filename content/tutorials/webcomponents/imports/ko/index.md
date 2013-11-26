{% include "warning.html" %}

<h2 id="why">왜 imports인가?<!-- Why imports? --></h2>

여러분이 웹에서 각기 다른 형태의 리소스들을 어떻게 로딩하는지 생각해봅시다. JS의 경우 `<script src>`. CSS의 경우 아마도 `<link rel="stylesheet">`일 것이고 이미지들의 경우 `<img>`일 것이며 비디오는 `<video>`를 가지고 오디오는 `<audio>`로.... 결론을 말하면! 웹 컨텐츠의 대다수는 스스로를 로딩하기 위한 단순하고 선언적인 방법을 가지고 있습니다. HTML에서만 그런 것은 아닙니다. 다른 것을 한번 보도록 하겠습니다.<!-- Think about how you load different types of resources on the web. For JS, we have `<script src>`. For CSS, your go-to is probably `<link rel="stylesheet">`. For images it's `<img>`. Video has `<video>`. Audio, `<audio>`.... Get to the point! The majority of the web's content has a simple and declarative way to load itself. Not so for HTML. Here's your options: -->

1. **`<iframe>`** - tried and true but heavy weight. An iframe's content lives entirely in a separate context than your page. While that's mostly a great feature, it creates additional challenges (shrink wrapping the size of the frame to its content is tough, insanely frustrating to script into/out of, nearly impossible to style).

-  **AJAX** - [I love `xhr.responseType="document"`](http://ericbidelman.tumblr.com/post/31140607367/mashups-using-cors-and-responsetype-document), but you're saying I need JS to load HTML? That doesn't seem right.

- **CrazyHacks&#8482;** - embedded in strings, hidden as comments (e.g. `<script type="text/html">`). Yuck!

아이러니해 보이나요? **웹의 기본 컨텐츠와 HTML 대부분이 동작을 위한 정말 굉장한 노력을 필요로 합니다.** 다행스럽게도 우리를 정상으로 돌려줄 수 있는 [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html)가 여기 있습니다.
<!-- See the irony? **The web's most basic content, HTML, requires the greatest amount
of effort to work with**. Fortunately, [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) are here to get us back on track. -->

<h2 id="started">시작하기<!-- Getting started --></h2>

[HTML Imports](http://www.w3.org/TR/2013/WD-html-imports-20130514/)는 [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html)의 일부로 일컬어지는 HTML 문서를 다른 HTML 문서들에 가져오기 위한 방법입니다. 또한 Import는 CSS, JavaScript 혹은 '.html' 외의 어떠한 것도 가져올 수 있습니다. 다시 말해서 이러한 것이 Import를 **HTML/CSS/JS의 로딩 관련된 환상적인 도구**로 만듭니다.<!-- [HTML Imports](http://www.w3.org/TR/2013/WD-html-imports-20130514/), part of the [Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html) cast, is a way to include HTML documents in other HTML documents. You're not limited to markup either. An import can also include CSS, JavaScript, or anything else an `.html` file can contain. In other words, this makes imports a **fantastic tool for loading related HTML/CSS/JS**. -->

<h3 id="basics">기본 사항<!-- The basics --></h3>

다음과 같이 `<link rel="import">`의 선언을 통해 페이지 내에 Import를 포함합니다.<!-- Include an import on your page by declaring a `<link rel="import">`: -->

    <head>
      <link rel="import" href="/path/to/imports/stuff.html">
    </head>

Import의 URL은 _import location_으로 불립니다. 다른 도메인에서 콘텐츠를 로딩하기 위해서 import location은 다음과 같이 CORS가 가능한 상태여야 합니다.<!-- The URL of an import is called an _import location_. To load content from another domain, the import location needs to be CORS-enabled: -->

    <!-- 다른 원본으로부터의 리소스들은 반드시 CORS가 가능해야 합니다. -->
<!-- Resources on other origins must be CORS-enabled. -->
    <link rel="import" href="http://example.com/elements.html">

<p class="notice fact">브라우저의 네트워크는 자동으로 동일한 URL로부터 전달되는 모든 요청을 중복되지 않은 형태로 쌓아(Stack)둡니다. 이것은 
  일단 한번만 탐색된 동일한 URL의 참조를 불러온다는 것을 뜻합니다. 단 한번만 실행되기 때문에 같은 위치에 대해 얼마나 많은 횟수로 불러오는지에 대해 걱정하지 않아도 됩니다.<!-- The browser's network stack automatically de-dupes all requests from the same URL. This means that imports that reference the same URL are only retrieved once. No matter how many times an import at the same location is loaded, it only executes once. --></p>

<h3 id="featuredetect">기능의 검출 및 지원<!-- Feature detection and support --></h3>

지원 여부를 검출하기 위해 `.import`가 `<link>` 엘리먼트에 존재하는지를 다음과 같이 검사합니다.<!-- To detect support, check if `.import` exists on the `<link>` element: -->

    function supportsImports() {
      return 'import' in document.createElement('link');
    }

    if (supportsImports()) {
      // 지원하므로 그대로 진행합니다.
    } else {
      // 파일을 로딩하기 위한 다른 라이브러리나 require 시스템들을 사용하세요.
    }

브라우저의 지원은 여전히 초기 상태입니다. 크롬 31버전은 실제로 구현된 첫번째 브라우저입니다. `about:flags`의 **HTML 가져오기 사용(Enable HTML Imports)**를 켜서 플래그를 활성화할 수 있습니다. 폭넓게 지원되기 전까지 다른 브라우저를 위해서 [Polymer's polyfill](http://www.polymer-project.org/platform/html-imports.html)은 훌륭하게 동작할 것입니다.<!-- Browser support is still in the early days. Chrome 31 is the first browser to have an implementation. You can enable the flag by turning on **Enable HTML Imports** in `about:flags`. For other browsers, [Polymer's polyfill](http://www.polymer-project.org/platform/html-imports.html) works great until things are widely supported. -->

<figure>
  <img src="aboutflag_ko.png"><!-- <img src="aboutflag.png"> -->
  <figcaption>><code>about:flags</code>의 <b>HTML 가져오기 사용(Enable HTML Imports)</b>.<!-- <b>Enable HTML Imports</b> in <code>about:flags</code>. --></figcpation>
</figure>

<p class="notice tip">또한 다른 최첨단 웹 컴포넌트 조각을 가져오기 위한 <b>실험용 웹 플랫폼 기능 사용(Enable experimental Web Platform features)</b>도 있습니다.<!-- Also <b>Enable experimental Web Platform features</b> to get the other bleeding edge web component goodies. --></p>

<h3 id="bundling">리소스 묶음(Bundling)</h3>

Imports는 HTML/CSS/JS(다른 HTML Imports 까지도)를 단일 제품으로 묶어주는 방식을 제공합니다. 이는 기본적인 기능이지만 매우 강력한 기능입니다. 만약 테마나 라이브러리를 생성하거나 단지 앱을 논리적인 단위로 분할하기를 원한다면 사용자에게 단일 URL을 제공하는 것은 강제 사항입니다. 여러분은 전체 앱을 import를 통해 제공할 수도 있습니다. 잠시만 생각해보시기 바랍니다.<!-- Imports provide convention for bundling HTML/CSS/JS (even other HTML Imports) into a single deliverable. It's an intrinsic feature, but a powerful one. If you're creating a theme, library, or just want to segment your app into logical chunks, giving users a single URL is compelling. Heck, you could even deliver an entire app via an import. Think about that for a second. -->

<blockquote class="commentary talkinghead">유일한 URL을 사용하여 다른 사람이 사용할 수 있는 재배치 가능하고 유용한 단일 웹 묶음(Bundle)을 패키징할 수 있습니다.<!-- Using only one URL, you can package together a single relocatable bundle of web goodness for others to consume. -->
</blockquote>

실제 예제는 [부트스트랩(Bootstrap)](http://getbootstrap.com/)입니다. 부트스트랩은 개별적인 파일들( bootstrap.css, bootstrap.js, 폰트)들로 구성되어 있으며 플러그인을 위해 jQuery를 필요로 하고 마크업 예제들을 제공합니다. 개발자는 선택적인(à la carte) 유연성을 좋아합니다. _그들이_ 사용하기 원하는 프레임워크의 일부로 부트스트랩을 집어넣을 수 있도록 합니다. 즉, 전통적인 개발자형씨(JoeDeveloper)&#8482;가 더 쉬운 방법으로 부트스트랩의 모든 것을 다운로드할 것이라는데 돈을 걸고 싶습니다.<!-- A real-world example is [Bootstrap](http://getbootstrap.com/). Bootstrap is comprised of individual files (bootstrap.css, bootstrap.js, fonts), requires JQuery for its plugins, and provides markup examples. Developers like à la carte flexibility. It allows them buy in to the parts of the framework _they_ want to use. That said, I'd wager your typical JoeDeveloper&#8482; goes the easy route and downloads all of Bootstrap. -->

부트스트랩 같은 것에 대해 크게 이해해봅시다. 저는 여러분에게 부트스트랩 로딩의 미래에 대해 소개하고 싶습니다.<!-- Imports make a ton of sense for something like Bootstrap. I present to you, the future of loading Bootstrap: -->

    <head>
      <link rel="import" href="bootstrap.html">
    </head>

사용자는 간단하게 HTML Import 링크를 로드합니다. 파일의 파편들에 법석을 떨 필요는 없습니다. 대신, 다음 bootstrap.html과 같이 부트스트랩의 전부는 Import에 의해 감싸지고 관리됩니다.<!-- Users simply load an HTML Import link. They don't need to fuss with the scatter-shot
of files. Instead, the entirety of Bootstrap is managed and wrapped up in an import, bootstrap.html: -->

    <link rel="stylesheet" href="bootstrap.css">
    <link rel="stylesheet" href="fonts.css">
    <script src="jquery.js"></script>
    <script src="bootstrap.js"></script>
    <script src="bootstrap-tooltip.js"></script>
    <script src="bootstrap-dropdown.js"></script>
    ...

    <!-- scaffolding markup -->
    <template>
      ...
    </template>

이대로 두십시요. 이 자체로 훌륭합니다.<!-- Let this sit. It's exciting stuff. -->

<h3 id="events">로드/에러 이벤트<!-- Load/error events --></h3>

`<link>` 엘리먼트는 import가 성공적으로 로딩되면 `load` 이벤트가 그리고 `onerror`는 (가령 리소스 404s 같은) 실패가 발생할 때 발생합니다.
<!-- The `<link>` element fires a `load` event when an import is loaded successfully
and `onerror` when the attempt fails (e.g. if the resource 404s). -->

Imports는 즉시 로딩을 시도합니다. 투통을 피하는 쉬운 방법은 다음과 같이 `onload`/`onerror` 속성들을 사용하는 것입니다.
<!-- Imports try to load immediately. An easy way avoid headaches
is to use the `onload`/`onerror` attributes: -->

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

<p class="notice tip">이벤트 핸들러가 페이지에서 import가 로딩되기 전에 정의된다는 점에 주의하시기 바랍니다. 브라우저는 태그를 맞닥뜨리자마자 import를 로딩하려 합니다. 만약 함수가 아직 존재하지 않는다면 정의되지 않은 함수명들에 대한 콘솔 에러를 보게 될 것입니다.<!-- Notice the event handlers are defined before the import is loaded on the page. The browser tries to load the import as soon as it encounters the tag. If the functions don't exist yet, you'll get console errors for undefined function names. --></p>

혹은 import를 동적으로 생성하고자 한다면 다음과 같이 할 수 있습니다.
<!-- Or, if you're creating the import dynamically: -->

    var link = document.createElement('link');
    link.rel = 'import';
    link.href = 'file.html'
    link.onload = function(e) {...};
    link.onerror = function(e) {...};
    document.head.appendChild(link);

<h2 id="usingcontent">컨텐츠 사용하기<!-- Using the content --></h2>

페이지에서 import를 포함하는 것은 "저 파일의 컨텐츠를 여기에 퐁당 넣어줘"라는 것을 뜻하지 않습니다. "파서, 이 문서를 불러와서 내가 쓸 수 있도록 해둬"라는 뜻입니다. 정말 컨텐츠를 사용하기 위해서는 액션을 취하고 스크립트를 작성해야 합니ㅏㄷ.
<!-- Including an import on a page doesn't mean "plop the content of that file here". It means "parser, go off an fetch this document so I can use it". To actually use the content, you have to take action and write script. -->

치명적으로 `아하!`하는 순간은 import가 그저 문서라는 것을 깨달을 때입니다. 사실, import의 컨텐츠는 *삽입된 문서(import document)*로 불립니다. **표준적인 DOM API들을 사용하여 import를 소화하는 것을 다룰 수* 있습니다!<!-- A critical `aha!` moment is realizing that an import is just a document. In fact, the content of an import is called an *import document*. You're able to **manipulate the guts of an import using standard DOM APIs**! -->

<h3 id="importprop">link.import</h3>

import의 컨텐츠를 액세스하기 위해 다음과 같이 link 엘리먼트의 `.import` 속성을 사용할 수 있습니다.<!-- To access the content of an import, use the link element's `.import` property: -->

    var content = document.querySelector('link[rel="import"]').import;

`link.import`는 다음과 같은 조건 하에서는 `null`입니다.<!-- `link.import` is `null` under the following conditions: -->

- 브라우저가 HTML Imports를 지원하지 않을 경우.
- `<link>`가 `rel="import"`를 가지지 않을 경우.
- `<link>`가 DOM에 추가되지 않은 경우.
- `<link>`가 DOM으로부터 제거된 경우.
- 리소스가 'CORS가 가능한 상태'가 아닐 경우.
<!-- - The browser doesn't support HTML Imports.
- The `<link>` doesn't have `rel="import"`.
- The `<link>` has not been added to the DOM.
- The `<link>` has been removed from the DOM.
- The resource is not CORS-enabled. -->

**전체 예제**<!-- **Full example** -->

이제 `warning.html`에 포함된 것에 대해 얘기해보도록 하겠습니다.<!-- Let's say `warnings.html` contains: -->

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

삽입자(Importer)들은 다음과 같이 이 문서의 특정한 영역을 잡아 복사해서 페이지에 안으로 붙여넣습니다.<!-- Importers can grab a specific portion of this document and clone it into their page: -->

    <head>
      <link rel="import" href="warnings.html">
    </head>
    <body>
      ...
      <script>
        var link = document.querySelector('link[rel="import"]');
        var content = link.import;

        // Grab DOM from warning.html's document.
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

<h3 id="includejs">Imports 안에서의 스크립팅<!-- Scripting in imports --></h3>

Imports는 메인 도큐먼트 안에 있지 않습니다. 그 주위를 맴돌고 있습니다. 그러나, 여러분의 import는 메인 도큐먼트가 맹위를 떨치는 동안에도 여전히 메인 페이지에서 동작할 수 있습니다. 다음과 같이 Import는 그 자신의 DOM과 (혹은) import된 페이지의 DOM을 액세스할 수 있습니다.<!-- Imports are not in the main document. They're satellite to it. However, your import can still act on the main page even though the main document reigns supreme. An import can access its own DOM and/or the DOM of the page that's importing it: -->

**예제** - 메인 페이지에 자신의 스타일시트 중의 하나를 추가하는 import.html<!-- **Example** - import.html that adds one of its stylesheets to the main page -->

    <link rel="stylesheet" href="http://www.example.com/styles.css">
    <link rel="stylesheet" href="http://www.example.com/styles2.css">
    ...

    <script>
      // importDoc은 import의 문서를 참조합니다.
      var importDoc = document.currentScript.ownerDocument;

      // mainDoc 메인 도큐먼트(우리가 import한 페이지)를 참조합니다.
      var mainDoc = document;

      // 첫번째 스타일시트를 이 import로부터 붙잡아 복제하고,
      // import된 문서에 추가합니다.
      var styles = importDoc.querySelector('link[rel="stylesheet"]');
      mainDoc.head.appendChild(styles.cloneNode(true));
    </script>
<!-- 
    <link rel="stylesheet" href="http://www.example.com/styles.css">
    <link rel="stylesheet" href="http://www.example.com/styles2.css">
    ...

    <script>
      // importDoc references this import's document
      var importDoc = document.currentScript.ownerDocument;

      // mainDoc references the main document (the page that's importing us)
      var mainDoc = document;

      // Grab the first stylesheet from this import, clone it,
      // and append it to the importing document.
      var styles = importDoc.querySelector('link[rel="stylesheet"]');
      mainDoc.head.appendChild(styles.cloneNode(true));
    </script>
 -->

어떻게 이렇게 되는지 주의하여 보시기 바랍니다. import 안의 스크립트는 삽입된(imported) 문서를 참조하고 있으며(`document.currentScript.ownerDocument`) 그 문서의 일부를 삽입된(imported) 페이지에 추가합니다. (`mainDoc.head.appendChild(...)`) 여러분이 물어보신다면 꽤나 기가 막힌 방법이라고 대답하고 싶습니다.<!-- Notice what's going on here. The script inside the import references the imported document (`document.currentScript.ownerDocument`), and appends part of that document to the importing page (`mainDoc.head.appendChild(...)`). Pretty gnarly if you ask me. -->

<blockquote class="commentary talkinghead">import 내의 스크립트는 코드의 직접 실행이나 삽입 중인 페이지에서 사용될 함수를 정의하는 것이 가능합니다. 이것은 파이썬에서 정의하고 있는 <a href="http://docs.python.org/2/tutorial/modules.html#more-on-modules">modules</a>과도 유사한 방식입니다.<!-- A script in an import can either execute code directly, or define functions to be used by the importing page. This is similar to the way <a href="http://docs.python.org/2/tutorial/modules.html#more-on-modules">modules</a> are defined in Python. -->
</blockquote>

import 내의 자바스크립트 룰들은 다음과 같습니다.<!-- Rules of JavaScript in an import: -->

- import 내의 스크립트는 삽입된 `document`를 포함하는 window의 컨텍스트(context)에서 실행됩니다. 따라서 `window.document`는 메인 도큐먼트를 참조합니다. 이것은 다음과 같이 유용한 2가지로 귀결됩니다.
    - 함수는 결국 import 안에서 `window`에 정의됩니다.
    - import의 `&lt;script>` 블록들을 메인 페이지에 덧붙이기는 것 같은 미친 짓을 할 필요가 없습니다. 다시 말해, 스크립트는 이미 실행된 상태입니다.
- Imports는 메인 페이지의 파싱을 블록하지 않습니다. 그러나 그것들 내의 스크립트는 순서대로 처리됩니다. 이것은 여러분이 적합한 스크립트 순서를 유지하는 동안 연기하는 것(defer-like)과 같은 동작을 여러분이 가지게 된다는 것을 뜻합니다. 자세한 것은 아래에서 살펴보시기 바랍니다.

<!-- - Script in the import is executed in the context of the window that contains the importing `document`. So `window.document` refers to the main page document. This has two useful corollaries:
    - functions defined in an import end up on `window`.
    - you don't have to do anything crazy like append the import's `<script>` blocks to the main page. Again, script gets executed.
- Imports do not block parsing of the main page. However, scripts inside them are processed in order. This means you get defer-like behavior while maintaining proper script order. More on this below. -->

<h2 id="deliver-webcomponents">웹 컴포넌트(Web Components) 배포하기<!-- Delivering Web Components --></h2>

HTML Imports의 디자인은 웹 상에서 재사용가능한 컨텐츠를 로딩에 적합합니다. 특히 웹 컴포넌트를 배포하는데 이상적인 방법입니다. 기본적인 [HTML `<template>`](/webcomponents/template/)로 시작하여 만개된 Shadow DOM [[1](/tutorials/webcomponents/shadowdom/), [2](/tutorials/webcomponents/shadowdom-201/), [3](/tutorials/webcomponents/shadowdom-301/)]까지 모든 것이 있습니다. 이러한 기술들을 함께 사용하면 imports는 웹 컴포넌트를 위한 [`#include`](http://en.cppreference.com/w/cpp/preprocessor/include)이 됩니다.<!-- The design of HTML Imports lends itself nicely to loading reusable content on the web. In particular, it's an ideal way to distribute Web Components. Everything from basic [HTML `<template>`](/webcomponents/template/)s to full blown [Custom Elements](/tutorials/webcomponents/customelements/#registering) with Shadow DOM [[1](/tutorials/webcomponents/shadowdom/), [2](/tutorials/webcomponents/shadowdom-201/), [3](/tutorials/webcomponents/shadowdom-301/)]. When these technologies are used in tandem, imports become a [`#include`](http://en.cppreference.com/w/cpp/preprocessor/include) for Web Components. -->

<h3 id="include-templates">템플릿 포함하기<!-- Including templates --></h3>

[HTML Template](/tutorials/webcomponents/template/)는 HTML Imports에 적합한 자연스러운 엘리먼트입니다. `<template>`는 원하는 대로 앱을 삽입하기 위한 마크업 섹션들을 훌륭한 발판들을 제공합니다.`<template>` 안에 컨텐츠를 감싸는 것 또한 사용될 때까지 컨텐츠를 비활성화하는 장점을 더해줍니다. 즉, 스크립트는 템플릿이 DOM에 추가될 때까지 실행되지 않습니다. 빠밤!<!-- The [HTML Template](/tutorials/webcomponents/template/) element is a natural fit for HTML Imports. `<template>` is great for scaffolding out sections of markup for the importing app to use as it desires. Wrapping content in a `<template>` also gives you the added benefit of making the content inert until used. That is, scripts don't run until the template is added to the DOM). Boom! -->

import.html

    <template>
      <h1>Hello World!</h1>
      <img src="world.png"> <!-- 템플릿이 라이브될 때까지 요청되지 않습니다. -->
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

        // import에서 <template>를 복제합니다.
        var template = link.import.querySelector('template');
        var content = template.content.cloneNode(true)

        document.querySelector('#container').appendChild(content);
      </script>
    </body>

<h3 id="include-elements">커스텀 엘리먼트(Custom Elements) 등록하기<!-- Registering custom elements --></h3>

[Custom Elements](tutorials/webcomponents/customelements/)는 HTML Import와 터무니없이 잘 동작하는 또다른 웹 컴포넌트 기술입니다. [Imports는 스크립트를 실행할 수 있으며](#includejs) 따라서 여러분의 커스텀 엘리먼트들을 정의하고 등록해보도록 하겠습니다. 이것을..."자동-등록(Auto-registration"이라고 부릅니다.<!-- [Custom Elements](tutorials/webcomponents/customelements/) is another Web Component technology that plays absurdly well with HTML Imports. [Imports can execute script](#includejs), so why not define + register your custom elements so users don't have to? Call it..."auto-registration".  -->

elements.html

    <script>
      // <say-hi>를 정의하고 등록합니다.
      var proto = Object.create(HTMLElement.prototype);
      
      proto.createdCallback = function() {
        this.innerHTML = 'Hello, <b>' +
                         (this.getAttribute('name') || '?') + '</b>';
      };

      document.register('say-hi', {prototype: proto});

      // Shadow DOM을 사용하는 <shadow-element>을 정의하고 등록합니다.
      var proto2 = Object.create(HTMLElement.prototype);

      proto2.createdCallback = function() {
        var root = this.createShadowRoot();
        root.innerHTML = "<style>::content > *{color: red}</style>" +
                         "I'm a " + this.localName +
                         " using Shadow DOM!<content></content>";
      };
      document.register('shadow-element', {prototype: proto2});
    </script>

이 import는 `<say-hi>`와 `<shadow-element>`, 2개의 엘리먼트들을 정의(하고 등록)합니다. 삽입자(Importer)는 페이지 상에서 간단하게 선언될 수 있습니다. 다른 연결은 필요하지 않습니다.<!-- This import defines (and registers) two elements, `<say-hi>` and `<shadow-element>`. The importer can simply declare them on their page. No wiring needed. -->

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

개인적인 의견으로는, 이 작업흐름 자체가 HTML Imports를 웹 컴포넌트를 공유하기 위한 이상적인 방법으로 만든다고 생각합니다.<!-- In my opinion, this workflow alone makes HTML Imports an ideal way to share Web Components. -->

<h3 id="depssubimports">의존성 및 부-삽입(sub-imports) 관리하기<!-- Managing dependencies and sub-imports --></h3>

> 어이 강아지. 난 네가 imports를 좋아한다고 들었어. 그러니, 나도 너의 import _안_에 import를 포함할께.
<!-- > Yo dawg. I hear you like imports, so I included an import _in_ your import. -->

<h4 id="sub-imports">부-삽입(Sub-imports)<!-- Sub-imports --></h4>

하나의 import에 다른 것(import)를 포함하는 것은 유용할 수 있습니다. 예를 들어, 다른 컴포넌트를 재사용하거나 확장하고자 할 때 다른 엘리먼트(들)을 삽입하는데 사용할 수 있습니다.<!-- It can be useful for one import to include another. For example, if you want to reuse or extend another component, use an import to load the other element(s). -->

아래는 [Polymer](http://polymer-project.org)를 사용한 실제 예제로 레이아웃과 셀렉터 컴포넌트를 재사용하여 만든 새로운 탭 컴포넌트입니다. 의존성은 HTML Imports를 이용하여 관리됩니다.<!-- Below is a real example from [Polymer](http://polymer-project.org). It's a new tab component (`<polymer-ui-tabs>`) that reuses a layout and selector component. The dependencies are managed using HTML Imports. --> 

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

[전체 소스](https://github.com/Polymer/polymer-ui-elements/blob/master/polymer-ui-tabs/polymer-ui-tabs.html)
<!-- [full source](https://github.com/Polymer/polymer-ui-elements/blob/master/polymer-ui-tabs/polymer-ui-tabs.html) -->

앱 개발자는 이 새로운 엘리먼트를 다음을 사용하여 삽입(import)할 수 있습니다.
<!-- App developers can import this new element using: -->

    <link rel="import" href="polymer-ui-tabs.html">
    <polymer-ui-tabs></polymer-ui-tabs>

새롭고 더 훌륭한 `<polymer-selector2>`가 미래에 만들어진다면 여러분은 `<polymer-selector>`을 교환할 수 있으며 곧바로 그것을 사용하기 시작할 수도 있습니다. 여러분의 사용자가 imports와 웹 컴포넌트에 대해 고마워하는 것을 막지 않으셔도 됩니다.<!-- When a new, more awesome `<polymer-selector2>` comes along in the future, you can swap out `<polymer-selector>` and start using it straight away. You won't break your users thanks to imports and web components. -->

<h4 id="deps">의존성 관리</h4>

우리 모두는 페이지당 여러번 jQuery의 로딩되면 에러를 발생한다는 것을 알고 있습니다. 여러개의 컴포넌트가 동일한 라이브러리를 사용할 때 웹 컴포넌트에 _거대한_ 문제가 되지 않을까요? 우리가 HTML Imports를 사용한다면 그렇지 않습니다! 의존성을 관리하기 위해 사용될 수 있기 때문입니다.<!-- We all know that loading JQuery more than once per page causes errors. Isn't this going to be a _huge_ problem for Web Components when multiple components use the same library? Not if we use HTML Imports! They can be used to manage dependencies. -->

HTML Import에서 라이브러리를 감싸는 것으로 인해 여러분은 자동으로 리소스의 중복 처리를 할 수 있습니다. 문서는 단 한번 파싱됩니다. 스크립트는 단 한번 실행됩니다. 예를 들어 여러분이 jQuery의 사본을 로딩하는 jQuery.html이라는 import를 정의했다고 해보겠습니다.<!-- By wrapping libraries in an HTML Import, you automatically de-dupe resources.
The document is only parsed once. Scripts are only executed once. As an example, say you define an import, jquery.html, that loads a copy of JQuery. -->

jquery.html

    <script src="http://cdn.com/jquery.js"></script>

이것은 다음과 같이 차후의 imports에서 재사용될 수 있습니다.<!-- This import can be reused in subsequent imports like so: -->

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

만약 라이브러리를 필요로한다면 다음과 같이 메인 페이지 그 자체조차도 jquery.html을 포함할 수 있습니다.<!-- Even the main page itself can include jquery.html if it needs the library: -->

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

jquery.html이 많은 다른 import 트리에서 포함되어 있음에도 불구하고, 문서는 브라우저에 의해 단 한번 불러지고 단 한번 처리됩니다. 이를 입증하는 것을 다음과 같이 네트워크 패널에서 시험해보시기 바랍니다.<!-- Despite jquery.html being included in many different import trees, it's document is only fetched and processed once by the browser. Examining the network panel proves this: -->

<figure>
  <img src="requests-devtools.png">
  <figcaption>jquery.html는 단 한번 요청됩니다.<!-- jquery.html is requested once --></figcpation>
</figure>

<h2 id="performance">성능 상의 고려사항들<!-- Performance considerations --></h2>

HTML Imports는 전체적으로 놀랍습니다만 어떠한 새로운 웹 기술과도 마찬가지로, 현명하게 사용해야만 합니다. 웹 개발의 성공 사례들은 여전히 유효합니다. 아래 몇가지는 항상 마음에 새겨두고 있어야 할 것들입니다.<!-- HTML Imports are totally awesome but as with any new web technology, you should use them wisely. Web development best practices still hold true. Below are some things to keep in mind. -->

<h3 id="perf-concat">Imports 결합하기<!-- Concatenate imports --></h3>

네트워크 요청의 감소는 언제나 중요합니다. 만약 여러분이 많은 최상위 import 링크를 가지고 있다면, 그것들을 하나의 리소스로 결합하고 그 파일을 삽입(import)하는 것을 고려하시기 바랍니다!<!-- Reducing network requests is always important. If you have many top-level import links, consider combining them into a single resource and importing that file! -->

[Vulcanizer](https://github.com/Polymer/vulcanize)는 [Polymer](http://www.polymer-project.org/) 팀이 HTML Import의 세트를 하나의 파일 상에 재귀적으로 평탄화하기 위해 만든 npm 빌드 도구입니다. 웹 컴포넌트의 결합 빌드 과정 순으로 생각해 보시기 바랍니다.<!-- [Vulcanizer](https://github.com/Polymer/vulcanize) is an npm build tool from the [Polymer](http://www.polymer-project.org/) team that recursively flattens a set of HTML Imports into a single file. Think of it as a concatenation build step for Web Components. -->

<h3 id="perf-caching">Imports에 대한 브라우저 캐싱의 지렛대 효과<!-- Imports leverage browser caching --></h3>

많은 사람들이 브라우저의 네트워킹 스택이 몇년동안 잘 튜닝되었다는 것을 잊고 있습니다. Imports(그리고 sub-imports) 역시도 이 로직의 이점을 취하고 있습니다. `http://cdn.com/bootstrap.html` import는 부-리소스(sub-resource)들을 가지고 있지만 그것들은 캐싱될 것입니다.<!-- Many people forget that the browser's networking stack has been finely tuned over the years. Imports (and sub-imports) take advantage of this logic too. The `http://cdn.com/bootstrap.html` import might have sub-resources, but they'll be cached. -->

<h3 id="perf-inert">컨텐츠는 추가했을 때만 유용합니다.<!-- Content is useful only when you add it --></h3>

컨텐츠가 그 서비스 상에서 호출할 때까지 비활성화되어 있다고 생각해봅시다. 일반적으로, 다음과 같이 동적으로 스타일시트를 생성합니다.<!-- Think of content as inert until you call upon its services. Take a normal, dynamically created stylesheet: -->

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles.css';

브라우저는 다음과 같이 `link`가 DOM에 추가되기 전까지 styles.css를 요청하지 않을 것입니다.<!-- The browser won't request styles.css until `link` is added to the DOM: -->

    document.head.appendChild(link); // browser requests styles.css

또다른 예제는 다음과 같이 동적으로 마크업을 생성하는 것입니다.<!-- Another example is dynamically created markup: -->

    var h2 = document.createElement('h2');
    h2.textContent = 'Booyah!';

`h2`는 DOM에 추가되기 전까지 비교적 무의미하다고 할 수 있습니다.<!-- The `h2` is relatively meaningless until you add it to the DOM. -->

동일한 개념이 문서의 import에 해당됩니다. 여러분이 컨텐츠를 DOM에 추가하지 않는다면 어떠한 동작(no-op)도 하지 않습니다. 사실, 삽입(import)된 문서에서 바로 "실행(executes)"되는 것은 `&lt;script>`뿐입니다. [imports에서의 스크립팅](#includejs)을 살펴보시기 바랍니다.<!-- The same concept holds true for the import document. Unless you append it's content to the DOM, it's a no-op. In fact, the only thing that "executes" in the import document directly is `<script>`. See [scripting in imports](#includejs).-->

<h3 id="perf-parsing">비동기 로딩에 대한 최적화<!-- Optimizing for async loading --></h3>

**Imports는 메인 페이지의 파싱을 블록하지 않습니다.** import 내의 스크립트들은 순서대로 처리되지만 페이지의 삽입(importing)을 블록하지 않습니다. 이것은 적합한 스크립트 순서를 유지하는 동안 연기하는 듯한(defer-like) 동작을 가지게 된다는 것을 뜻합니다. `&lt;head>` 내에 imports를 밀어넣는 한가지 이점은 가능한한 빠르게 파서가 동작을 시작하도록 하는 것입니다. 말한 바와 같이 메인 도큐먼트 내의 `&lt;script>`가 다음과 같이 페이지를 블록하는 것을 *여전히* 계속하고 있다는 것을 기억하는 것이 중요합니다.<!--**Imports don't block parsing of the main page**. Scripts inside imports are processed in order but don't block the importing page. This means you get defer-like behavior while maintaining proper script order. One benefit of putting your imports in the `<head>` is that it lets the parser start working on the content as soon as possible. With that said, it's critical to remember `<script>` in the main document *still* continues to block the page:-->

    <head>
      <link rel="import" href="/path/to/import_that_takes_5secs.html">
      <script>console.log('I block page rendering');</script>
    </head>

앱 구조와 사용 사례에 대해 의존적이지만, 비동기적인 동작을 최적화하는 몇가지 방법이 있습니다. 아래와 같은 테크닉은 메인 페이지의 렌더링에 대한 블로킹을 완화합니다.<!-- Depending on your app structure and use case, there are several ways to optimize async behavior. The techniques below mitigate blocking the main page rendering. -->

**시나리오 #1 (우선적인): 여러분은 `&lt;head>` 안의 스크립트나 `&lt;body>` 내의 인라인을 가지고 있지 않습니다.**<!-- **Scenario #1 (preferred): you don't have script in `<head>` or inlined in `<body>`** -->

`&lt;script>`의 위치에 대한 제 권장 사항은 imports를 즉시 따르는 것을 피하는 것입니다. 스크립트를 가능한한 경쟁적으로 늦추도록 이동하시기 바랍니다...그러나 여러분은 이미 최선의 사례를 해봤습니다, 그렇지요!? ;)<!-- My recommendation for placing `<script>` is to avoid immediately following your imports. Move scripts as late in the game as possible...but you're already doing that best practice, AREN'T YOU!? ;) -->

여기 예제가 하나 있습니다.<!-- Here's an example: -->

    <head>
      <link rel="import" href="/path/to/import.html">
      <link rel="import" href="/path/to/import2.html">
      <!-- 스크립트를 포함하는 것을 피하세요. -->
    </head>
    <body>
      <!-- 스크립트를 포함하는 것을 피하세요. -->

      <div id="container"></div>

      <!-- 스크립트를 포함하는 것을 피하세요. -->
      ...

      <script>
        // 다른 스크립트와 기타 등등.

        // 삽입된(import) 컨텐츠에 가져옵니다.
        var link = document.querySelector('link[rel="import"]');
        var post = link.import.querySelector('#blog-post');
        
        var container = document.querySelector('#container');
        container.appendChild(post.cloneNode(true));
      </script>
    </body>

모든 것을 아래에 두었습니다.<!-- Everything is at the bottom. -->

**시나리오 1.5: 스스로를 삽입(import)**<!-- **Scenario 1.5: the import adds itself** -->

또다른 선택 사항은 [자신의 컨텐츠를 추가하는](#includejs) import를 가지는 것입니다. 만약 import 작성자가 앱 개발자가 따를 수 있는 약속을 한다면, import는 다음과 같이 메인 페이지 영역에 스스로를 추가할 수 있습니다.<!-- Another option is to have the import [add its own content](#includejs). If the import author establishes a contract for the app developer to follow, the import can add itself to an area of the main page: -->

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
      <!-- 스크립트에서 해야할 것은 없습니다. import가 관리할 것입니다. -->
    </body>

**시나리오 #2: 여러분은 `&lt;head>` 안의 스크립트나 `&lt;body>` 내의 인라인을 가지고 있지 않습니다.**<!-- **Scenario #2: you *have* script in `<head>` or inlined in `<body>`** -->

로딩에 오랜 시간이 걸리는 import를 가지고 있다면 페이지 상에서 그에 이어지는 첫번째 `&lt;script>`는 렌더링으로부터 페이지를 블록할 것입니다. `>head>`내에 추적 코드를 넣는 것을 권장하는 Google Analytics가 그 예로, 만약 `&lt;head>` 내에 `&lt;script>`를 넣는 것을 피할 수 없다면, 다음과 같이 동적으로 import를 추가하는 것이 페이지의 블로킹을 방지할 것입니다.
<!--If you have an import that takes a long time to load, the first `<script>` that follows it on the page will block the page from rendering. Google Analytics for example, recommends putting the tracking code in the `<head>`, If you can't avoid putting `<script>` in the `<head>`, dynamically adding the import will prevent blocking the page: -->

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

        addImportLink('/path/to/import.html'); // Import가 미리 추가되었습니다. :)
      </script>
      <script>
        // 다른 스크립트들
      </script>
    </head>
    <body>
       <div id="container"></div>
       ...
    </body>

그 대신에 다음과 같이 import를 `<body>`의 마지막 부분 근처에 추가합니다.
<!-- Alternatively, add the import near the end of the `<body>`: -->

    <head>
      <script>
        // 다른 스크립트들
      </script>
    </head>
    <body>
      <div id="container"></div>
      ...

      <script>
        function addImportLink(url) { ... }

        addImportLink('/path/to/import.html'); // Import는 아주 늦게 추가되었습니다. :(
      </script>
    </body>

<p class="notice"><b>Note:</b> 이 최근의 접근 방법은 거의 선호되지 않습니다. 페이지 내에 늦게 추가되어 파서는 삽입(import) 컨텐츠에 대해 동작을 시작하지 않습니다.<!-- This very last approach is least preferable. The parser doesn't start to work on the import content until late in the page. --></p>

<h2 id="tips">기억해두어야 할 것들<!-- Things to remember --></h2>

- import의 mimetpye은 `text/html`입니다.<!-- An import's mimetype is `text/html`. -->

- 다른 출신(Origin)으로부터의 리소스는 CORS-가능상태(CORS-enabled)이어야 합니다.<!-- Resources from other origins need to be CORS-enabled. -->

- 동일한 URL로부터의 Imports는 한번만 탐색되고 파싱됩니다. 즉, import 내의 스크립트는 첫번째 import의 발견 시에만 한번 실행된다는 것을 뜻합니다.<!-- Imports from the same URL are retrieved and parsed once. That means script in an import is only executed the first time the import is seen. -->

- import 내의 스크립트는 순서대로 처리되지만 메인 도큐먼트의 파싱을 블록하지는 않습니다.<!-- Scripts in an import are processed in order, but do not block the main document parsing. -->

- import link는 "컨텐츠를 여기에 추가해주세요. (#include the content here)"를 의미하지 않습니다. 이것은 "파서, 이 문서를 불러와서 내가 나중에 쓸 수 있도록 작업을 시작해"라는 뜻입니다. 스크립트가 삽입 시(at import time) 실행되는 동안, 스타일시트, 마크업 그리고 다른 리소스들은 메인 페이지에 명시적으로 추가되어야 합니다. 이는 HTML Imports와 "여기에 컨텐츠를 로딩하고 렌더링해"라고 말하는 `<iframe>`의 가장 큰 차이점입니다.<!-- An import link doesn't mean "#include the content here". It means "parser, go off an fetch this document so I can use it later". While scripts execute at import time, stylesheets, markup, and other resources need to be added to the main page explicitly This is a major difference between HTML Imports and `<iframe>`, which says "load and render this content here". -->

<h2 id="conclusion">결론<!-- Conclusion --></h2>

HTML Imports는 HTML/CSS/JS를 하나의 리소스처럼 함께 묶는 것(Bundling)을 가능하게 합니다. 그 자체가 유용하기 때문에, 이 아이디어는 웹 컴포넌트의 세계에서 매우 강력합니다. 개발자는 다른 사람들이 소비하고 그들의 앱에 가져다 쓸 수 있는 재사용 가능한 컴포넌트를 생성할 수 있으며, 모든 것은 `<link rel="import">`를 통해 배포됩니다.<!-- HTML Imports allow bundling HTML/CSS/JS as a single resource. While useful by themselves, this idea becomes extremely powerful in the world of Web Components. Developers can create reusable components for others to consume and bring in to their own app, all delivered through `<link rel="import">`. -->

HTML Imports는 단순한 개념이지만, 플랫폼에서 흥미로운 많은 사용 사례를 가능하게 할 것입니다.<!-- HTML Imports are a simple concept, but enable a number of interesting use cases for the platform. -->

<h3 id="usecases">사용 사례<!-- Use cases --></h3>

- [HTML/CSS/JS를 한묶음(Bundle)처럼](#bundling) **배포할 수 있습니다**. 이론적으로 여러분은 웹 앱 전체를 다른 것에 삽입(import)할 수 있습니다.
<!-- - **Distribute** related [HTML/CSS/JS as a single bundle](#bundling). Theoretically, you could import an entire web app into another. -->
- **코드 체계성(Code organization)** - 세그먼트 개념은 논리적으로 다른 파일들 내의 모듈성 &amp; 재사용성을 강화합니다.
<!-- - **Code organization** - segment concepts logically into different files, encouraging modularity &amp; reusability. -->
- 하나 이상의 [커스텀 엘리먼트(Custom Element)](/tutorials/webcomponents/customelements/) 정의를 **전달**. import는 [등록(Register)](/tutorials/webcomponents/customelements/#registering)하고 앱 안에 포함하고자 할 때 사용할 수 잇습니다. 이 사례는 엘리먼트의 인터페이스와 정의를 어떻게 사용하는가와 분리하는 좋은 소프트웨어 패턴입니다.
<!-- - **Deliver** one or more [Custom Element](/tutorials/webcomponents/customelements/) definitions. An import can be used to [register](/tutorials/webcomponents/customelements/#registering) and include them in an app. This practices good software patterns, keeping the element's interface/definition separate from how its used. -->
- **의존성 관리**](#depssubimports) - 자동적으로 리소스의 중복처리가 됩니다.
<!-- - [**Manage dependencies**](#depssubimports) - resources are automatically de-duped. -->
- **스크립트 덩어리(Chunk scripts)** - import 전에 대용량의 JS 라이브러리는 실행을 시작하기 위해 그 파일 전체가 순서대로 파싱되어 느립니다. Imports를 사용하면 라이브러리는 chunk A가 파싱되자마자 동작을 시작할 수 있습니다. 더 낮은 지연시간을 보입니다!
<!-- - **Chunk scripts** - before imports, a large-sized JS library would have its file wholly parsed in order to start running, which was slow. With imports, the library can start working as soon as chunk A is parsed. Less latency! -->

      `<link rel="import" href="chunks.html">`:

        <script>/* 스크립트 chunk A는 여기서 실행됩니다. */</script>
        <script>/* 스크립트 chunk B는 여기서 실행됩니다. */</script>
        <script>/* 스크립트 chunk C는 여기서 실행됩니다. */</script>
        ...

- **HTML 파싱의 병렬화** - 처음부터 브라우저가 2개(이상)의 HTML 파서를 병렬적으로 실행할 수 있습니다.
<!-- - **Parallelizes HTML parsing** - first time the browser has been able to run two (or more) HTML parsers in parallel. -->

- import의 대상을 자신으로 변경하는 것만으로 앱에서 **디버깅과 비-디버깅(Non-debug) 모드 간의 변경이 가능합니다.** 앱은 import 대상이 묶여있거나(Bundled) 컴파일된(Compiled) 리소스이거나 import 트리인지 알 필요가 없습니다.
<!-- - **Enables switching between debug and non-debug modes** in an app, just by changing the import target itself. Your app doesn't need to know if the import target is a bundled/compiled resource or an import tree. -->