{% include "warning.html" %}

이 글은 여러분이 Shadow DOM을 이용하여 할 수 있는 놀라운 일들, 그 이상을 다룹니다! 이 글은 [Shadow DOM 101](/ko/tutorials/webcomponents/shadowdom/)과 [Shadow DOM 201](/ko/tutorials/webcomponents/shadowdom-201/)에서 다뤘던 개념들을 기초로 하고 있습니다.

<p class="tip notice">크롬의 경우, 이 글에서 다루는 모든 기능의 실험을 위해 about:flags의 "Enable experimental Web Platform features"을 켜야 합니다.
(<b>역주:</b> 한글 버전의 경우 "실험용 웹 플랫폼 기능 사용"으로 표시되어 있을 것입니다.)</p>

<h2 id="toc-shadow-multiple">여러개의 Shadow root 사용하기</h2>

만약 여러분이 파티를 주최(Hosting, 호스팅)하고 있다면, 모든 사람들을 같은 공간에 쟁여 넣는 것은 답답할 것입니다.
사람들의 그룹을 여러개의 방들로 분산시키는 방법을 원할 것입니다. Shadow DOM을 호스팅하는 엘리먼트도 이와 똑같은 일을 할 수 있으며, 이는 다시 말해서 한번에 하나 이상의 Shadow Root를 호스팅할 수 있다는 뜻입니다.

다음과 같이 만약 하나의 호스트에 여러개의 Shadow Root를 붙이려고 할 때 어떠한 일이 일어나는지 살펴보도록 하겠습니다.

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
<img src="stacking.png" title="여러개의 섀도 트리 붙이기" alt="여러개의 섀도 트리 붙이기" style="width:250px;">
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

<p class="notice tip">개발자 도구에서 ShadowRoots를 감시할 수 있도록 하기 위해 "Show Shadow DOM"를 켜시기 바랍니다. (<b>역주:</b> "Show Shadow DOM"은 개발자도구 > Settings > General > Element 밑에서 찾을 수 있습니다.)</p>

이미 섀도 트리가 추가했다는 사실에도 불구하고 무엇을 렌더링할 것인지는 "Root 2 FTW"입니다.
이는 호스트에 추가된 마지막 섀도 트리가 우선이기 때문입니다. 이는 렌더링까지 관련되어 있는 LIFO(Last In First Out) 스택입니다.
DevTools을 시험해보면 이 동작을 확인할 수 있습니다.

<p class="notice fact">호스트에 추가된 섀도 트리들은 그들이 추가된 순서대로 스택에 쌓이며 가장 최근에 추가된 것부터 시작합니다. 마지막에 추가된 것이 렌더링될 것입니다.</p>

<blockquote class="commentary talkinghead" id="youngest-tree">
가장 최근에 추가된 트리는 <b>젊은 트리(Younger tree)</b>라고 부르며 더 최근에 추가된 것은 <b>늙은 트리(Older tree)</b>라고 불립니다. 이 예제에서 <code>root2</code>는 젊은 트리이고 <code>root1</code>는 늙은 트리입니다.
</blockquote>

그러므로 단지 마지막만이 렌더링 묶음으로 추가된다면 여러개의 섀도를 사용하는 것의 요점이 무엇일까요? 섀도 삽입지점(Insertion point)들로 들어가보겠습니다.

<h3 id="toc-shadow-insertion">섀도 삽입지점들(Shadow Insertion Points)</h3>

"섀도 삽입지점들(Shadow Insertion Points)" (`<shadow>`)은 Placeholder들이라는 점에서 일반적인 [insertion points](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`)과 유사합니다. 그러나 이들은 호스트의 *컨텐츠*를 위한 Placeholder가 되지 않고, 다른 *섀도 트리들*을 위한 호스트들입니다. 이것이 Shadow DOM의 시작입니다!

아마 여러분이 상상할 수 있는 것처럼 상황은 더 복잡해지고 토끼굴을 뚫고 들어갑니다. 이러한 이유로 규격은 여러개의 `<shadhow>` 엘리먼트들이 동작 중일 때 무엇이 일어나는지에 대해 다음과 같이 매우 명확하게 정의하고 있습니다.

<p class="notice fact">만약 여러개의 <code>&lt;shadow></code> 삽입지점들이 섀도 트리 내에 존재한다면 첫번째만이 인식되며 나머지는 무시됩니다.</p>

원래의 예제를 다시 살펴보면 첫번째 섀도 `root1`은 초대 리스트에서 버려집니다. `<shadow>` 삽입지점의 추가는 다음과 같이 되돌려집니다.

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

이 예제에 대해 다음과 같이 흥미로운 점 몇가지가 있습니다.

1. "Root 2 FTW"는 여전히 "Root 1 FTW" 위에 렌더링됩니다. 이는 <code>&lt;shadow></code>의 삽입지점이 위치하도록 하였기 때문입니다. 만약 이를 뒤집고 싶다면 다음과 같이 삽입지점을 다음과 같이 이동하면 됩니다. <code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code>
- 이제 `<content>` 삽입지점이 root1에 있다는 것을 주의하시기 바랍니다. 이는 "Light DOM" 텍스트 노드가 렌더링과 어울리도록 합니다.

<b id="toc-shadow-older">&lt;shadow&gt;에서 무엇이 렌더링되는가?</b>

가끔 오래된 섀도 트리가 `<shadow>`에서 렌더링되는 것을 알아채는 것은 유용합니다. 여러분은 다음과 같이 `.olderShadowRoot`를 통해 그 트리의 참조를 얻을 수 있습니다.

<pre class="prettyprint">
<b>root2.olderShadowRoot</b> === root1 //true
</pre>

<h2 id="toc-get-shadowroot">호스트의 섀도 트리 얻기</h2>

만약 엘리먼트가 Shadow DOM을 호스팅하고 있다면 다음과 같이 `.shadowRoot`를 사용하여 그에 대한 [가장 어린 섀도 트리(youngest shadow root)](#youngest-tree)를 액세스할 수 있습니다.

<pre class="prettyprint">
var root = host.createShadowRoot();
console.log(host.shadowRoot === root); // true
console.log(document.body.shadowRoot); // null
</pre>

만약 섀도들로 사람들이 가로지르는 것이 우려된다면 다음과 같이 `.shadowRoot`를 null로 재정의합니다.

<pre class="prettyprint">
Object.defineProperty(host, 'shadowRoot', {
  get: function() { return null; },
  set: function(value) { }
});</pre>

이는 약간의 핵(hack)이지만 동작합니다. 따지고 보면 이는 엄청나게 환상적이지만 **Shadow DOM은 보안 기능이 되도록 디자인되지 않았음**을 기억하는 것이 중요합니다. 완전한 컨텐츠의 분리를 위해 이에 의지하지 마시기 바랍니다.

<h2 id="toc-creating-js">자바스크립트에서의 Shadow DOM 구축</h2>

만약 자바스크립트에서 DOM을 구축하는 것을 선호한다면, `HTMLContentElement`과 `HTMLShadowElement`는 그를 위한 인터페이스를 가지고 있습니다.

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

이 예제는 [이전 섹션](#toc-shadow-insertion)의 것과 거의 똑같습니다.
유일한 차이점은 새로 추가된 `<span>`을 뽑아내기 위해 이제 `select`를 사용한다는 것입니다.

<h2 id="toc-distributed-nodes">삽입지점을 통한 동작</h2>

호스트 엘리먼트로 골라내어지고 섀도 트리들로 "배포되어진" 노드들은...[드럼소리]...배포 노드들(Distributed nodes)이라고 불립니다! 이들은 삽입지점들이 그들 속으로 불러들여질 때 섀도의 경계를 가로지르는 것을 가능하게 합니다.

삽입지점이 개념적으로 무엇이 특이한가하면 물리적으로 DOM을 이동하지 않는다는 것입니다. 호스트의 노드들은 온전하게 유지됩니다. 삽입지점들은 단지 호스트로부터 섀도 트리들로 노드들을 다시 투영할 뿐입니다. 이는 다음과 같이 표현하고 렌더링하는 것과도 같습니다. <s>"이 노드들을 여기로 옮겨"</s> "이 노드들을 이 위치에 렌더링해".

<p class="notice tip"><b>역주:</b> 삽입지점(Insertion Point)는 DOM이 실제로 이동하는 것이 아니라 삽입지점이 가르키고 있는 위치에 대해 마치 DOM이 존재하는 것처럼 렌더링하고 동작하는 것을 뜻합니다. 이러한 이유로 여러분의 DOM 트리는 여전히 원래 상태대로 유지되고 있지만 실제 렌더링 결과는 DOM이 그리로 이동하거나 복사된 것처럼 동작하는 것입니다.</p>

<p class="notice fact">여러분은 <code>&lt;content></code> 내로 DOM을 탐색할 수 없습니다.</p>

다음과 같이 예를 들어보겠습니다.

<pre class="prettyprint">
&lt;div>&lt;h2>Light DOM&lt;/h2>&lt;/div>
&lt;script>
var root = document.querySelector('div').createShadowRoot();
root.innerHTML = '&lt;content select="h2">&lt;/content>';

var h2 = document.querySelector('h2');
console.log(root.querySelector('content[select="h2"] h2')); // null;
</pre>

어떻습니까! `h2`는 Shadow DOM의 자식 노드가 아닙니다. 이는 다음과 같이 또 다른 작은 것을 이끌어냅니다.

<blockquote class="commentary talkinghead">
삽입지점들은 믿을 수 없을 정도로 강력합니다. 이들을 여러분의 Shadow DOM을 위한 "선언적인 API"를 생성하는 방법으로 생각해보십시요. 호스트 엘리먼트는 세상의 모든 마크업을 포함할 수 있지만 제가 삽입지점을 통해 제 Shadow DOM으로 이를 불러들이지 않는다면 무의미합니다.
</blockquote>

<h3 id="toc-getDistributedNodes">Element.getDistributedNodes()</h3>

우리는 `<content>`내로 탐색을 할 수 없지만 `.getDistributedNodes()` API는 다음과 같이 삽입지점의 배포 노드에 대한 쿼리를 할 수 있도록 합니다.

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

`.getDistributedNodes()`와 유사하게 다음과 같이 노드에 대한 `.getDestinationInsertionPoints()`의 호출에 의해 배포될 삽입지점이 무엇인지 확인할 수 있습니다.

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

<h2 id="toc-shadow-visualizder">도구: Shadow DOM Visualizer</h2>

흑마술, 그러니까 Shadow DOM에 대한 이해는 어렵습니다. 전 처음에 머리를 맴도는 Shadow DOM을 이해하기 위해 노력했던 것이 기억합니다.

어떻게 Shadow DOM의 렌더링이 동작하는지를 시각적으로 도와줄 수 있도록 전 [d3.js](http://d3js.org/)를 이용한 도구를 구축했습니다. 좌측의 마크업 상자들은 모두 편집이 가능합니다. 여러분 자신의 마크업을 붙여 넣고 이것들이 어떻게 동작하는지와 삽입지점들이 호스트 노드들을 섀도 트리 내로 어떻게 휘젓는지를 보기 위해 편하게 실행해보시기 바랍니다.

<figure>
<a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html"><img src="visualizer.png" title="Shadow DOM Visualizer" alt="Shadow DOM Visualizer"></a>
<figcaption><a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html">Launch Shadow DOM Visualizer</a></figcaption>
</figure>

<p>
<iframe width="420" height="315" src="http://www.youtube.com/embed/qnJ_s58ubxg" frameborder="0" allowfullscreen></iframe>
</p>

한번 해보고 어떻게 생각하는지 알려주세요!

<h2 id="toc-events">이벤트 모델</h2>

몇몇 이벤트는 섀도 경계를 가로지르고 다른 몇몇 이벤트는 그렇지 않습니다. 이벤트가 경계를 가로지르는 경우에는 이벤트 대상은 Shadow Root의 상위 경계가 제공하는 캡슐화(Encapsulation)을 유지하기 위해 조정됩니다. 즉, **이벤트들은 호스트 엘리먼트로부터 온 것처럼 보이지만  Shadow DOM으로 이동한 내부 엘리먼트들로 대상을 재설정합니다.**

<p class="tip notice">이벤트 경로의 조정을 보기 위해서는 <code>event.path</code>를 액세스합니다.</p>

만약 브라우저가 Shadow DOM을 지원한다면 (지원하<span class="featuresupported no">지않</span>고 있습니다.), 이벤트의 시각화를 도와주는 아래의 실행 영역을 볼 수 있을 것입니다. <span style="color:#ffcc00">노란색</span> 안의 엘리먼트들은 Shadow DOM 마크업의 일부입니다. <span style="color:#steelblue">파란색</span> 안의 엘리먼트들은 호스트 엘리먼트들의 일부입니다. "I'm a node in the host" 주변의 <span style="color:#ffcc00">노란색</span> 테두리는 그들이 배포 노드이며 섀도의 `<content>` 삽입지점을 통해 전달되었음을 나타냅니다.

"동작 실행" 버튼들은 여러분이 각기 다른 것에 대한 시도를 나타냅니다. `mouseout`와 `focusin` 이벤트가 메인 페이지로 어떻게 버블링되는지를 보려면 실행해보시기 바랍니다.

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
    <button data-action="playAnimation" data-action-idx="1">동작 실행 1</button><br>
    <button data-action="playAnimation" data-action-idx="2">동작 실행 2</button><br>
    <button data-action="playAnimation" data-action-idx="3">동작 실행 3</button><br>
    <button data-action="clearLog">로그 초기화</button>
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

**동작 실행 1**

- 이는 흥미롭습니다. 호스트 엘리먼트 (`<div data-host>`) 노드로부터 <span style="color:steelblue">파란색</span> 노드로 `mouseout`이 일어나는 것을 볼 수 있을 것입니다. 설사 그것이 배포 노드라고 하더라도 여전히 ShadowDOM이 아닌 호스트에 존재합니다. 마우스를 더 아래로 이동하여 <span style="color:#ffcc00">노란색</span>으로 움직이면 <span style="color:steelblue">파란색</span> 노드 상에서 `mouseout`이 다시 발생합니다.

**동작 실행 2**

- (아주 마지막에) 호스트 상에서 하나의 `mouseout`이 보여집니다. 일반적으로 모든 <span style="color:#ffcc00">노란색</span> 블록들에 대해 `mouseout` 이벤트가 발생하는 것을 볼 수 있었습니다. 그러나 이와 같은 경우 이 엘리먼트들은 Shadow DOM 내부에 있으며 이벤트는 상위 경계를 통해서 버블링되지 않습니다.

**동작 실행 3**

- Input을 클릭했을 때 `focusin`이 input에서 발생하지 않지만 호스트 노드 자체에서는 발생합니다. 이는 대상이 재설정되었기 때문입니다!

<h3 id="toc-events-stopped">언제나 중지되는 이벤트</h3>

다음 이벤트들은 섀도 경계를 절대로 넘나들지 않습니다.

- abort
- error
- select
- change
- load
- reset
- resize
- scroll
- selectstart

<h2 id="toc-conclusion">결론</h2>

저는 여러분들이 **Shadow DOM이 믿을 수 없을 정도로 강력하다**는데 동의할 것이라 기대합니다. 사상 최초로 우리는 `<iframe>`이나 다른 기존 방법 같은 추가적인 짐덩어리 없이도 적절한 캡슐화(Encapsulation)을 얻을 수 있었습니다.

Shadow DOM은 확실히 복잡한 괴물이지만 이는 웹 플랫폼에 추가할 가치가 있는 괴물입니다. 이에 약간의 시간을 할애해보시고 배워보시고 질문하시기 바랍니다.

만약 더 학습을 하고 싶으시다면 Dominic의 소개 글인 [Shadow DOM 101](/ko/tutorials/webcomponents/shadowdom/)와 제가 작성한 [Shadow DOM 201: CSS &amp; Styling](/ko/tutorials/webcomponents/shadowdom-201/)를 보시기 발바니다.

<p class="small-notice">
이 튜토리얼의 내용을 리뷰해준 <a href="/profiles/#dominiccooney">Dominic Cooney</a>과 
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a>에게 고마움을 표합니다.
</p>


