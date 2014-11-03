この記事では Shadow DOM で可能になる、さらに素晴らしいことについて述べていきます。[Shadow DOM 101](/tutorials/webcomponents/shadowdom/) および [Shadow DOM 201](/tutorials/webcomponents/shadowdom-201/) で述べた知識が前提となりますので、もしまだ読まれていない方はぜひそちらをご覧下さい。

<p class="tip notice">Chrome であれば、<code>about:flags</code> ページにある "Enable experimental Web Platform features" フラグを有効にすることで、この記事に書かれているすべての機能を試すことができます。</p>

<h2 id="toc-shadow-multiple">複数の Shadow Root を使う</h2>

もしあなたがパーティを主催するとして、参加者を全員同じ部屋に押し込めてしまったら、とても窮屈ですよね？ グループに分けて、複数の部屋に分散できたら、と思うことでしょう。Shadow DOM をホストする要素についても同様、要素はひとつ以上の Shadow Root をホストすることができます。

複数の Shadow Root をホストに追加するとどうなるのか見てみましょう：

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

<p class="notice tip">ShadowRoot をインスペクト可能にするため、DevTools で "Show Shadow DOM" をオンにしてください。</p>

すでに Shadow Tree が追加されているにも関わらず、"Root 2 FTW" と表示されましたか？ これは最後にホストに追加された Shadow Tree が優先されるためです。少なくともレンダリングに関しては、LIFO (Last In First Out) スタックです。DevTools で調べてみればこの挙動が確認できるはずです。

<p class="notice fact">ホストに追加された Shadow Tree は、追加された順に、最近追加されたものが最初になるように積み上げられ、最後に追加されたものが表示されます。</p>

<blockquote class="commentary talkinghead" id="youngest-tree">
最も新しく追加された Tree は <b>Younger Tree</b> と呼ばれます。それより以前の Tree は <b>Older Tree</b>  と呼ばれます。この例では <code>root2</code> が Younger Tree で、 <code>root1</code> が Older Tree ということになります。
</blockquote>

それでは、複数の Shadow を使うことにどんな意義があるのでしょうか？ Shadow 挿入ポイントを入れてみましょう。

<h3 id="toc-shadow-insertion">Shadow 挿入ポイント</h3>

"Shadow 挿入ポイント" (`<shadow>`) は、通常の [挿入ポイント](/tutorials/webcomponents/shadowdom/#toc-separation-separate) (`<content>`) とプレースホルダーという意味では同一ですが、 *コンテンツ* の代わりに *Shadow Tree* をホストします。まさに Shadow DOM インセプションというわけです！

ご想像の通り、うさぎの穴は掘れば掘るほど複雑になります。そのため、複数の `<shadow>` 要素を入れた場合の仕様は明確です：

<p class="notice fact">Shadow Tree に複数の <code>&lt;shadow></code> 挿入ポイントを設けた場合、最初のものだけが認識され、他のものは無視される。</p>

先ほどの例に戻ると、最初の Shadow である `root1` のみがリストに残ります。`<shadow>` 挿入ポイントの追加は、それを取り戻します：

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

この例で、いくつか面白いことが分かります：

1. "Root 2 FTW" は "Root 1 FTW" の上に表示されます。これは <code>&lt;shadow></code> 挿入ポイントを配置した場所だからです。逆にしたければ、挿入ポイントを <code>root2.innerHTML = '&lt;shadow>&lt;/shadow>&lt;div>Root 2 FTW&lt;/div>';</code> 挿入ポイントに移動すればよいのです。
- 今度は `root1` の位置に `<content>` があることに注意して下さい。これがテキストノード "Light DOM" が表示される理由です。

<b id="toc-shadow-older">&lt;shadow&gt; に何が表示されるのか？</b>

`<shadow>` の位置に Older Tree が表示されることを知っていると便利な場合があります。`.olderShadowRoot` を使ってその Tree を参照することができます：

<pre class="prettyprint">
<b>root2.olderShadowRoot</b> === root1 //true
</pre>

<h2 id="toc-get-shadowroot">ホストの Shadow Root を取得する</h2>

要素が Shadow DOM をホストしている場合、`.shadowRoot` を使って [最も若い Shadow Root (Younguest Shadow Root)](#youngest-tree) にアクセスできます：

<pre class="prettyprint">
var root = host.createShadowRoot();
console.log(host.shadowRoot === root); // true
console.log(document.body.shadowRoot); // null
</pre>

あなたの Shadow に第三者を入り込ませたくない場合は、`.shadowRoot` を `null` にします：

<pre class="prettyprint">
Object.defineProperty(host, 'shadowRoot', {
  get: function() { return null; },
  set: function(value) { }
});</pre>

ちょっとしたハックですが、動きます。ただし、どんなに素晴らしくても、 **Shadow DOM がセキュリティを重視したものではない** ことは覚えておく必要があります。コンテンツ孤立化のソリューションという点で、完璧なものとして依存することは避けて下さい。

<h2 id="toc-creating-js">JavaScript で Shadow DOM を構築する</h2>

JavaScript で DOM を構築したければ、`HTMLContentElement` と `HTMLShadowElement` が必要なインターフェースを提供しています。

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

この例は、[前の項](#toc-shadow-insertion) で示したものとほぼ同じですが、`select` を使って、新しく追加された `<span>` を引っ張っている点が異なります。

<h2 id="toc-distributed-nodes">挿入ポイント</h2>

ホスト要素の中から選択され、Shadow Tree に "分散された" ノードは、分散ノードと呼ばれます。これらは、挿入ポイントが受け付ければ、Shadow Boundary を越えることが許されます。

挿入ポイントについて、コンセプト的につまづきやすいのは、物理的に DOM を動かさないという点です。ホストのノードは、実際には動きません。挿入ポイントは単なるホストから Shadow Tree にプロジェクションするためだけのものです。<s>"ノードをここに移動しろ"</s> "この位置にノードを表示しろ" という意思表示に他ならないのです。

<p class="notice fact">DOM を走査して <code>&lt;content></code> 内に入り込むことはできません。</p>

例えば：

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

この例で分かるように、`h2` は Shadow DOM の子要素でありません。このことから、次のことも分かります：

<blockquote class="commentary talkinghead">
挿入ポイントは信じられないほどパワフルです。Shadow DOM における "宣言的 API" を作る手段と考えて下さい。ホスト要素は、この世に存在するすべてのマークアップを取り込むことができますが、挿入ポイントを使って Shadow DOM を持ち込まない限り、意味はありません。
</blockquote>

<h3 id="toc-getDistributedNodes">Element.getDistributedNodes()</h3>

`<content>` 内まで走査することはできないと述べましたが、`.getDistributedNodes()` API を使って、挿入ポイントにある分散ノードをクエリーすることができます：

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

`.getDistributedNodes()` 同様、`.getDestinationInsertionPoints()` を呼び出すことで、ノードが分散されている挿入ポイントを確認することができます：

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

<h2 id="toc-shadow-visualizder">ツール：Shadow DOM Visualizer</h2>

Shadow DOM の黒魔術を理解するのは至難の業です。私自身、初めて見た時は混乱しました。

Shadow DOM のレンダリングがどのように行われているのかをビジュアライズするのに、[d3.js](http://d3js.org/) を使ってツールを作りました。左側にあるマークアップの枠は、どちらも編集可能です。ご自身のマークアップをペーストして、Shadow Tree がどのようにホストノードを挿入ポイントに埋めていくのか、ぜひ試してみてください。

<figure>
<a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html"><img src="visualizer.png" title="Shadow DOM Visualizer" alt="Shadow DOM Visualizer"></a>
<figcaption><a href="http://html5-demos.appspot.com/static/shadowdom-visualizer/index.html">Shadow DOM Visualizer を起動</a></figcaption>
</figure>

<p>
<iframe width="420" height="315" src="http://www.youtube.com/embed/qnJ_s58ubxg" frameborder="0" allowfullscreen></iframe>
</p>

ぜひ試して、感想を聞かせて下さい！

<h2 id="toc-events">イベントモデル</h2>

Shadow DOM では、イベントによっては Shadow Boundary を越えますが、越えないものもあります。イベントが Boundary を越える場合、Shadow Root の Upper Boundary のカプセル化を維持するため、イベントターゲットは調整されます。別の言い方をするなら、 **イベントは、Shadow DOM の内部の要素ではなく、ホスト要素から発生しているように見せるため、リターゲティングされます** 。

<p class="tip notice"><code>event.path</code> を確認すれば、調整されたイベントパスが見れます</p>

あなたのブラウザが Shadow DOM をサポートしていれば、下にイベントのビジュアライゼーションが確認できるデモが表示されるはずです。<span style="color:#ffcc00">黄色い</span> 要素は Shadow DOM のマークアップの一部です。<span style="color:steelblue">青い</span> 要素は ホスト要素の一部です。"ホスト内の要素" を囲む <span style="color:#ffcc00">黄色い</span> 枠線は、Shadow の `<content>` 挿入ポイントを通した分散ノードであることを示しています。

複数用意されている "Play Action" ボタンを押すことで、`mouseout` と `focusin` イベントがどのようにメインページにバブルアップされるかを見ることができます。

<div id="example5" class="demoarea">
  <div data-host>
    <div class="blue">ホスト内の要素</div>
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
      <div>Shadow DOM 内の要素</div>
      <div>Shadow DOM 内の要素</div>
      <content></content>
      <input type="text" placeholder="Shadow DOM の中">
      <div>Shadow DOM 内の要素</div>
      <div>Shadow DOM 内の要素</div>
    </section>
  </template>

  <aside class="cursor"></aside>

  <div class="buttons">
    <button data-action="playAnimation" data-action-idx="1">Play Action 1</button><br>
    <button data-action="playAnimation" data-action-idx="2">Play Action 2</button><br>
    <button data-action="playAnimation" data-action-idx="3">Play Action 3</button><br>
    <button data-action="clearLog">ログを消す</button>
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

- ホスト要素 (`<div data-host>`) から <span style="color:steelblue">青い</span> ノードに `mouseout` していくのが見て取れるはずです。分散ノードであるにも関わらず、Shadow DOM 内ではなく、ホスト内にあります。マウスをさらに下に動かし、<span style="color:#ffcc00">黄色い</span> ノードに移動することで、再度 <span style="color:steelblue">青い</span> ノードから `mouseout` します。

**Play Action 2**

- ホストで、最後に一度だけ `mouseout` イベントが発生します。通常 `mouseout` はすべての <span style="color:#ffcc00">黄色い</span> ノードで発生すると思われるかもしれませんが、Shadow DOM の内部要素であるため、イベントは Upper Boundary を越えてバブリングしません。

**Play Action 3**

- `input` をクリックすると、`focusin` イベントが、`input` 要素ではなく、ホストノード上に現れることに注目して下さい。これがリターゲティングです。

<h3 id="toc-events-stopped">常に停止されるイベント</h3>

下記は Shadow Boundary を越えないイベントです：

- abort
- error
- select
- change
- load
- reset
- resize
- scroll
- selectstart

<h2 id="toc-conclusion">まとめ</h2>

**Shadow DOM が信じられないほどパワフル** の意味が分かったでしょうか？ 我々はここに来て初めて、`<iframe>` やその他の古いテクニックを使わずに、まっとうなカプセル化の技術を手に入れたのです。

Shadow DOM は確かに複雑怪奇ではありますが、ウェブプラットフォームに加えるだけの価値があるものです。ゆっくり時間をかけて身につけて下さい。

さらに詳しく知りたい場合は、Dominic の [Shadow DOM 101](/tutorials/webcomponents/shadowdom/) や、私の [Shadow DOM 201: CSS &amp; Styling](/tutorials/webcomponents/shadowdom-201/) が参考になります。

<p class="small-notice">
このチュートリアルの内容をレビューしてくれた <a href="/profiles/#dominiccooney">Dominic Cooney</a> と <a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> に感謝します。
</p>


