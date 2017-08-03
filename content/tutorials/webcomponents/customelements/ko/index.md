{% include "warning.html" %}

<h2 id="intro">소개</h2>

웹은 표현에 대해 심각한 부족함을 갖고 있습니다. 무슨 뜻인지 알고 싶다면 다음에서 예로 드는 지메일 같은 "모던" 웹앱에서 확인해볼 수 있습니다.

<figure>
  <a href="gmail.png"><img src="gmail.png" style="max-width:75%"></a>
  <figcaption>Modern web apps: built with <code>&lt;div></code> soup.</figcpation>
</figure>

<div> soup에 대해서는 모던 하지 않습니다. 그리고 아직까지도 이것은 우리가 웹앱을 구축하는 방법이며 슬픕니다. 플랫폼에게 더 많이 요구하지 말아야 할까요?

<h3 id="meaningful">좋은 마크업을 만들어 봅시다.</h3>

HTML은 문서를 구조화 하기 위한 훌륭한 도구를 제공합니다만 [HTML 표준](http://www.whatwg.org/specs/web-apps/current-work/multipage/) 정의 엘리먼트들에 한정되어 있습니다.

어떤 마크업이 지메일을 끔찍해 보이지 않게 할까요. 어떤 마크업이 지메일을 아름답게 보이게 할까요.:

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
  <button><a href="https://html5-demos.appspot.com/hangouts">데모를 실행해 보세요!</a></button>
</p>

얼마나 상쾌한가요! 위의 코드의 element들은 전체적으로 의미가 있습니다. **의미가 있으며**, **이해하기 쉬우며**, 그리고 무엇보다도 **유지보수가 가능합니다**. 미래의 저와 여러분은 단지 그것이 선언된 뼈대만을 검사하는 것만으로도 무엇을 하는 코드인지 정확히 알수 있을 것입니다.

<blockquote class="commentary talkinghead">우리를 돕는 custom element가 우리의 유일한 희망입니다!</blockquote>

<h2 id="gettingstarted">시작하기</h2>

[Custom Elements](http://w3c.github.io/webcomponents/spec/custom/)는 **모든 웹 개발자들이 새로운 타입의 HTML element를 정의 하는 것을 허락합니다.** 이 사양은 [Web Components](http://w3c.github.io/webcomponents/explainer/) 산하 몇몇 새로운 기본 형식 API 중 하나입니다만 이 사양이 가장 중요할 것입니다. Web Components는 Custom Element에 의해 해제된 특성 없이는 존재하지 않습니다.:

1. 새 HTML/DOM elements 정의하기
2. 다른 elements로부터 확장된 element 만들기
3. 하나의 태그에 사용자 지정 기능을 함께 논리적으로 제공하기
4. 존재하는 DOM element의 API 확장하기

<h3 id="registering">새 elements 등록하기</h3>

Custom element는 `document.registerElement()`를 사용하여 만듭니다.:

    var XFoo = document.registerElement('x-foo');
    document.body.appendChild(new XFoo());

`document.registerElement()`의 첫번째 인자는 element의 태그 이름입니다. 태그 이름은 **반드시 dash(-)를 포함해야 합니다.** 그래서 예를 들면, `<x-tags>`, `<my-element>`, 그리고 `<my-awesome-app>`은 모두 유효한 이름이며 `<tabs>` 그리고 `<foo_bar>`는 유효하지 않습니다. 이 제한 조건은 parser가 일반 element 들로부터 custom element를 구별할 수 있도록 하며 HTML 에 새 태그가 추가될때 앞으로의 호환성을 보장합니다.

두번째 인자는 element의 `prototype`을 표현하는 (optional) object 입니다. 이것은 element에 사용자 지정 기능 (예를 들어 공용 속성 및 메서드들)을 추가할 수 있습니다. [그 이상의 기능은 아래에 설명합니다.](#publicapi)

기본적으로 custom element는 `HTMLElement`에서 상속됩니다. 따라서 앞의 예제는 다음의 예제와 동일하게 동작합니다.:

    var XFoo = document.registerElement('x-foo', {
      prototype: Object.create(HTMLElement.prototype)
    });

`document.registerElement('x-foo')` 를 호출하는 것은 새 element에 대해 브라우저에 알려주며 `<x-foo>` 인스턴스를 만드는 데 사용할 수 있는 생성자를 반환합니다. 생성자를 사용하지 않으려는 경우 [element를 인스턴스화 하는 다른 기술](#instantiating)을 사용할 수도 있습니다.

<p class="notice tip">생성자가 전역 <code>window</code> 객체 끝에 위치하는 것을 원하지 않는다면 namespace 안에 넣거나(<code>var myapp = {}; myapp.XFoo = document.registerElement('x-foo');</code>) 특정 영역에 놓습니다.</p>

<h3 id="extendingelements">elements 확장</h3>
 Custom elements는 여러분이 이미 존재하는 (native) HTML elements 뿐만 아니라 다른 custom elements를 확장하는 것을 허용합니다. element를 확장하려면 상속받으려는 element의 이름과 `prototype`을 `registerElement()`로 전달해야 합니다.


<h3 id="extending">native element의 확장</h3>

여러분은 일반적인 Joe&#8482; `<button>`에 만족하지 못합니다. 여러분은 그 기능을 "Mega Button"으로 확장하고 싶습니다. `<button>` element를 확장하기 위해서는 `HTMLButtonElement` 의 `prototype`으로부터 상속받는 새로운 element를 만들어야 하며 element의 이름을 `extends`해야 합니다. 아래의 경우 "button"입니다.:

    var MegaButton = document.registerElement('mega-button', {
      prototype: Object.create(HTMLButtonElement.prototype),
      extends: 'button'
    });

<p class="notice fact"><b>element B</b>로부터 확장하여 <b>element A</b>를 만들기 위해서  <b>element A</b>는 반드시 <b>element B</b>의 <code>prototype</code>으로부터 상속 받아야 합니다.</p>

native elements로부터 상속받은 custom element는 _타입 확장 custom elements_이라 부릅니다. "element X is a Y"와 같은 방법으로 `HTMLElement`의 특별화된 버전으로부터 상속 받을 수 있습니다.

예:

    <button is="mega-button">


<h4 id="extendcustomeel">custom element 확장하기</h4>

`<x-foo>` custom element를 확장한 `<x-foo-extended>` element를 만들기 위해서는 단순히 prototype을 상속받으면 되며 여러분이 무엇으로부터 상속받았는지 `extends`에 이름을 넣으면 됩니다.:

    var XFooProto = Object.create(HTMLElement.prototype);
    ...

    var XFooExtended = document.registerElement('x-foo-extended', {
      prototype: XFooProto,
      extends: 'x-foo'
    });

element prototype을 만들기 위한 더 많은 정보는 아래의 <a href="#publicapi">JS 프로퍼티 및 메서드 추가</a>를 보세요.

<h3 id="upgrades">elements를 업그레이드 하는 방법</h3>

HTML Parser가 표준에 맞지 않는 태그에서 exception을 던지지 않는 이유를 궁금해 한 적이 있습니까? 예를 들면, 만약 우리가 페이지 상에 `<randomtag>`를 선언한다면 완벽히 만족한다. [HTML specification](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#htmlunknownelement)에 따르면:

<blockquote>
    <code>HTMLUnknownElement</code> interface는 현재 specification에 정의 되지 않은 HTML element에서 사용되기 위해 제공된다.
    <cite>HTML spec</cite>
</blockquote>

`<randomtag>` 미안! `<randomtag>`는 비표준이며 `HTMLUnknownElement`로부터 상속된다.

custom elements의 같음 비교는 true가 아닌 결과를 줍니다. **유효한 custom element이름을 갖는 element는 `HTMLElement`로부터 상속받는다.** 여러분은 콘솔에서 이 사실을 확인할 수 있습니다:  <span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">J</span> (또는 Mac에서는  <span class="kbd">Cmd</span>+<span class="kbd">Opt</span>+<span class="kbd">J</span>) 실행된 콘솔에 다음 코드 라인들을 붙여보면 다음 코드 라인들의 return이 `true`인 것을 확인 할 수 있습니다.:

    // "tabs"는 유효한 custom element name이 아닙니다.
    document.createElement('tabs').__proto__ === HTMLUnknownElement.prototype

    // "x-tabs"는 유효한 custom element 이름입니다.
    document.createElement('x-tabs').__proto__ == HTMLElement.prototype

<p class="notice fact"><code>&lt;x-tabs></code> 은 <code>document.registerElement()</code>를 지원하지 않는 브라우저에서는 여전히 <code>HTMLUnknownElement</code> 이다.</p>

<h4 id="unresolvedels">Unresolved elements</h4>

custom element는 `document.registerElement()` 스크립트 사용으로 등록되기 때문에 **그들의 정의가 브라우저에 등록되기 _전엔_ 선언되거나 만들어 질 수 없다.** 예를 들면, 여러분은 `<x-tabs>` 을 페이지 상에 선언할 수 있지만 `document.registerElement('x-tabs')`  호출 이후 훨씬 나중에 종료할 수 있다.

elements가 그들의 정의로 업그레이드 되기 전에 그들은 **unresolved elements**으로 불립니다. 이것들은 유효한 custom element 이름을 갖지만 등록되지 않은 HTML elements입니다.

아래 테이블은 위의 내용을 바로 이해하는데 도움이 될 수 있습니다.:

<table>
  <thead><tr><th>이름</th><th>상속받은 parent</th><th>예</th></tr></thead>
  <tr><td>Unresolved element</td><td><code>HTMLElement</code></td><td><code>&lt;x-tabs></code>, <code>&lt;my-element></code>, <code>&lt;my-awesome-app></code></td></tr>
  <tr><td>Unknown element</td><td><code>HTMLUnknownElement</code></td><td><code>&lt;tabs></code>, <code>&lt;foo_bar></code>
</td></tr>
</table>

<blockquote class="commentary talkinghead">unresolved element들은 불확실한 상태라고 생각합니다. 그들은 브라우저에서 나중에 업그레이드 할 주요 후보들입니다. 브라우저는 "여러분은 브라우저가 새로운 element에서 찾고 있는 모든 올바른 본질을 가지고 있습니다. 브라우저는 브라우저에게 여러분의 elements 정의가 주어질 때 업그레이드 할 것을 약속합니다."라고 말합니다.</blockquote>

<h2 id="instantiating">elements의 인스턴스화</h2>

elements를 만드는 일반적인 기술들은 동일하게 custom elements에 적용되고 있다. 표준 element와 마찬가지로 custom element 도  HTML안에서 선언되거나 DOM 안에서 Javascript를 이용하여 만들어 질 수 있다.

<h3 id="usecustomtag">custom tags의 인스턴스화</h3>

custom tags **선언**:

    <x-foo></x-foo>

JS에서 **DOM 생성**:

    var xFoo = document.createElement('x-foo');
    xFoo.addEventListener('click', function(e) {
      alert('Thanks!');
    });

**`new` operator** 사용:

    var xFoo = new XFoo();
    document.body.appendChild(xFoo);

<h3 id="usetypeextension">타입 확장 elements 인스턴스화</h3>

타입 확장 스타일 custom elements 인스턴스화는 custom tags에 밀접합니다.

타입 확장 elements **선언**:

    <!-- <button> "is a" mega button -->
    <button is="mega-button">

JS에서 **DOM 생성**:

    var megaButton = document.createElement('button', 'mega-button');
    // megaButton instanceof MegaButton === true

위의 코드는 `is=""` 속성을 두번째 인자로 갖는 `document.createElement()`의 오버로드된 버전입니다.

**`new` operator** 사용:

    var megaButton = new MegaButton();
    document.body.appendChild(megaButton);

지금까지, 우리는 새로운 태그를 브라우저에게 알려주는 `document.registerElement()` 사용법을 배웠습니다. 그러나 그것은 많이 사용되지 않습니다. 프로퍼티 및 메서드를 추가해 보겠습니다.

<h2 id="publicapi">JS 프로퍼티 및 메서드 추가</h2>

custom element의 강력한 점은 element 정의 중의 프로퍼티 및 메서드로 맞춤형 기능을 제공할 수 있다는 것입니다. 여러분의 element를 위한 public API를 만들수 있는 하나의 방법으로 생각합니다.

아래는 전체 예제입니다.:

    var XFooProto = Object.create(HTMLElement.prototype);

    // 1. x-foo에 foo() 메서드 주기.
    XFooProto.foo = function() {
      alert('foo() called');
    };

    // 2. read-only 속성의 "bar" 프로퍼티 정의.
    Object.defineProperty(XFooProto, "bar", {value: 5});

    // 3. x-foo의 정의를 등록하기.
    var XFoo = document.registerElement('x-foo', {prototype: XFooProto});

    // 4. x-foo 인스턴스화.
    var xfoo = document.createElement('x-foo');

    // 5. xfoo 인스턴스를 페이지에 추가.
    document.body.appendChild(xfoo);

물론 `prototype`을 구성하는 방법으로 무수한 수천가지 방법이 있습니다. 이와 같이 prototype들을 생성하는 것을 좋아하지 않는면 아래에 같은 일을 더 압축적으로 수행하는 버전이 있습니다.:

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

첫번째로 형태는 ES5 <[`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)를 사용하였습니다. 두번째는 [get/set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/get)을 사용하였습니다.

<h3 id="lifecycle">Lifecycle callback methods</h3>

element는 element가 존재하는 시간 중 흥미로운 시간의 활용을 위한 특별한 방법을 정의할 수 있습니다. 이 방법들은 **lifecyle callbacks**로 적절하게 이름지어져 있습니다. 각각의 특별한 이름과 목적을 다음과 같이 갖습니다.:

<table class="table">
  <thead>
    <tr>
      <th>Callback 이름</th>
      <th>호출되는 시기</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>createdCallback</td>
      <td>element의 인스턴스가 생성되었을 때</td>
    </tr>
    <tr>
      <td>attachedCallback</td>
      <td>document에 인스턴스가 삽입되었을 때</td>
    </tr>
    <tr>
      <td>detachedCallback</td>
      <td>document에서 인스턴스가 삭제되었을 때</td>
    </tr>
    <tr>
      <td>attributeChangedCallback(attrName, oldVal, newVal)</td>
      <td>속성이 추가되거나, 삭제되거나, 갱신되었을 때</td>
    </tr>
  </tbody>
</table>

**예:** `<x-foo>`에 `createdCallback()` 과 `attachedCallback()` 정의하기:

    var proto = Object.create(HTMLElement.prototype);

    proto.createdCallback = function() {...};
    proto.attachedCallback = function() {...};

    var XFoo = document.registerElement('x-foo', {prototype: proto});

**모든 lifecycle callbacks는 optional입니다**만 그것이 의미를 갖거나 필요한 때에 정의 됩니다. 예를 들면, 여러분의 element가 충분히 복잡하거나 `createdCallback()`에서 IndexedDB에 연결을 여는 경우 입니다. DOM으로부터 제거되기 전에 `detachedCallback()`에서 필요한 정리작업을 합니다. **Note:** 여러분은 사용자가 탭을 닫을 경우, 예를 들어, 이에 의존하지만 이것을 가능한 최적화된 훅으로 생각해서는 안됩니다.

lifecycle callbacks의 또 다른 사용 예는 element에 기본 이벤트 리스너를 생성하는 경우입니다:

    proto.createdCallback = function() {
      this.addEventListener('click', function(e) {
        alert('Thanks!');
      });
    };

<blockquote class="commentary talkinghead">여러분의 elements가 어설프다면 사람들은 여러분의 elements를 사용하지 않을 것입니다. lifecycle callback은 여러분이 만든 elements가 어설프지 않게 도울 수 있습니다.</blockquote>

<h2 id="addingmarkup">markup 추가하기</h2>

우리는 `<x-foo>`를 만들어 Javascript API로 제공하지만 그것은 비어있습니다! 우리가 그것을 렌더링 하기 위한 몇가지 HTML을 주어 볼까요?

[Lifecycle callbacks](#lifecycle)은 여기에 유용합니다. 특히, 우리는 몇가지 기본 HTML로 된 element를 부여하여 `createdCallback()`을 사용할 수 있습니다.:

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
    };

    var XFoo = document.registerElement('x-foo-with-markup', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-with-markup></x-foo-with-markup>
</div>

인스턴스화 된 이 tag는 DevTools(우측 클릭 후 element inspect 선택)에서 검사를 통해 아래 같이 보여집니다.:

    ▾<x-foo-with-markup>
       <b>I'm an x-foo-with-markup!</b>
     </x-foo-with-markup>

<h3 id="shadowdom">Shadow DOM의 내부에 캡슐화</h3>

그 자체로, [Shadow DOM](/tutorials/webcomponents/shadowdom/)은 컨텐츠를 캡슐화 하기 위한 강력한 도구입니다. custom element와 함께 사용하여 마법같은 장점을 얻으세요!

Shadow DOM은 custom element를 제공합니다:

1. 그들의 내부를 숨길수 있는 방법으로 상세한 구현 세부사항으로부터 사용자를 보호합니다.
2. [Style encapsulation](/tutorials/webcomponents/shadowdom-201/)은 자유입니다.

Shadow DOM으로부터 element를 만드는 것은 기본 markup를 렌더링 하는 것을 만드는 것과 같습니다. 차이점은 `createdCallback()`에 있습니다:

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      // 1. element에 shadow root를 붙입니다.
      var shadow = this.createShadowRoot();

      // 2. 적절한 markup으로 그것을 채웁니다.
      shadow.innerHTML = "<b>I'm in the element's Shadow DOM!</b>";
    };

    var XFoo = document.registerElement('x-foo-shadowdom', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-shadowdom></x-foo-shadowdom>
</div>

element의 `.innerHTML`를 설정하는 것 대신에 저는 `<x-foo-shadowdom>`를 위한 Shadow Root를 만들고 markup으로 채웠습니다. DevTools에 있는 "Show Shadow DOM" 설정을 활성화 하면 여러분은 확장 가능한 `#shadow-root`를 볼 수 있습니다.:

    ▾<x-foo-shadowdom>
       ▾#shadow-root
         <b>I'm in the element's Shadow DOM!</b>
     </x-foo-shadowdom>

이것이 Shadow Root입니다!

<h3 id="fromtemplate">template으로부터 element 만들기</h3>

[HTML Templates](http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element)는 custom element의 세계에서도 잘 맞는 또다른 새로운 API 기본 요소 입니다.

익숙하지 않은 경우에 [`<template>` element](/tutorials/webcomponents/template/)는 페이지 로드시에 파싱되어 활성되지 않은 상태로 runtime에 인스턴스화 할 수 있는 DOM 조각들을 선언할 수 있도록 합니다. 그들은 custom element의 선언을 위한 이상적인 placeholder 입니다.

**예:** `<template>`과 Shadow DOM으로부터 생성된 element를 등록하기:

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

이들 몇 줄의 코드는 많은 부분을 갖고 있습니다. 위의 코드상에서 일어나는 모든 것을 이해 해 보겠습니다.:

1. 우리는 HTML상에 새 element를 등록 했습니다.:`<x-foo-from-template>`
- element의 DOM은 `<template>`으로부터 생성 되었습니다.
- element의 민감한 상세 부분은 Shadow DOM을 사용하여 숨겨졌습니다.
- Shadow DOM은 element 스타일 캡슐화를 제공합니다. (예. `p {color: orange;}`는 전체 페이지를 <span style="color: orange;">orange</span>색으로 바꾸지 않습니다.)

너무 좋습니다!

<h2 id="styling">custom elements의 styling</h2>

모든 HTML tag와 마찬가지로 여러분의 custom tag의 사용자는 selector로 스타일을 줄 수 있습니다:

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

<h3 id="styling">Shadow DOM을 이용한 엘리먼트 스타일링하기</h3>

Shadow DOM을 사용하면 토끼굴은 _훨씬 더_ 깊어집니다. [Shadow DOM을 사용하는 custom elements](#shadowdom)는 큰 이점들을 상속받았습니다.

Shadow DOM은 스타일 캡슐화된 엘리먼트를 주입했습니다. Shadow Root 안에 정의된 스타일은 호스트(Host)에 누설되지도 않고 페이지에 흘리지도 않습니다. **custom element의 경우 엘리먼트 자체가 호스트(Host)입니다.** style 캡슐화의 프로퍼티들은 custom elements가 그들 자신의 기본 스타일을 정의할 수 있도록 합니다.

Shadow DOM의 스타일링은 큰 주제입니다! 더 배우기를 원한다면, 다른 몇가지 제 글들을 추천합니다.:

- [Polymer](http://www.polymer-project.org) 문서 상의 "[element를 스타일링 하기 위한 가이드](http://www.polymer-project.org/articles/styling-elements.html)"
- html5rock.com 상의 "[Shadow DOM 201: CSS & Styling](/tutorials/webcomponents/shadowdom-201/)"

<h3 id="fouc">:unresolved를 사용하여 FOUC 막기</h3>

[FOUC](http://en.wikipedia.org/wiki/Flash_of_unstyled_content)를 줄이기 위해 custom element는 새로운 CSS pseudo class(`:unresolved`) 사양을 내놓았습니다. 브라우저가  `createdCallback()` ([lifecycle methods](#lifecycle) 참조)을 호출하는 시점까지 [unresolved elements](#unresolvedels)에 사용합니다. 한번 발생한 후의 element는 더이상 unresolved element가 아닙니다. 업그레이드 과정이 완료되고 element는 element의 정의 형태로 변형됩니다.

<p class="notice">CSS <code>:unresolved</code>는 Chrome 29에서 기본적으로 지원됩니다.</p>

**예**: "x-foo" 태그가 등록될때 fade in 하기:

    <style>
      x-foo {
        opacity: 1;
        transition: opacity 300ms;
      }
      x-foo:unresolved {
        opacity: 0;
      }
    </style>

`:unresolved`는 `HTMLUnknownElement`로부터 상속받은 element([elements가 업그레이드 되기 위한 방법](#upgrades) 참고)가 아닌 [unresolved elements](#unresolvedels)에만 적용된다는 것을 기억하세요.

    <style>
      /* 모든 unresolved element에 dashed border 적용하기 */
      :unresolved {
        border: 1px dashed red;
        display: inline-block;
      }
      /* unresolved x-panel에 빨간색 적용 */
      x-panel:unresolved {
        color: red;
      }
      /* x-panel 정의가 한번 등록된 후에는 녹색 적용 */
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
  <panel>I'm black because :unresolved doesn't apply to "panel". It's not a valid custom element name</panel>
  <x-panel>I'm red because I match x-panel:unresolved.</x-panel>
  <p><button id="register-x-panel">Register &lt;x-panel></button></p>
</div>

`:unresolved`의 더 많은 정보는 Polymer의 [elements 스타일링 가이드](http://www.polymer-project.org/articles/styling-elements.html#preventing-fouc) 참조.


<h2 id="historysupport">이력과 브라우저 지원</h2>

<h3 id="featuredetect">기능 탐지</h3>

기능 탐지는 `document.registerElement()`의 존재 유무를 확인한다.:

    function supportsCustomElements() {
      return 'registerElement' in document;
    }

    if (supportsCustomElements()) {
      // 사용가능합니다!
    } else {
      // 컴포넌트를 만들기 위해 다른 라이브러리를 사용하세요.
    }

<h3 id="support">브라우저 지원</h3>

`document.registerElement()`는 Chrome 27, Firefox ~23에서 처음 지원되었습니다. 그러나 스펙에 포함된 것은 최근 입니다. Chrome 31은 갱신된 스펙을 지원하는 최초 버전입니다.

<p class="notice fact">custom element는 Chrome 31 에서 "실험 웹 플랫폼 기능"으로 <code>about:flags</code>에 활성화 할 수 있었습니다.</p>

브라우저의 지원이 활성화될 때까지 Google's [Polymer](http://polymer-project.org)와 Mozilla's [X-Tag](http://www.x-tags.org/) 모두에서 사용할 수 있는 [polyfill](http://www.polymer-project.org/platform/custom-elements.html)이 존재합니다.

<h3 id="elementel">HTMLElementElement에 무슨 일이 발생하나요?</h3>

표준화 작업에 따르면 여러분이 `<element>`로 알고 있던 것들입니다. 여러분은 새로운 element를 등록하여 그것을 사용할 수 있습니다:

    <element name="my-element">
      ...
    </element>

불행하게도 [upgrade process](#upgrades)의 너무 많은 타이밍 이슈, corner cases 그리고 그것을 모두 해결하는 아마겟돈과 같은 시나리오들이 있었습니다. `<element>` 는 보류 되었습니다. 2013년 8월에 Dimitri Glazkov는 그것의 제거 발표를 [public-webapps](http://lists.w3.org/Archives/Public/public-webapps/2013JulSep/0287.html)에 포스팅 하였습니다. (적어도 지금까지는)

`<polymer-element>`로 element 등록의 선언적 형태를 구현하는 것은 주목할 만한 가치가 있습니다. 어떻게 사용되나요? 그것은 `document.registerElement('polymer-element')`와 제가 [template으로부터 elements 만들기](#fromtemplate)에 설명한 기술들로 사용합니다.

<h2 id="conclusion">결론</h2>

custom element는 HTML의 문법을 확장하고, 새로운 트릭을 가르쳐주며 웹 플랫폼의 웜홀을 통해 이동하는 도구를 우리에게 제공합니다. Shadow DOM 과 `<template>`과 같은 새로운 플랫폼 기본요소와 custom element를 결합하여 우리는 웹 컴포넌트들의 그림을 실현하기 시작합니다. markup은 다시 좋아 질수 있습니다.

여러분이 웹 컴포넌트들과 시작하는 것에 흥미를 느낀다면 저는 [Polymer](http://polymer-project.org) 확인을 추천합니다. 그것은 여러분이 시도하기에 충분한 것 이상을 얻을 수 있습니다.

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

if (('createShadowRoot' in document.body || 'webkitCreateShadowRoot' in document.body) &&
      'registerElement' in document) {

(function() {
    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      var shadow = this.createShadowRoot ? this.createShadowRoot() :
                                           this.webkitCreateShadowRoot();
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
