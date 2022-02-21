この記事では Shadow DOM で可能になる、さらに素晴らしいことについて述べていきます。[Shadow DOM 101](/tutorials/webcomponents/shadowdom/) で述べた知識が前提となりますので、もしまだ読まれていない方はぜひそちらをご覧下さい。

<h2 id="toc-intro">はじめに</h2>

スタイルが当てられていないマークアップほど美しくないものはありません。しかし、[Web Components に関わってきた先人たち](http://w3c.github.io/webcomponents/explainer/#acknowledgements) のおかげで、Shadow Tree にスタイルを当てるたくさんの方法が [CSS Scoping Module](http://dev.w3.org/csswg/css-scoping/) として定義されています。

<p class="tip notice">Chrome であれば、<code>about:flags</code> ページにある "Enable experimental Web Platform features" フラグを有効にすることで、この記事に書かれているすべての機能を試すことができます。</p>

<h2 id="toc-style-scoped">スタイルのカプセル化</h2>

Shadow DOM の主要機能のひとつに [Shadow Boundary](http://w3c.github.io/webcomponents/spec/shadow/#shadow-trees) があります。ポイントはたくさんありますが、そのうちのひとつとしてスタイルのカプセル化が挙げられます。別の言い方をすると：

<p class="notice fact">Shadow DOM で定義された CSS スタイルは ShadowRoot 内にスコープされている。これはスタイルがデフォルトでカプセル化されていることを意味する。</p>

下記に例を示します。もしあなたのブラウザが Shadow DOM をサポートしていれば、"<span style="color:red">Shadow DOM</span>" が見えるはずです。

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

このデモの結果から 2 つの事が分かります：

- <a href="javascript:alert('このページには他に ' + document.querySelectorAll('h3').length + '個の &#60;h3&#62; タグがあります。')">このページには他にも `h3` タグ</a> が存在していますが、マッチして赤く表示されている `h3` セレクターは ShadowRoot にぶら下がっているものだけです。これはデフォルトでスタイルがスコープされていることを表しています。
- このページで `h3` に定義されている他のスタイルルールが、デモのコンテンツ内部に入り込んでいません。これは **セレクターが Shadow Boundary を超えられない** ためです。

このことから分かるのは、Shadow DOM がスタイルを外部からカプセル化している、ということです。

<h2 id="toc-style-host">ホスト要素にスタイルを与える</h2>

`:host` を使うことで、Shadow Tree をホストしている要素を選択し、スタイルを与えることができます：

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

ここで分かるのは、親ページ内のルールの特性は、要素で定義されている `:host` ルールよりも強く、ホスト要素で定義されている `style` 属性よりも弱いということです。これにより、ユーザーは外部からスタイルを与えることが可能となります。なお、`:host` は ShadowRoot のコンテキストでしか使うことはできません。これは Shadow DOM 外では利用不可であることを意味します。

`:host(<selector>)` とすれば、`<selector>` に一致するホスト要素をターゲットにすることができます。

**例** - `.different` クラスを持つ要素にのみ一致させる (例：`<x-foo class="different"></x-foo>`):

    :host(.different) {
      ...  
    }

<h3 id="toc-style-states">ユーザーの状態に反応するには</h3>

`:host` のユースケースとして、[Custom Element](/tutorials/webcomponents/customelements/) を作って、ユーザーの状態 (`:hover`, `:focus`, `:active`, 等) に反応したい、という場合が挙げられます。

    <style>
    :host {
      opacity: 0.4;
      transition: opacity 420ms ease-in-out;
    }
    :host(:hover) {
      opacity: 1;
    }
    :host(:active) {
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
      :host(:active) { position:relative;top:3px;left:3px; }\
      :host(:hover) {\
        opacity: 1;\
      }\
    }</style><content></content>';
})();
</script>


<h3 id="toc-style-themeing">要素にテーマを当てる</h3>

`:host-context(<selector>)` 擬似クラスは、そのホスト要素、もしくはその子孫が `<selector>` マッチすれば一致します。

`:host-context()` のユースケースとして、周辺要素に応じて要素にテーマを適用したい場合が挙げられます。`<html>` や `<body>` にクラスを適用することで、テーマを割り当てる人は多いことと思います：

    <body class="different">
      <x-foo></x-foo>
    </body>

`:host-context(.different)` とすることで、`.different` クラスの子要素である `<x-foo>` にスタイルを当てることができます：

    :host-context(.different) {
      color: red;
    }

これにより、Shadow DOM に、コンテキストに応じてスタイルルールをカプセル化して当てることが可能になります。

<h3 id="toc-style-multi">Support multiple host types from within one shadow root</h3>

`:host` の他の使い方としては、あなたがテーマライブラリを作りたいとして、同じ Shadow DOM 内から様々なホスト要素をスタイリングしたいケースが挙げられます。

    :host(x-foo) { 
      /* ホストが <x-foo> 要素の場合に適用 */
    }

    :host(x-foo:host) { 
      /* 同上。ホストが <x-foo> 要素の場合に適用 */
    }

    :host(div) {  {
      /* ホスト要素が <div> の場合に適用 */
    }

<h2 id="toc-style-cat-hat">外側から Shadow DOM 内部をスタイリングする</h2>

`::shadow` 擬似要素および `/deep/` コンビネータは、CSS の権限に関して鋭い刃の剣を持つようなものです。Shadow DOM の境界線を突き抜け、Shadow Tree 内のスタイル要素にまで影響を与えることができます。

<h3 id="toc-style-hat">::shadow 擬似要素</h3>

要素が少なくともひとつの Shadow Tree を持っている場合、`::shadow` 擬似要素は ShadowRoot とマッチします。これにより、要素の Shadow DOM 内のノードにスタイルを当てるセレクターを書くことが可能になります。

例えば、ある要素が ShadowRoot を持っている場合、`#host::shadow span {}` とすることで、Shadow Tree 内のすべての `<span>` 要素にスタイルを当てることができます。

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

**例** (Custom Elements) - `<x-tabs>` が Shadow DOM の子要素に `<x-panel>` を持ち、各パネルが `h2` ヘッダー内にそれぞれ Shadow Tree をホストしている場合、メインページから各ヘッダーをスタイリングするには：

    x-tabs::shadow x-panel::shadow h2 {
      ...
    }

<h3 id="toc-style-cat">/deep/ コンビネータ</h3>

`/deep/` コンビネータは `::shadow`　に似ていますが、よりパワフルです。Shadow Boundary を完全に無視し、Shadow Tree をいくつでも乗り越えてしまいます。単純に言ってしまえば、`/deep/` は要素の内部まで入り込み、どんなノードでもターゲットにすることができます。

`/deep/` コンビネータは、複数階層にまたがる Shadow DOM が使われることの多い Custom Elements の世界でとりわけ有用です。何層にもネストされた Custom Elements や、[`<shadow>`](/tutorials/webcomponents/shadowdom-301/#toc-shadow-insertion) を使って他の要素から継承される場合が主なユースケースとなります。

**例** (Custom Elements) - `<x-tabs>` の子要素となるすべての `<x-panel>` 要素を選択する：

    x-tabs /deep/ x-panel {
      ...
    }

**例** - Shadow Tree 内にあるすべての `.library-theme` クラスを持った要素をスタイリングする：

    body /deep/ .library-theme {
      ...
    }

<h3 id="toc-css-traverasl">querySelector() との合わせ技</h3>

[`.shadowRoot`](/tutorials/webcomponents/shadowdom-301/#toc-get-shadowroot) の代わりにコンビネータを使って Shadow Tree を開くことができます。`.querySelector()` をチェーンさせず、ひとつのステートメントで記述するなら：

    // 楽しくない
    document.querySelector('x-tabs').shadowRoot
            .querySelector('x-panel').shadowRoot
            .querySelector('#foo');

    // 楽しい
    document.querySelector('x-tabs::shadow x-panel::shadow #foo');

<h3 id="toc-style-native">Styling native elements</h3>

ネイティブな HTML 要素をスタイリングするのは至難の業です。ほとんどの人が諦めて自分の要素を作ってしまいます。しかしながら、`::shadow` と `/deep/` を駆使することで、ウェブプラットフォーム上の Shadow DOM を使ったネイティブ要素は、スタイリングが可能です。`<input>` や `<video>` が良い例でしょう：

    video /deep/ input[type="range"] {
      background: hotpink;
    }

<div class="demoarea">  
  <video id="ex-style-video" controls></video>
</div>

<blockquote class="commentary talkinghead">
<code>::shadow</code> 擬似要素と <code>/deep/</code> コンビネータは、スタイルカプセル化の持つ意義をなくすものでしょうか？Shadow DOM は、デフォルトでは外部からの <em>意図しない</em> スタイリングを防ぎますが、防弾チョッキではありません。開発者は、何をやっているのかを把握できている限りにおいて、<em>意図的に</em> Shadow Tree 内をスタイリングできるべきです。これにより柔軟性も上がりますし、テーマを作ったり、作った要素の再利用性も向上します。
</blockquote>

<h2 id="toc-style-hooks">Creating style hooks</h2>

カスタマイゼーションはよいものです。場合によっては、Shadow DOM の境界線に穴を開けて、外部からスタイル可能にしたいこともあるのではないでしょうか？

<h3 id="toc-custom-pseduo">Using ::shadow and /deep/</h3>

`/deep/` にはコンポーネント作者が各要素をスタイリング可能にしたり、テーマを当てられるようにすることができる秘められたパワーがあります。

**例** - Shadow Tree を無視して `.library-theme` を持つすべての要素をスタイリングする：

    body /deep/ .library-theme {
      ...
    }

{% comment %}
<h3 id="toc-custom-pseduo">カスタム擬似要素を使う</h3>

[WebKit](http://trac.webkit.org/browser/trunk/Source/WebCore/css/html.css?format=txt) と [Firefox](https://developer.mozilla.org/en-US/docs/CSS/CSS_Reference/Mozilla_Extensions#Pseudo-elements_and_pseudo-classes) は、ネイティブ要素の内部をスタイリングする擬似要素を定義しています。`input[type=range]` が良い例です。`::-webkit-slider-thumb` を指すことで、スライダーのノブを <span style="color:blue">青く</span> スタイリングすることができます：

    input[type=range].custom::-webkit-slider-thumb {
      -webkit-appearance: none;
      background-color: blue;
      width: 10px;
      height: 40px;
    }

ブラウザが内部的にスタイルを割り当てるのと同様の方法で、Shadow DOM コンテンツ作者は特定の要素を、第三者からスタイリング可能にすることができます。これが [カスタム擬似要素](http://www.w3.org/TR/shadow-dom/#custom-pseudo-elements) と呼ばれる仕組みです。

カスタム擬似要素を示すには、`pseudo` 属性を使います。この値や名前は `"x-"` で前置される必要があり、Shadow Tree 内の要素と関連付けることで、第三者に Shadow Boundary を越える道筋を与えます。

こちらはカスタムスライダーウィジェットを作り、第三者がスライダーのノブを <span style="color:blue">青く</span> する例です：

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
カスタム擬似要素が素晴らしいのは、外部の CSS からアクセスできても、外部の JavaScript からはアクセスできない点です。Shadow Boundary は JavaScript からは守られていますが、カスタム擬似要素の定義は許可されています。
</blockquote>
{% endcomment %}

<h3 id="toc-vars">CSS Variables を使う</h3>

テーマを可能にする方法に [CSS Variables](http://dev.w3.org/csswg/css-variables/) を使ったものが挙げられます。これはひとことで言えば、第三者が埋められる「スタイルのプレースホルダー」です。

Custom Element の作者が Shadow DOM に変数のプレースホルダーを用意した場合を想像してください。ひとつは内部のボタンに用いるフォント、もうひとつは色です：

    button {
      color: var(--button-text-color, pink); /* デフォルトの色はピンク */
      font-family: var(--button-font);
    }

そして、要素の利用者は好みに応じてその値を定義します。例えばページのテーマに合わせてカッコいい Comic Sans フォントを使うとか：

    #host {
      --button-text-color: green;
      --button-font: "Comic Sans MS", "Comic Sans", cursive;
    }

CSS Variables の継承に則って、全てが桃のように、美しくなりました！まとめるとこんな感じ：

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
この記事で何度か <a href="/tutorials/webcomponents/customelements/">Custom Elements</a> という言葉を使いました。ひとまず、Shadow DOM がスタイリングと DOM のカプセル化をもって、その構造の基礎を成すということだけ知っておいて下さい。ここでのコンセプトは Custom Elements のスタイリングに関連するものです。
</blockquote>

{% comment %}
<h2 id="toc-style-inheriting">スタイルのリセット</h2>

`font` や `color`, `line-height` といった、継承可能なスタイルは Shadow DOM ないであっても要素に影響を与えます。ただし、最大限の柔軟性を得るため、Shadow DOM には Shadow Boundary で起こることを制御するためのプロパティ `resetStyleInheritance` が存在します。
新しいコンポーネントを作る際に、ゼロからスタートできる方法と考えて下さい。

**resetStyleInheritance**

- `false` - デフォルト。[継承可能な CSS プロパティ](http://www.impressivewebs.com/inherit-value-css/) は引き続き継承される。
- `true` - 境界上の継承可能なプロパティが `initial` にリセットされる。

下記は `resetStyleInheritance` を変更することで Shadow Tree がどのような影響を受けるかを示すデモです：

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

継承可能な CSS プロパティにのみ影響するという点では、`.resetStyleInheritance` は若干理解しづらいかもしれません。仕様によると：ページと ShadowRoot の境界で継承されるプロパティを探している場合、ホストから値を継承するのではなく、`initial` を使うこと、とあります。

CSS でどのプロパティが継承されるのか分からない場合は、
[このページ](http://www.impressivewebs.com/inherit-value-css/) を見るか、DevTools の Elements パネルで "Show inherited" をチェックしてください。
{% endcomment %}

<h2 id="toc-style-disbtributed-nodes">分散ノードのスタイリング</h2>

分散ノードとは、[挿入ポイント](/tutorials/webcomponents/shadowdom-301/#toc-distributed-nodes) でレンダリングされる要素 (`<content>` 要素) のことです。`<content>` 要素は Light DOM (Shadow DOM と対義) からノードを選択し、Shadow DOM 内で予め決められた場所にレンダリングするためのものです。`<content>` は、論理的には Shadow DOM 内部ではなく、ホスト要素の子要素のままです。挿入ポイントは、レンダリングを司るものでしかありません。

分散ノードは親ドキュメントからのスタイルを保持します。つまり、挿入ポイントでレンダリングされたとしても、その要素に適用された親ドキュメントからのスタイルルールは適用されるということです。繰り返しになりますが、分散ノードは論理的には Light DOM 内にあり、動きません。レンダリングの位置が変更されるだけです。ただし、ノードが Shadow DOM 内に分散されると、Shadow Tree 内で定義されたスタイルが適用されます。

<h3 id="toc-distributed">::content 擬似要素</h3>

分散ノードはホストの子要素ですが、Shadow DOM **内部** からこれを指すにはどうすればよいでしょうか？
答えは CSS `::content` 擬似要素です。
これは挿入ポイントを通して Light DOM ノードを指すための方法です。

例えば `::content > h3` は挿入ポイントを通ったすべての `h3` タグをスタイリングします。

具体例を見てみましょう：

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

"<span style="color:red">Shadow DOM</span>" と、その下に "<span style="color:green">Light DOM</span>" が見えるはずです。"Light DOM" が margin などのスタイルを保持したままであることにも注目して下さい。これはページのスタイルがまだ一致しているためです。


{%comment%}
<h3 id="toc-shadow-resetstyles">挿入ポイントのスタイルをリセットする</h3>

ShadowRoot を作る際、継承するスタイルをリセットするオプションがあります。`<content>` と `<shadow>` 挿入ポイントにも、このオプションが存在します。これらの要素を使うには、`.resetStyleInheritance` を JavaScript で、もしくは boolean 値の `reset-style-inheritance` 属性を使います。

- ShadowRoot または `<shadow>` 挿入ポイントにおいて、`reset-style-inheritance` は継承可能な CSS プロパティが、Shadow コンテンツに到達する前に、ホストで `initial` にセットされることを意味します。**この位置は Upper Boundary と呼ばれます。**

- `<content>` 挿入ポイントにおいて、`reset-style-inheritance` は継承可能な CSS プロパティが、ホストの子要素が挿入ポイントに分散される前に、`initial` にセットされることを意味します。**この位置は Lower Boundary と呼ばれます。**
{%endcomment%}

<blockquote class="commentary talkinghead">
ホストドキュメントで定義されたスタイルは、Shadow DOM 内で分散されたとしても、指し示すノードに適用され続けます。適用されたものは、挿入ポイントであっても変わらないのです。
</blockquote>

<h2 id="toc-conclusion">まとめ</h2>

Custom Elements の作者には、コンテンツの見た目を制御するオプションがたくさん用意されています。Shadow DOM はこの新しい世界の基礎を形作るものなのです。

Shadow DOM は、スコープされたスタイルのカプセル化と、必要に足るだけ外界の意図を持ち込む手段を提供します。カスタム擬似要素や CSS Variable のプレースホルダーを定義することで、要素の作者は第三者にさらなるカスタマイズの自由を与えることができます。これは言い換えれば、ウェブ製作者がコンテンツの見た目に関して、全権を握っているということです。

<p class="small-notice">
このチュートリアルの内容をレビューしてくれた <a href="/profiles/#dominiccooney">Dominic Cooney</a> と
<a href="https://plus.google.com/111648463906387632236/posts">Dimitri Glazkov</a> に感謝します。
</p>

{% block relatedreading %}
<aside class="panel">
  <h2>関連する資料</h2>
  <ul>
    <li><a href="/tutorials/webcomponents/shadowdom/">Shadow DOM 101</a></li>
    <li><a href="/tutorials/webcomponents/shadowdom-301/">Shadow DOM 301 - Advanced Concepts &amp; DOM APIs</a></li>
    <li><a href="/tutorials/webcomponents/customelements/">Custom Elements - HTML に新しい要素を定義する</a></li>
  </ul>
</aside>
{% endblock %}


