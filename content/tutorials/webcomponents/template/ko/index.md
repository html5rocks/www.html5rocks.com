<h2 id="toc-intro">소개</h2>

템플릿의 개념은 웹 개발에 있어 새로운 것은 아닙니다. 사실, Django(Python), ERB/Haml(Ruby) 그리고 Smarty(PHP)같은 서버 사이드 [템플릿 언어/엔진들](http://en.wikipedia.org/wiki/Template_engine_(web))들이 오래동안 있어왔습니다. 그러나 지난 몇년동안 MVC 프레임워크의 폭팔적인 성장을 보았습니다. 그들 모두는 조금씩 다르지만 아직 ('뷰'라고도 하는) 표현 계층(Presentational layer)를 위한 공통의 동작 원리를 '템플릿'이라는 형태로 공유하고 있습니다.

직접 살펴봅시다. 템플릿은 환상적입니다. 가서 둘러보세요. 그 자체의 [정의](http://www.thefreedictionary.com/template)조차도 다음과 같이 여러분을 따듯하고 편안하게 만들어줄 것입니다.

> **템플릿** (명사) - 특별한 어플리케이션을 위한 시작점으로 사용되는 미리 작성된 형식을 가진 문서나 파일입니다. 즉, 형식(Format)은 사용될 때마다 매번 재생성하지 않아도 됩니다.

"...사용될 때마다 매번 재생성하지 않아도 됩니다...." 여러분은 어떠실지 모르겠지만 전 추가작업을 피하는 것을 사랑합니다. 왜 웹플랫폼은 개발자가 명확하게 관리해야 하는 무언가에 대한 네이티브 지원이 부족할까요?

[WhatWG HTML Templates 표준규격][spec-link]이 그 답입니다. 이는 템플릿을 위한 표준적인 DOM 기반의 접근 방법을 기술하는 새로운 엘리먼트인 `<template>`를 정의합니다. 템플릿은 여러분이 HTML처럼 파싱되는 마크업의 조각을 선언할 수 있도록 하며, 페이지 로딩 시에는 사용되지 않도록 하지만 런타임에는 인스턴스화할 수 있습니다. 아래에 [Rafael Weinstein](https://plus.google.com/111386188573471152118/posts)의 포스트를 인용하도록 하겠습니다.

<blockquote>
  이는 여러분이 브라우저를 완전히 망치고 싶지 않을 때 HTML의 커다란 뭉치를 넣을 수 있는 곳입니다...어떠한 이유로든 말이죠.
  <cite>Rafael Weinstein (규격 저자)</cite>
</blockquote>

<h3 id="toc-detect">기능의 검출</h3>

`<template>` 기능을 검출하기 위해 DOM 엘리먼트를 생성하고 `.content` 속성이 존재하는지를 다음과 같이 검사합니다.

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // Good to go!
    } else {
      // Use old templating techniques or libraries.
    }

<h2 id="toc-started">템플릿 컨텐츠 선언하기</h2>

HTML `<template>` 엘리먼트는 여러분의 마크업에서 템플릿을 표현합니다. 이는 "템플릿 컨텐츠"를 포함하며, 근본적으로 **비활성화된 복제가능한 DOM의 덩어리(Chunk)**입니다. 템플릿을 여러분 앱의 전체 실행시간 동안 사용할 수 있는 (그리고 재사용할 수 있는) 스캐폴딩의 조각으로 생각해보세요.

템플릿화된 컨텐츠를 생성하기 위해 약간의 마크업을 선언하고 이를 `<template>` 엘리먼트로 다음과 같이 감싸도록 합니다.

    <template id="mytemplate">
      <img src="" alt="great image">
      <div class="comment"></div>
    </template>

<blockquote class="commentary talkinghead">
주의깊은 독자들은 아마 비어있는 이미지들에 주목할 것입니다. 이는 정말로 괜찮고 의도된 것입니다. 페이지의 로딩 시에 불러와지지 않을 것이므로 깨진 이미지는 404가 되거나 콘솔 에러를 생성하지 않습니다. 우리는 나중에 소스 URL을 동적으로 생성할 수 있습니다. <a href="#toc-pillars">기본적인 특징들</a>을 보세요.
</blockquote>

<h2 id="toc-pillars">기본적인 특징들</h2>

`<template>` 내에서 컨텐츠를 감싸는 것은 우리에게 몇가지 중요한 속성들을 제공합니다.

1. 이것의 **컨텐츠는 활성화가 될 때까지 효과적으로 비활성화됩니다**. 기본적으로 여러분의 마크업 숨겨진 DOM이며 렌더링되지 않습니다.

2. 템플릿 안의 어떠한 컨텐츠라도 부작용을 가지지 않습니다. 템플릿이 사용될 때까지 **스크립트는 실행되지 않으며 이미지는 로딩되지 않고 오디오는 재생되지 않는 등**

3. **컨텐츠는 문서 내에 있지 않도록 고려되어야 합니다**. 메인 페이지에서 `document.getElementById()`나 `querySelector()`의 사용은 템플릿의 자식 노드들을 반환하지 않을 것입니다.

4. 템플릿은 `<head>`, `<body>` 혹은 `<frameset>` 내의 어느 곳에도 위치**할 수 있습니다**. "어느 곳에서도"는 `<template>`가 [content model](http://www.w3.org/TR/html5-diff/#content-model)의 자식들을 제외한...HTML 파서가 허가하지 않는 모든 위치에서도 안전하게 사용될 수 있다는 것을 의미한다는데 주의하시기 바랍니다. 또한 아래에서 보시다시피 `<table>`이나 `<select>`의 자식처럼 둘 수도 있습니다.

        <table>
        <tr>
          <template id="cells-to-repeat">
            <td>some content</td>
          </template>
        </tr>
        </table>

<h2 id="toc-using">템플릿 활성화하기</h2>

템플릿을 사용하기 위해 이를 활성화할 필요가 있습니다. 그렇지않으면 템플릿의 컨텐츠는 절대로 렌더링되지 않을 것입니다. 이를 위한 가장 쉬운 방법은 `document.importNode()`를 사용하여 템플릿의 `.content`의 완전한 복사본(deep copy) 생성하는 것입니다. `.content` 속성은 템플릿의 내부를 포함하는 읽기 전용의 `DocumentFragment`입니다.

    var t = document.querySelector('#mytemplate');
    // 런타임에 src를 지정합니다.
    t.content.querySelector('img').src = 'logo.png';

    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);

템플릿을 찍어낸 뒤, 컨텐츠는 "가동 준비가 됩니다". 이 특이한 예제에서 컨텐츠는 복제되고 이미지의 요청이 만들어지며 최종적인 마크업이 렌더링됩니다.

<h2 id="toc-using">데모들</h2>

<h3 id="toc-demo-insert">예제: 비활성 스크립트</h3>

이 예제는 템플릿 컨텐츠의 비활성화를 보여줍니다. `<script>`는 버튼이 눌렸을 때만 동작하며 템플릿을 찍어냅니다.

    <button onclick="useIt()">Use me</button>
    <div id="container"></div>
    <script>
      function useIt() {
        var content = document.querySelector('template').content;
        // 템플릿 DOM에서 뭔가를 갱신합니다.
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
<button onclick="useIt()">사용해보세요</button>
<div id="container"></div>
<template id="inert-demo">
  <div>템플릿이 <span>0</span>번 사용되었습니다.</div>
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

<h3 id="toc-demo-sd">예제: 템플릿으로부터 Shadow DOM 생성하기</h3>

아래와 같이 대부분의 사람들은  `.innerHTML`로 마크업 문자열을 설정하는 것으로 [Shadow DOM](/tutorials/webcomponents/shadowdom/)을 호스트에 붙입니다.

    <div id="host"></div>
    <script>
      var shadow = document.querySelector('#host').createShadowRoot();
      shadow.innerHTML = '<span>Host node</span>';
    </script>

이 방식의 문제점은 여러분의 Shadow DOM이 더 복잡해질 수록 더 많은 스트링 접합(Concatenation)을 해야한다는 것입니다. 이는 확장성이 없으며 더 빠르게 지저분해지고 더 정신없도록 만듭니다. 또한 이 방식은 왜 XSS가 첫번째 위치에서 만들어져야 할까요! `<template>`이 구해줄 것입니다.

아래는 템플릿 컨텐츠를 Shadow Root 추가를 통해 직접적으로 DOM과 동작하는 더 괜찮은 예제입니다.

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
      :host(:hover) {
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
        <h3>댓글을 추가하세요.</h3>
      </header>
      <content select="p"></content>
      <textarea></textarea>
      <footer>
        <button>Post</button>
      </footer>
    </div>
    </template>

    <div id="host">
      <p>설명은 여기에 위치합니다.</p>
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
  :host(:hover) {
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
    <h3>댓글을 추가하세요.</h3>
  </header>
  <content select="p"></content>
  <textarea></textarea>
  <footer>
    <button>Post</button>
  </footer>
</div>
</template>

<div id="demo-sd-host">
  <p>설명은 여기에 위치합니다.</p>
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

<h2 id="toc-gotcha">좋습니다!</h2>

야생에서 `<template>`를 사용할 때 우연히 발견한 몇가지 사실들은 다음과 같습니다.


- 만약 [modpagespeed](http://code.google.com/p/modpagespeed/)를 사용하신다면 이 [버그](http://code.google.com/p/modpagespeed/issues/detail?id=625)에 주의하시기 바랍니다. 템플릿들은 `<style scoped>` 인라인으로 정의되었으며 PageSpeed의 CSS 재작성 규칙에 의해 많은 것들이 head로 이동합니다.
- 템플릿을 "미리 렌더링"하기 위한 방법은 없다는 것은 애셋(Asset)들을 미리 로딩하거나 JS를 처리하거나 초기 CSS를 다운로드하는 등의 작업을 할 수 없다는 뜻입니다. 이는 서버와 클라이언트 모두에 해당됩니다. 템플릿은 가동 상태로 갈 때만 렌더링됩니다.
- 중첩된(Nested) 템플릿들에 주의해야 합니다. 이들은 여러분이 기대하는 것처럼 동작하지 않습니다. 예를 들면 다음과 같습니다.

        <template>
          <ul>
            <template>
              <li>Stuff</li>
            </template>
          </ul>
        </template>

    바깥 템플릿의 활성화는 내부 템플릿을 활성화하지 않습니다. 즉, 중첩된 템플릿들은 그들의 자식들 또한 수동으로 활성화하여야 합니다.

<h2 id="toc-old">표준화로의 길</h2>

우리가 어디 출신인지는 잊어버리도록 합시다. 표준 기반의 HTML 템플릿으로의 여정은 아주 멉니다. 몇년이 넘도록 우리는 재사용이 가능한 템플릿을 생성하기 위한 몇가지 꽤 똑똑한 트릭들을 찾아냈습니다. 제가 발견한 2가지 일반적인 것들을 아래에 적어 두었습니다. 비교를 위해 이 글에 이들을 포함했습니다.

<h3 id="toc-offscreen">방법 1: 오프스크린 DOM</h3>

사람들이 오랫동안 사용해온 방법 한가지는 "오프스크린" DOM의 생성과  `hidden` 속성이나 `display:none`을 사용하여 뷰로부터 이를 감추는 것입니다.

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

이 기법이 동작할 때 몇가지 불리한 점이 있습니다. 이 기법의 설명은 아래와 같습니다.

- <label class="good"></label> *DOM 사용* -브라우저는 이미 DOM을 알고 있으며 여기에 익숙합니다. 우리는 이를 쉽게 복제할 수 있습니다.
- <label class="good"></label> *아무것도 렌더링되지 않습니다* - `hidden`의 추가는 보여질 때 블록되는 것을 방지합니다.
- <label class="bad"></label> *비활성화* - 컨텐츠가 감춰져 있더라도 이미지에 대한 네트워크 요청은 여전히 발생합니다.
- <label class="bad"></label> *고통스러운 스타일링과 테마 적용* - 내장 페이지는 템플릿의 범위를 한정하기 위해 반드시 모든 CSS 규칙 전부에 대해 `#mytemplate`을 이용한 접두사를 붙여야합니다. 이는 깨지기 쉬우며 앞으로의 명칭 충돌에 부닥히지 않을 것이라는 보장을 할 수 없습니다. 예를 들어 내장 페이지가 이미 id를 가진 엘리먼트를 가지고 있다면 이를 제거해야합니다.

<h3 id="toc-overloadingscript">방법 2: 스크립트의 오버로딩</h3>

다른 기법은 `<script>`를 오버로딩하고 `<script>`의 컨텐츠를 문자열로 처리하는 것입니다. John Resig이 아마도 2008년에 그의 [초소형 템플릿 유틸리티](http://ejohn.org/blog/javascript-micro-templating/)로 이를 처음 보여주었을 것입니다. 이제 [handlebars.js](http://handlebarsjs.com/)와 같은 몇몇 신참들을 포함한 많은 다른 라이브러리들이 존재합니다.

이에 대한 예는 아래와 같습니다.

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

이 기법의 설명은 다음과 같습니다.

- <label class="good"></label> *아무것도 렌더링되지 않습니다* - 기본적으로 `<script>`가 `display:none`이므로 브라우저는 이를 렌더링하지 않습니다.
- <label class="good"></label> *비활성화* - 타입이 "text/javascript"가 아닌 다른 것으로 설정되어 있으므로 브라우저는 스크립트 컨텐츠를 JS로 파싱하지 않습니다.
- <label class="bad"></label> *보안 문제* - `.innerHTML`의 사용을 조장합니다. 사용자-공급 데이터의 런타임 문자열 파싱은 손쉽게 XSS 취약성을 만들어 냅니다.

<h2 id="toc-conclusion">결론</h2>

jQuery가 DOM과 동작하는 것을 손쉽게 했을 때를 기억하시나요? 결과는 플랫폼에 `querySelector()`/`querySelectorAll()`가 추가되는 것이었습니다. 명백한 승리였죠, 그렇지 않습니까? 라이브러리는 CSS 셀렉터들을 이용하여 DOM을 불러오는 것과 나중에 이를 적용하는 표준을 대중화하였습니다. 항상 이렇게 처리되지는 않습니다면 전 이런 것을 *사랑*합니다.

전 `<template`가 비슷한 경우라고 생각합니다. 이는 우리가 클라이언트측에서 템플릿을 하는 방법을 표준화하지만 더 중요한 것은 [우리가 사용하는 말도 안되는 2008 해킹 코드들](#toc-old)에 대한 필요성을 제거하는 것입니다.

제 판단으로는 전체 웹 저작 프로세스를 보다 온전하고 보다 나은 유지보수성을 가지며 보다 완전한 기능을 가지도록 만드는 것은 언제나 좋은 일입니다.

<h2 id="toc-resources">추가 리소스들</h2>

- [WhatWG 규격][spec-link]
- [웹컴포넌트의 소개](http://w3c.github.io/webcomponents/explainer/#template-section)
- [&lt;web>components&lt;/web>](http://html5-demos.appspot.com/static/webcomponents/index.html) ([video](http://www.youtube.com/watch?v=eJZx9c6YL8k)) - 정말 환상적이고 포괄적인 프리젠테이션.

[spec-link]: http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element
