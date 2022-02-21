{% include "warning.html" %}

이 글은 여러분이 Shadow DOM을 이용하여 할 수 있는 놀라운 일들, 그 이상을 다룹니다. 이 글은 [Shadow DOM 101](/tutorials/webcomponents/shadowdom/)에서 다뤘던 개념들을 기초로 하고 있습니다. 만약 이에 대한 소개를 찾고 있으시다면 위의 글을 보시기 바랍니다.

<h2 id="toc-intro">소개</h2>

터놓고 살펴보도록 하죠. 스타일이 입혀지지 않은 마크없은 전혀 섹시하지 않습니다. 다행스럽게도 [웹컴포넌트의 뒤에 있는 훌륭한 사람들](http://w3c.github.io/webcomponents/explainer/#acknowledgements)이 이를 예견하고 우리를 이에 매달리게 두지 않았습니다. 섀도 트리에서 스타일이 적용된 컨텐츠를 보여줄 때 우리에게는 많은 선택지가 있습니다.

<p class="tip notice">크롬의 경우, 이 글에서 다루는 모든 기능의 실험을 위해 about:flags의 "Enable experimental Web Platform features"을 켜야 합니다. (<b>역주</b>: 한글 버전의 경우 "실험용 웹 플랫폼 기능 사용"으로 표시되어 있을 것입니다.)</p>

<h2 id="toc-style-scoped">스타일 캡슐화(Encapsulation)</h2>

Shadow DOM의 핵심 기능 중의 한가지는 [섀도 경계(shadow boundary)](http://w3c.github.io/webcomponents/spec/shadow/#shadow-trees)입니다. 이는 많은 훌륭한 속성들을 가지고 있지만, 가장 좋은 것들 중의 하나는 자유롭게 스타일 캡슐화를 제공한다는 것입니다. 다시 말하자면 다음과 같습니다.

<p class="notice fact">Shadow DOM 내의 CSS 스타일들은 ShadowRoot로 범위가 지정됩니다. 이는 스타일이 캡슐화되었다는 것을 의미합니다.</p>

아래는 그 예제입니다. 모든 것이 잘 동작하며 여러분의 브라우저가 Shadow DOM을 지원한다면 (현재 브라우저는 지원하<span class="featuresupported no">지않</span>고 있습니다!), "<span style="color:red">Shadow DOM</span>"을 볼 수 있을 것입니다.

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

이 데모에 대한 두가지 흥미로운 관찰 결과는 다음과 같습니다.

- <a href="javascript:alert('There are ' + document.querySelectorAll('h3').length + ' &#60;h3&#62; on this page.')">이 페이지들의 다른 h3들</a>이 있지만 단 하나만이 h3 셀렉터와 매칭되며 그러므로 붉은 색상으로 스타일이 적용되는 것은 ShadowRoot 내의 것입니다. 다시 말해, 스타일에 대한 스코프(Scope)는 기본사항입니다.
- 이 페이지 내의 h3를 대상으로 하는 다른 스타일 규칙들은 제 컨텐츠를 침범하지 않습니다. 이는 **셀렉터는 섀도 경계(Shadow Boundary)를 넘지 못하기** 때문입니다.

이 이야기가 주는 교훈이 있습니까? 우리는 바깥세계로에 대한 스타일 캡슐화를 가지게 된 것입니다. Shadow DOM에게 고마운 일입니다!

<h2 id="toc-style-host">호스트 엘리먼트의 스타일링</h2>

<p class="notice"><b>주의:</b> <code>@host</code>는 Shadow DOM 규격에서 <code>:host()</code>로 변경되었습니다.</p>

`:host`는 다음과 같이 섀도 트리가 호스팅하는 엘리먼트를 선택하고 스타일링할 수 있도록 합니다.

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

한가지 발견한 점은 부모 페이지 내의 규칙들이 엘리먼트에서 정의된 `:host` 규칙들보다 더 높은 (우선순위의) 특이성을 가진다는 것이지만 호스트 엘리먼트에서 정의하는 `style` 속성보다는 낮은 특이성을 가진다는 것입니다. `:host`는 또한 ShadowRoot의 컨텐츠에서만 동작하므로 Shadow DOM의 외부에서 이를 사용할 수는 없습니다.

<h3 id="toc-style-states">사용자 상태들에 반응하기</h3>

`:host`의 일반적인 사용 사례는 [Custom Element](/ko/tutorials/webcomponents/customelements/)를 생성할 때와 각기 다른 사용자 상태들 (:hover, :focus, :active 등)에 반응하기를 원할 때입니다.

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


<h3 id="toc-style-themeing">엘리먼트에 테마 적용하기</h3>

`:host`의 다른 사용법은 테마 적용입니다. `:host(<selecter>)`의 함수 형식은 그와 매칭되는 호스트 혹은 호스트의 어떤 상위 노드(Ancestor)에 대해 매치되는 셀렉터를 가져옵니다.

**예제** - 많은 이들이 `<html>`나 `<body>`에 대한 클래스 적용을 통해 테마를 구현합니다.

    <body class="different">
      <x-foo></x-foo>
    </body>

`<x-foo>`가 `.different`의 자손일 때 그에 대해서만 스타일을 적용하려면 다음과 같이 `:host(.different)`를 사용합니다.

    :host(.different) {
      color: red;
    }

**예제** - 호스트 자체가 클래스를 가지고 있을 때만 매칭 (예시. `<x-foo class="different"></x-foo>`):

    :host(.different:host) {
      ...
    }

<h3 id="toc-style-multi">하나의 섀도 루트 내로부터 여러 호스트 형식들의 지원</h3>

`:host`에 대한 또다른 사용법은 여러분이 테마 라이브러리를 생성하고 동일한 Shadow DOM으로부터 호스트 엘리먼트의 많은 타입들에 대한 스타일링을 지원하고자 하는 것입니다.

    :host(x-foo:host) {
      /* Applies if the host is a <x-foo> element.*/
    }

    :host(x-bar:host) {
      /* Applies if the host is a <x-bar> element. */
    }

    :host(div) {  {
      /* Applies if the host element or an ancestor is a <div>. */
    }

<h2 id="toc-style-cat-hat">외부에서 Shadow DOM 내부를 스타일링하기</h2>

`/deep/`과 `:shadow` 연결자는 CSS 저작의 명검을 가진 것과도 같습니다.
이들은 Shadow DOM의 경계를 꿰뚫을 수 있도록 하며 섀도 트리 내의 엘리먼트의 스타일 적용을 가능하게 합니다.

<h3 id="toc-style-hat">:shadow 연결자</h3>

`:shadow` 연결자는 *하나의 섀도 경계(Shadow boundary)를 가로지를 때*를 제외하고는 자손 연결자(Descendant combinator, 예시. `div p {...}`)와 일반적으로 동등합니다.
이는 섀도 트리 내의 엘리먼트를 쉽게 선택할 수 있도록 합니다.

    <style>
      #host::shadow span {
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

**예제** (custom elements) - `<x-tabs>`는 `<x-panel>`을 그 자신의 Shadow DOM 내에 자식으로 가지고 있습니다. 각 패널은 제목 `h2`들을 포함하고 있는 그 자신의 섀도 트리를 호스팅합니다. 메인 페이지로부터 저러한 제목들에 스타일을 적용하기 위해서는 다음과 같이 사용합니다.


    x-tabs :shadow x-panel :shadow h2 {
      ...
    }

<h3 id="toc-style-cat">/deep/ 연결자</h3>

`/deep/` 연결자도 `::shadow`와 유사하지만 더 강력합니다. `A /deep/ B` 형태의 셀렉터는 모든 섀도 경계들을 무시하고 임의적인 자손 엘리먼트 B를 매칭합니다. 간단히 말해, `/deep/`는 **섀도 경계(Shadow boundary)를 몇개던 가로지를 수 있습니다.**

`/deep/` 연결자는 일반적으로 다중 레벨의 Shadow DOM을 가진 커스텀 엘리먼트(Custome Elements)의 세상에서 특별히 더 유용합니다. 최고의 예제들은 (각각이 그들 자신의 Shadow DOM을 가진) 커스텀 엘리먼트들이 엄청나게 중첩되어 내재되는 것이나 [`<shadow>`](/ko/tutorials/webcomponents/shadowdom-301/#toc-shadow-insertion)를 사용하여 또다른 엘리먼트로부터 상속받는 엘리먼트를 생성하는 것입니다.

**예제** (custom elements) - 다음과 같이 `<x-tabs>`의 자손인 모든 `<x-panel>` 엘리먼트를 선택하며 모든 섀도 경계를 무시합니다.

    x-tabs /deep/ x-panel {
      ...
    }

<h3 id="toc-css-traverasl">querySelector()를 사용한 동작</h3>

마치 DOM 탐색을 하기위해 [`.shadowRoot`](/ko/tutorials/webcomponents/shadowdom-301/#toc-get-shadowroot)가 섀도 트리들이 여는 것처럼, 연결자들은 셀렉터의 탐색을 위해 섀도 트리들을 엽니다. 지나치게 중첩된 체인을 작성하는 대신 여러분은 다음과 같은 하나의 문장을 작성할 수 있습니다.

    // No fun.
    document.querySelector('x-tabs').shadowRoot
            .querySelector('x-panel').shadowRoot
            .querySelector('#foo');

    // Fun.
    document.querySelector('x-tabs :shadow x-panel :shadow #foo');

<h3 id="toc-style-native">네이티브 엘리먼트의 스타일 적용</h3>

네이티브 HTML 컨트롤들은 스타일 적용에 대한 도전입니다. 많은 사람들이 쉽게 포기하고 주먹구구식으로 해결합니다. 그러나 :shadow와 /deep/을 사용하여 Shadow DOM을 사용하는 웹 플랫폼의 어떠한 엘리먼트라도 스타일을 적용할 수 있습니다. `<video>`와 `<input>`이 좋은 예입니다.

    video /deep/ input[type="range"] {
      background: hotpink;
    }

<div class="demoarea">
  <video id="ex-style-video" controls></video>
</div>

<blockquote class="commentary talkinghead">
:shadow와 /deep/가 스타일 캡슐화의 목적을 깨뜨릴 수 있을까요? 특히 Shadow DOM은 외부로부터의 <em>돌발적인</em> 스타일링을 방지하긴 하지만 이것이 방탄조끼를 약속하지는 않습니다. 개발자들은 여러분의 섀도 트리의 내부를 <em>의도적으로</em> 스타일링할 수 있도록 합니다..만약 그들 스스로가 무엇을 하는 중인지 알고 있다면 말이죠. 더 많은 조작성을 가지고 있는 것은 또한 유연성, 테마 그리고 여러분의 엘리먼트에 대한 재사용성에도 좋은 일입니다.
</blockquote>

<h2 id="toc-style-hooks">스타일 훅(Hook) 생성하기</h2>

커스터마이징은 좋습니다. 특정 경우에 여러분은 섀도의 스타일 방어막에 구멍을 내고 스타일링할 다른 것에 대한 훅(Hook)들을 생성하고 싶을 수 있습니다.

<h3 id="toc-custom-pseduo">:shadow와 /deep/의 사용</h3>

`/deep/` 뒤에는 엄청난 강력함이 있습니다. 이는 개별적인 엘리먼트를 스타일화할 수 있도록 하거나 대량의 엘리먼트들을 테마가 적용될 수 있도록 지정하는 방법을 컴포넌트 저작자에게 제공합니다.

**예제** - `.library-theme` 클래스를 가진 모든 엘리먼트에 스타일을 적용하고, 모든 섀도 트리를 무시

    body /deep/ .library-theme {
      ...
    }

{% comment %}


<h3 id="toc-custom-pseduo">커스텀 슈도 엘리먼트(Custom pseudo element)의 사용</h3>

[WebKit](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css?format=txt)과
[Firefox](https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference/Mozilla_Extensions#Pseudo-elements_and_pseudo-classes) 둘다 네이티브 브라우저 엘리먼트의 내부 조각들을 스타일링하기 위한 Pseudo 엘리먼트를 정의합니다. 좋은 예로써 `input[type=range]`가 있습니다. `::-webkit-slider-thumb`를 대상으로 하여 슬라이더 바(Slider thumb)을 다음과 같이 스타일링할 수 있습니다.

<span style="color:blue">

    input[type=range].custom::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: blue;
      width: 10px;
      height: 40px;
    }

Similar to how browsers provide styling hooks into some internals,
authors of Shadow DOM content can designate certain elements as styleable by
outsiders. This is done through [custom pseudo elements](http://www.w3.org/TR/shadow-dom/#custom-pseudo-elements).

You can designate an element as a custom pseudo element by using the `pseudo` attribute.
Its value, or name, needs to be prefixed with "x-". Doing so creates
an association with that element in the shadow tree and gives outsiders a
designated lane to cross the shadow boundary.

Here's an example of creating a custom slider widget and allowing someone to style
its slider thumb <span style="color:blue">blue</span>:

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
What's really neat about custom pseudo elements? You can style them with outside CSS
but can't access them via outside JS. The shadow boundary is preserved for JS
but loosened for custom pseudo element definitions.
</blockquote>
{% endcomment %}

<h3 id="toc-vars">CSS 변수 사용하기</h3>

<p class="notice">CSS 변수들은 크롬의 about:flags 내 "Enable experimental Web Platform features(실험용 웹 플랫폼 기능 사용)"을 설정한 상태에서 가능합니다.</p>

테마 훅(hook)들을 생성하기 위한 강력한 방법은 [CSS 변수들(Variables)](http://dev.w3.org/csswg/css-variables/)을 통하는 것입니다. 본질적으로 다른 사용자들을 위해 채워넣을 "스타일 플레이스홀더(style placeholder)"의 생성입니다.

그들의 Shadow DOM 내의 변수 플레이스홀더(Variable placeholder)들을 만드는 커스텀 엘리먼트 저작자를 상상해보시기 바랍니다. 다음과 같이 하나는 내부 버튼의 폰트를 스타일링하기 위한 것이고 다른 하나는 그에 대한 색상을 위한 것입니다.

    button {
      color: var(--button-text-color, pink); /* default color will be pink */
      font-family: var(--button-font);
    }

그리고나서, 엘리먼트의 내재자(embedder)는 연결을 위한 그 값들을 정의합니다. 아마도 그 자체 페이지에 대한 엄청나게 멋진 Comic Sans 테마와 매칭하기 위해 다음과 같이 할 것입니다.

    #host {
      --button-text-color: green;
      --button-font: "Comic Sans MS", "Comic Sans", cursive;
    }

CSS 변수들이 상속되는 방법으로 인해 모든 것이 아주 멋지고 이는 아주 잘 동작합니다! 전체적인 그림은 이와 같이 보일 것입니다.

    <style>
      #host {
        --button-text-color: green;
        --button-font: "Comic Sans MS", "Comic Sans", cursive;
      }
    </style>
    <div id="host">Host node</div>
    <script>
    var root = document.querySelector('#host').createShadowRoot();
    root.innerHTML = '<style>' +
        'button {' +
          'color: var(--button-text-color, pink);' +
          'font-family: var(--button-font);' +
        '}' +
        '</style>' +
        '<content></content>';
    </script>

<blockquote class="commentary talkinghead">
이미 이 글에서 몇번 <a href="/ko/tutorials/webcomponents/customelements/">Custom Elements</a>을 언급했습니다. 이제 막 Shadow DOM이 스타일링의 제공과 DOM 캡슐화에 의한 구조적인 토대를 만든다는 것을 알게 되었습니다. 여기서의 개념은 Custom Elements를 스타일링할 때에도 존재합니다.
</blockquote>

<h2 id="toc-style-inheriting">스타일의 상속 및 재설정</h2>

몇몇 경우에서 외부의 스타일을 여러분의 섀도 트리 내에 두기를 원할 수 있습니다. 최고의 예는 댓글 위젯입니다. 대부분의 저작자는 저 위젯의 내장이 아마도 페이지에 속하는 것처럼 보이기를 원할 것입니다. 제가 그렇습니다. 그러므로 font, color, line-heights 등의 속성에 대한 상속을 통해 내장된 페이지의 모습(Look & Feel)을 적용하기 위한 방법이 필요합니다.

유연성을 위해 Shadow DOM은 그 자신의 스타일 방어막에 더 많은 구멍을 낼 수 있도록 합니다. 무엇을 빨아낼 것인지를 조작하기 위한 다음과 같은 2가지 속성이 있습니다.

- **.resetStyleInheritance**
    - `false` - 디폴트. [상속 가능한 CSS 속성들](http://www.impressivewebs.com/inherit-value-css/)이 상속을 유지합니다.
    - `true` - 경계에서 상속가능한 속성들을 `initial`으로 재설정합니다.
- **.applyAuthorStyles**
    - `true` - 저작자의 문서 내에 정의된 속성을 적용합니다. 이는 경계 간에서 "빨아들이기" 위한 스타일을 허가하는 것처럼 생각해도 무방합니다.
    - `false` - 디폴트. 저작 스타일은 섀도 트리에 적용되지 않습니다.

아래는 이 2가지 속성의 변경에 섀도 트리가 어떻게 영향을 받는지를 보여주는 데모입니다.

<pre class="prettyprint">
&lt;style>
  .border {
    border: 1px solid black;
  }
&lt;/style>

&lt;div>
  &lt;h3 class="border">Light DOM&lt;/h3>
&lt;/div>

&lt;script>
var root = document.querySelector('div').createShadowRoot();
root.applyAuthorStyles = <span id="code-applyAuthorStyles">true</span>;
root.resetStyleInheritance = <span id="code-resetStyleInheritance">false</span>;
root.innerHTML = '&lt;style>h3{ color: red; }&lt;/style>' +
                 '&lt;h3 class="border">Shadow DOM&lt;/h3>' +
                 '&lt;content select="h3">&lt;/content>';
&lt;/script>
</pre>

<div class="demoarea" style="width:225px;">
  <div id="style-ex-inheritance"><h3 class="border">Light DOM</h3></div>
</div>
<div id="inherit-buttons">
  <button id="demo-applyAuthorStyles">applyAuthorStyles=true</button>
  <button id="demo-resetStyleInheritance">resetStyleInheritance=false</button>
</div>

<style>
  .border {
    border: 1px solid black;
  }
</style>
<script>
(function() {
var container = document.querySelector('#style-ex-inheritance');
var root = container.createShadowRoot();
root.applyAuthorStyles = true;
//root.resetStyleInheritance = false;
root.innerHTML = '<style>h3{ color: red; }</style><h3 class="border">Shadow DOM</h3><content select="h3"></content>';

document.querySelector('#demo-applyAuthorStyles').addEventListener('click', function(e) {
  root.applyAuthorStyles = !root.applyAuthorStyles;
  e.target.textContent = 'applyAuthorStyles=' + root.applyAuthorStyles;
  document.querySelector('#code-applyAuthorStyles').textContent = root.applyAuthorStyles;
});
document.querySelector('#demo-resetStyleInheritance').addEventListener('click', function(e) {
  root.resetStyleInheritance = !root.resetStyleInheritance;
  e.target.textContent = 'resetStyleInheritance=' + root.resetStyleInheritance;
  document.querySelector('#code-resetStyleInheritance').textContent = root.resetStyleInheritance;
});

})();
</script>

이는 어떻게 `.applyAuthorStyles`가 동작하는지를 쉽게 보여줍니다. 이는 저작자의 `.border` 클래스가 또한 Shadow DOM 내의 같은 클래스를 가진 엘리먼트에 적용되도록 합니다. (예를 들어 "페이지 저작자의 스타일의 적용" 같이)

<p class="notice fact">심지어 <code>apply-author-styles</code> 속성이 설정되면 문서 내에 정의된 CSS 셀렉터들이 섀도 경계(Shadow boundary)를 넘나들지 않습니다. <b>스타일 규칙은 섀도 트리의 내부나 외부 전체에만 매칭되는 것은 아닙니다.</b> 만약 뭔가 더 강력한 것을 원하신다면 <a href="#toc-style-cat-hat">:shadow 유사 엘리먼트(Pseudo element)와 /deep/ 연결자(Combinator)</a>을 확인하시기 바랍니다.</p>

<img src="showinheritance.gif" title="DevTools inherited properties" alt="DevTools inherited properties" style="height:215px;border:1px solid #ccc;float:right;margin-left:10px;">

`.resetStyleInheritance`의 이해는 약간 더 까다롭습니다. 이는 주로 상속가능한 CSS 속성들에만 영향을 미치기 때문입니다. 즉, 여러분이 상속되는 속성을 찾고 있으며 페이지와 ShadowRoot 사이의 경계에 있을 때 호스트로부터 값을 상속받지 말고 대신 (CSS 규격마다) `initial` 값을 사용하시기 바랍니다.

만약 CSS에서 어떤 속성이 상속되는지에 대한 확신이 없다면 [이 유용한 리스트](http://www.impressivewebs.com/inherit-value-css/)를 확인하거나 Element 패널에서 "Show inherited" 체크박스를 토글해보시기 바랍니다.

<h3 id="style-inherit-cheetsheet">시나리오 치트시트(Scenario cheatsheet)</h3>

<p class="notice tip"><b>역주:</b> Cheatsheet는 커닝 쪽지를 일컫기도 하지만 개발측에서는 옆에 두고 잠깐씩 체크할 수 있도록 만들어진 가벼운 문서 같은 것을 뜻하기도 합니다.</p>

이러한 속성들을 사용할 때 보다 쉽게 이해하기 위해 아래에 도움을 줄만한 의사 결정 행렬(Decision matrix)을 준비했습니다. 주머니에 넣어 들고 다니세요. 이는 금과도 같습니다!

<table>
  <tr><th>시나리오</th><th>applyAuthorStyles</th><th>resetStyleInheritance</th></tr>
  <tr><td>"자체적으로 원하는 모습이 있지만 텍스트 색상 같은 기본적인 속성들은 매칭하기를 원합니다."<br>
    <em>기본적으로, 여러분은 위젯을 생성하고 있습니다.</em></td><td>false</td><td>false</td></tr>
  <tr><td>"페이지는 잊어버리세요! 자체적인 테마가 있습니다."<br>
    <em>배포된 컨텐츠가 페이지 내에서 가지고 있는 스타일을 얻어오므로 여러분은 여전히 "컴포넌트의 스타일시트 재설정"이 필요할 것입니다.</em></td><td>false</td><td>true</td></tr>
  <tr><td>"페이지 내의 스타일로부터 테마를 가져오도록 디자인된 컴포넌트입니다."</td><td>true</td><td>true</td></tr>
  <tr><td>"가능한한 최대한 페이지와 혼합하고 싶습니다."<br>
    <em>셀렉터가 섀도 경계를 가로지르지 못한다는 것을 기억하세요</em>.</td><td>true</td><td>false</td></tr>
</table>

<h2 id="toc-style-disbtributed-nodes">배포된 노드들의 스타일링</h2>

`.applyAuthorStyles`/`.resetStyleInheritance`는 Shadow DOM **내에** 정의된 노드들의 스타일링 동작에 미치는 영향에 대해 엄격합니다.

배포된 노드들은 서로가 다른 것입니다. `<content>` 엘리먼트는 Light DOM으로부터 노드를 선택하고 여러분의 Shadow DOM 내에 미리 정의된 위치에 이들을 렌더링하도록 합니다. Shadow DOM 내에서 이들은 호스트 엘리먼트의 자식들이며 필연적이지는 않습니다. 이들은 "렌더링 시간"에 딱 맞게 혼합됩니다.

자연스럽게 배포된 노드들은 그들이 속한 문서(호스트의 문서)로부터 스타일을 얻어옵니다. 이 규칙의 단 한가지 예외는 이들이 (Shadow DOM내의) 혼합된 위치로부터 추가적인 스타일들을 얻어올 수 있다는 것입니다.

<h3 id="toc-distributed">::content 의사 엘리먼트(pseudo element)</h3>

<p class="notice"><b>노트:</b> <code>::content</code>는 Shadow DOM 규격에서 <code>::distributed()</code>를 대치합니다.</p>

만약 배포된 노드들이 호스트 엘리먼트의 자식들이라면 어떻게 우리는 이들을 Shadow DOM *내에서* 대상으로 삼을 수 있을까요? 답은 CSS `::content` 의사 엘리먼트(Pseudo element)입니다. 이는 삽입지점을 통해 전달될 노드들을 대상으로 삼을 수 있는 방법입니다. 예를 들자면 다음과 같습니다.

`::content > h3`는 삽입을 통해 전달될 모든 `h3` 태그들에 스타일을 적용합니다.

다음에서 간단한 예제를 보도록 하겠습니다.

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

여러분은 "<span style="color:red">Shadow DOM</span>"과 그 아래에서 "<span style="color:green">Light DOM</span>"를 볼 수 있을 것입니다. "Light DOM"이 여전히 이 페이지로부터의 스타일들(margin 등)을 유지하고 있음을 주목하시기 바랍니다.

<h3 id="toc-shadow-resetstyles">삽입지점들에서 스타일을 재설정하기</h3>

ShadowRoot를 생성할 때 상속된 스타일의 재설정 여부에 대한 옵션이 있습니다. `<content>`과 `<shadow>` 삽입지점들 또한 이 옵션을 가지고 있습니다. 이러한 엘리먼트들을 사용할 때 자바스크립트에서 `.resetStyleInheritance`를 설정하거나 엘리먼트 자체의 `reset-style-inheritance` boolean 속성을 사용할 수도 있습니다.

- ShadowRoot나 `<shadow>` 삽입지점들의 경우: `reset-style-inheritance`는 여러분의 섀도 컨텐츠에 닿기 전에 상속가능한 CSS 속성들이 호스트에서 `initial`로 설정된다는 것을 의미합니다. **이 위치는 상위 경계(Upper boundary)로 알려져 있습니다.***

- `<content>` 삽입지점들의 경우: `reset-style-inheritance`는 상속가능한 CSS 속성들이 호스트의 자식들이 삽입지점으로 배포되기 전에 `initial`로 설정된다는 것을 의미합니다. **이 위치는 하위 경계(Lower boundary)로 알려져 있습니다.**

<blockquote class="commentary talkinghead">
기억하세요: 호스트 문서 내에 정의된 스타일들은 그들이 대상으로 하고 있는 노드들에 적용이 계속되며 이러한 노드들이 Shadow DOM "내부에" 배포되었을 때도 그렇습니다. 삽입지점으로의 진입이 무엇을 적용하고 있는지를 변경하지는 않습니다.
</blockquote>

<h2 id="toc-conclusion">결론</h2>

Custom elements의 저자들처럼 컨텐츠의 외양(Look & Feel)을 조작하기 위한 수없이 많은 옵션들을 우리는 가지고 있습니다. Shadow DOM은 이러한 멋지고 새로운 세계를 위한 기반을 구성합니다.

Shadow DOM은 스코프화된 스타일 캡슐화(Scoped style encapsulation)와 바깥세상의 대다수(혹은 일부)를 우리가 원하는 만큼 할 수 있는 수단을 제공합니다. 사용자 의사 엘리먼트(Custom pseudo elements) 정의나 CSS 변수 플레이스홀더(CSS Variable placeholders)들의 포함에 의해 저작자들은 그들의 컨텐츠를 더욱 커스터마이징할 수 있는 편리한 서드파티 스타일 훅들을 제공할 수 있습니다. 전적으로 웹 저작자들은 그들의 컨텐츠가 어떻게 표현될지에 대해 완전하게 관리할 수 있습니다.


<p class="small-notice">
이 튜토리얼의 내용을 리뷰해준 <a href="/profiles/#dominiccooney">Dominic Cooney</a>와 <a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a>에게 감사를 표합니다.
</p>

{% block relatedreading %}
<aside class="panel">
  <h2>관련된 읽을거리들</h2>
  <ul>
    <li><a href="/ko/tutorials/webcomponents/shadowdom/">Shadow DOM 101</a></li>
    <li><a href="/ko/tutorials/webcomponents/shadowdom-301/">Shadow DOM 301 - 고급개념 및 DOM APIs</a></li>
    <li><a href="/ko/tutorials/webcomponents/customelements/">Custom Elements - HTML 내의 새로운 엘리먼트 정의하기</a></li>
  </ul>
</aside>
{% endblock %}


