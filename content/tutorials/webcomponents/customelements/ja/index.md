<p class="notice warning" style="text-align:center">
この記事では、まだ完全に標準化されていない API について述べています。実験的な API を利用する際は、十分ご注意下さい。
</p>

<h2 id="intro">はじめに</h2>

ウェブには表現力がもっと必要です。この意味を知るには、Gmail のような「モダンな」ウェブアプリを見てみればわかるでしょう：

<figure>
  <a href="gmail.png"><img src="gmail.png" style="max-width:75%"></a>
  <figcaption><code>&lt;div></code> だらけのモダンなウェブアプリ</figcpation>
</figure>

`<div>` だらけでモダンと言えるでしょうか？そして現状では、これが我々のウェブアプリの作り方なのです。悲しいですね。
我々はウェブプラットフォームからの恩恵をもっと受けるべきだとは思いませんか？

<h3 id="meaningful">もっとセクシーなマークアップを！</h3>

HTML はドキュメントを構成するツールとしてはこの上ないものです。しかしそのボキャブラリーは [HTML 標準](http://www.whatwg.org/specs/web-apps/current-work/multipage/) が定義する要素に限定されてます。

Gmail のマークアップが仮にこんな感じだったらどうでしょう？：

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
  <button><a href="https://html5-demos.appspot.com/hangouts">デモを試す</a></button>
</p>

素晴らしいでしょう？このアプリはもちろん意味を持っています。**意味を持っている**し、**理解しやすい** はずです。
そして何よりも、**メンテナンスが容易** なのです。将来的には、宣言的な仕組みを調査するだけで、何をしているか理解できるようになるでしょう。

<h2 id="gettingstarted">Getting started</h2>

[Custom Elements](http://w3c.github.io/webcomponents/spec/custom/) によって、開発者は **新しい型の HTML 要素を作る** ことができるようになります。仕様は [Web Components](http://w3c.github.io/webcomponents/explainer/) が提唱する一連の API 仕様のひとつですが、最も重要なものと言えます。Web Components は Custom Elements で利用可能になる機能なしには存在し得ないのです：

1. 新しい HTML/DOM 要素を定義する
2. 他の要素を継承した要素を作り出す
3. 論理的にひとつのタグにカスタマイズされた機能をバンドルする
4. 既存の DOM 要素の API を拡張する

<h3 id="registering">新しい要素を登録する</h3>

Custom Element は `document.registerElement()` を使って作ることができます：

    var XFoo = document.registerElement('x-foo');
    document.body.appendChild(new XFoo());

最初の引数は要素のタグ名です。名前には **ダッシュ (-) を含む必要があります** 。例えば `<x-tags>`、`<my-element>`、`<my-awesome-app>` はすべて許可された名前ですが、`<tabs>` や `<foo_bar>` は許可されません。この制限により、パーサーは通常の要素と Custom Element を区別することができ、将来的に HTML に新しい要素が追加された際の互換性も保証してくれます。

ふたつめの引数はオプションとなるオブジェクトで、要素の `prototype` を記述します。これはあなたの要素にカスタム機能 (プロパティやメソッド) を追加するための場所でもあります。詳しくは [後ほど](#publicapi) 触れます。

デフォルトでは、Custom Element は `HTMLElement` を継承します。そのため、先ほどの例は下記と同等になります：

    var XFoo = document.registerElement('x-foo', {
      prototype: Object.create(HTMLElement.prototype)
    });

`document.registerElement('x-foo')` を呼び出すと、ブラウザは新しい要素を認識し、`<x-foo>` のインスタンスを作ることができるコンストラクタを返します。
コンストラクタを使いたくなければ、[他の方法](#instantiating) を使って要素のインスタンス化することもできます。

<p class="notice tip">グローバルな <code>window</code> オブジェクトを汚染したくない場合は、名前空間 (<code>var myapp = {}; myapp.XFoo = document.registerElement('x-foo');</code>) を使って下さい。</p>

<h3 id="extending">ネイティブ要素を拡張する</h3>

ごく普通の `<button>` に不満があったとしましょう。そしてそれを "Mega Button" に拡張したいとします。`<button>` 要素を拡張するには、`HTMLButtonElement` の `prototype` を継承した新しい要素を作ります：

    var MegaButton = document.registerElement('mega-button', {
      prototype: Object.create(HTMLButtonElement.prototype)
    });

<p class="notice fact">
<b>要素 A</b> を拡張した <b>要素 B</b> を作るには、<b>要素 A</b> は <b>要素 B</b> の <code>prototype</code> を継承しなければなりません。</p>

こういった Custom Elements は _型拡張 Custom Element_ と呼ばれ、"要素 X は Y である" と宣言するため、`HTMLElement` の特別版を継承します。

例：

    <button is="mega-button">

<h3 id="upgrades">どのようにして要素はアップグレードされるのか</h3>

HTML パーサーがなぜ非標準のタグに対して例外を投げないか不思議に思ったことはありませんか？ `<randomtag>` というタグをページに埋め込んでも、特に文句は言われません。[HTML 仕様](http://www.whatwg.org/specs/web-apps/current-work/multipage/elements.html#htmlunknownelement) によると：

<blockquote>
  この仕様で定義されていない HTML 要素に対しては <code>HTMLUnknownElement</code> インターフェースを使わなければならない。
  <cite>HTML 仕様</cite>
</blockquote>

ごめん、`<randomtag>`！君は標準じゃないので `HTMLUnknownElement` から継承されるんだ。

Custom Elements について同じことは言えません。 **正当な名前が与えられた Custom Elements は `HTMLElement` から継承されます。** Console を使うことでこれを確認できます：<span class="kbd">Ctrl</span>+<span class="kbd">Shift</span>+<span class="kbd">J</span> (Mac の場合 <span class="kbd">Cmd</span>+<span class="kbd">Opt</span>+<span class="kbd">J</span>) をし、下記のコードをペーストすると、`true` を返します。

    // "tabs" は正当な Custom Element 名ではありません
    document.createElement('tabs').__proto__ === HTMLUnknownElement.prototype

    // "x-tabs" は正当な Custom Element 名です
    document.createElement('x-tabs').__proto__ == HTMLElement.prototype

<p class="notice fact"><code>document.registerElement()</code> をサポートしないブラウザでは、<code>&lt;x-tabs></code> は <code>HTMLUnknownElement</code> を返します。</p>

<h4 id="unresolvedels">未解決の要素</h4>

Custom Elements はスクリプト `document.registerElement()` によって登録されるため、ブラウザによって **定義が登録される前に宣言したり、生成したりすることができます。** 例えば `<x-tabs>` を宣言したとしても、`document.registerElement('x-tabs')` を呼び出すのはずっと後でも構わないのです。

要素は定義の通りにアップグレードされるまでの間、 **未解決の要素** と呼ばれます。これらの HTML 要素は正当な Custom Element 名を持ちますが、まだ登録されていないものです。

一覧表にまとめてみましょう：

<table>
  <thead><tr><th>名前</th><th>継承元</th><th>例</th></tr></thead>
  <tr><td>未解決要素</td><td><code>HTMLElement</code></td><td><code>&lt;x-tabs></code>, <code>&lt;my-element></code>, <code>&lt;my-awesome-app></code></td></tr>
  <tr><td>未知の要素</td><td><code>HTMLUnknownElement</code></td><td><code>&lt;tabs></code>, <code>&lt;foo_bar></code>
</td></tr>
</table>

<blockquote class="commentary talkinghead">未解決の要素はどっちつかずの状態と思って下さい。ブラウザが後からアップグレードする候補です。「新しい要素になるための素質は十分ある。定義さえくれればアップグレードすると約束しよう。」とブラウザが言っているのです。</blockquote>

<h2 id="instantiating">要素をインスタンス化する</h2>

要素を作る際のテクニックがそのまま Custom Element にも当てはまります。他の標準要素と同様、HTML で宣言したり、JavaScript を使って DOM として生成することもできます。

<h3 id="usecustomtag">カスタムタグをインスタンス化する</h3>

**宣言する**：

    <x-foo></x-foo>

JavaScript で **DOM を生成する**：

    var xFoo = document.createElement('x-foo');
    xFoo.addEventListener('click', function(e) {
      alert('Thanks!');
    });

**`new` オペレーター** を使う：

    var xFoo = new XFoo();
    document.body.appendChild(xFoo);

<h3 id="usetypeextension">型拡張要素をインスタンス化する</h3>

型拡張型の Custom Elements のインスタンス化は 通常の カスタムタグの場合にそっくりです。

**宣言する**：

    <!-- <button> "is a" mega button -->
    <button is="mega-button">

JavaScript で **DOM を生成する**：

    var megaButton = document.createElement('button', 'mega-button');
    // megaButton instanceof MegaButton === true

見ての通り、`is=""` を第二引数に取る `document.createElement()` のオーバーロード版があります。

**`new` オペレーター** を使う：

    var megaButton = new MegaButton();
    document.body.appendChild(megaButton);

ここまでブラウザに新しいタグを教えるための `document.registerElement()` について説明してきましたが、まだできることはそれほど多くありません。プロパティとメソッドの追加方法についても見て行きましょう。

<h2 id="publicapi">JavaScript プロパティとメソッドの追加</h2>

Custom Elements のパワフルなところは、要素にプロパティやメソッドを定義することで、一連の機能を付加することができるところです。あなたの要素に公開 API が追加できると考えて下さい。

例を挙げてみましょう：

    var XFooProto = Object.create(HTMLElement.prototype);

    // 1.x-foo に foo() メソッドを追加
    XFooProto.foo = function() {
      alert('foo() called');
    };

    // 2. 読み込み専用のプロパティ "bar" を定義
    Object.defineProperty(XFooProto, "bar", {value: 5});

    // 3. x-foo の定義を登録
    var XFoo = document.registerElement('x-foo', {prototype: XFooProto});

    // 4. x-foo をインスタンス化
    var xfoo = document.createElement('x-foo');

    // 5. ページに追加
    document.body.appendChild(xfoo);

もちろん `prototype` をコンストラクトするには無数の方法が存在します。こちらは同じことをもっと短いコードで実現しているサンプルです：

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

最初のやり方は ES5 の [`Object.defineProperty`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) を使っています。二番目のやり方は [get/set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/get) を使っています。

<h3 id="lifecycle">ライフサイクルコールバックメソッド</h3>

Custom Elements では絶妙なタイミングで特別なメソッドを呼び出すことができます。これらのメソッドは **ライフサイクルコールバック** と呼ばれ、それぞれに特別な名前と目的があります：

<table class="table">
  <thead>
    <tr>
      <th>コールバック名</th>
      <th>呼び出されるタイミング</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>createdCallback</td>
      <td>要素のインスタンスが作られた時</td>
    </tr>
    <tr>
      <td>attachedCallback</td>
      <td>インスタンスがドキュメントに追加された時</td>
    </tr>
    <tr>
      <td>detachedCallback</td>
      <td>インスタンスがドキュメントから取り除かれた時</td>
    </tr>
    <tr>
      <td>attributeChangedCallback(attrName, oldVal, newVal)</td>
      <td>属性が追加、削除、更新された時</td>
    </tr>
  </tbody>
</table>

**例：** `<x-foo>` の `createdCallback()` と `attachedCallback()` を定義する：

    var proto = Object.create(HTMLElement.prototype);

    proto.createdCallback = function() {...};
    proto.attachedCallback = function() {...};

    var XFoo = document.registerElement('x-foo', {prototype: proto});

**ライフサイクルコールバックはすべてオプションです** が、意味があると思ったら定義しましょう。例えば、あなたの要素が `createdCallback()` 内で IndexedDB に対してコネクションを張る場合が考えられます。DOM から取り除かれる直前に、`detachedCallback()` 内でクリーンアップ作業を行う必要もあります。**注意：** ユーザーがいきなりタブを閉じてしまうケースもあるので、これに頼りきってはいけません。あくまで最適化のひとつと考えて下さい。

もうひとつ挙げられる例は、要素に対するイベントリスナーの設定です：

    proto.createdCallback = function() {
      this.addEventListener('click', function(e) {
        alert('Thanks!');
      });
    };

<blockquote class="commentary talkinghead">遅い要素は使ってもらえません。ライフサイクルコールバックを使って最適化を進めましょう！</blockquote>

<h2 id="addingmarkup">マークアップを追加する</h2>

`<x-foo>` を作り、JavaScript API を追加しましたが、まだ要素は空です。中に HTML を追加してみましょう。

ここで [ライフサイクルコールバック](#lifecycle) が役立ちます。`createdCallback()` を使ってデフォルトとなる HTML を追加してみます。

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      this.innerHTML = "<b>I'm an x-foo-with-markup!</b>";
    };

    var XFoo = document.registerElement('x-foo-with-markup', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-with-markup></x-foo-with-markup>
</div>

このタグをインスタンス化し、DevTools (右クリックし、Inspect Element を選択) でインスペクトしてみると下記のようなものが見えるはずです：

    ▾<x-foo-with-markup>
       <b>I'm an x-foo-with-markup!</b>
     </x-foo-with-markup>

<h3 id="shadowdom">内部を Shadow DOM でカプセル化する</h3>

[Shadow DOM](/tutorials/webcomponents/shadowdom/) はそれ自体、カプセル化を行うためのパワフルなツールです。Custom Element と組み合わせて使うことで、魔法のような力を発揮することができます！

Shadow DOM と合わせて使うことで Custom Elements は：

1. 内部構造を隠蔽し、複雑な実装を見せなくすることができます。
2. [Style のカプセル化](/tutorials/webcomponents/shadowdom-201/) を手軽に実現できます。

Shadow DOM から要素を作り出すのは、基本的なマークアップをレンダリングするのに似ています。違いは `createdCallback()` にあります：

    var XFooProto = Object.create(HTMLElement.prototype);

    XFooProto.createdCallback = function() {
      // 1. shadow root を要素に追加
      var shadow = this.createShadowRoot();

      // 2. それをマークアップで埋める
      shadow.innerHTML = "<b>I'm in the element's Shadow DOM!</b>";
    };

    var XFoo = document.registerElement('x-foo-shadowdom', {prototype: XFooProto});

<div class="demoarea">
  <x-foo-shadowdom></x-foo-shadowdom>
</div>

要素の `innerHTML` を設定する代わりに、Shadow Root を作り、それをマークアップで埋めました。
DevTools の "Show Shadow DOM" 設定を enabled にすることで、`#shadow-root` を展開して見ることができます：

    ▾<x-foo-shadowdom>
       ▾#shadow-root
         <b>I'm in the element's Shadow DOM!</b>
     </x-foo-shadowdom>

これが Shadow Root です！

<h3 id="fromtemplate">テンプレートから要素を作る</h3>

[HTML Templates](http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element) は Custom Elements の世界にぴったりの、もうひとつの新しい API です。

[`<template>` 要素](/tutorials/webcomponents/template/) はパースされ、ページロードと同時に有効になり、ランタイム中にインスタンス化される DOM フラグメントを宣言することができます。Custom Element の構造を宣言するのにぴったりのプレースホルダーだと思いませんか？

**例：** `<template>` と Shadow DOM から作った要素を登録する：

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

たった数行のコードですが、この中には色んなモノが詰まっています。ここで行われていることを解説してみましょう：

1. HTML に新しい要素 `<x-foo-from-template>` を登録
- その要素の DOM は `<template>` から生成
- その要素の中身は Shadow DOM で隠蔽
- Shadow DOM により要素のスタイルはカプセル化されている (`p {color: orange;}` はページ全体を <span style="color: orange;">オレンジ</span> にしない)

どうですか？

<h2 id="styling">Custom Element にスタイルを付与する</h2>

他の HTML タグ同様、あなたの Custom Element ユーザーはセレクターを使ってスタイルを割り当てることができます：

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

<h3 id="styling">Shadow DOM を使った要素にスタイルを付与する</h3>

Shadow DOM を持ち込むことで、うさぎの穴は更に深くなっていきます。[Shadow DOM を使った Custom Elements](#shadowdom) は恩恵も継承します。

Shadow DOM はスタイルのカプセル化の恩恵をもたらします。Shadow Root で定義されたスタイルはホストから漏れることはなく、ページから漏れてくることもありません。**Custom Element の場合、要素自体がホストとなります。** Custom Elements は、カプセル化されたスタイルのプロパティのおかげで、デフォルトスタイルを定義することができます。

Shadow DOM のスタイルは複雑です！もっと詳しく知りたければ、私の書いた他の記事をおすすめします：

- [Polymer](http://www.polymer-project.org) のドキュメントから "[A Guide to Styling Elements](http://www.polymer-project.org/articles/styling-elements.html)"
- html5rocks.com の "[Shadow DOM 201: CSS & Styling](/tutorials/webcomponents/shadowdom-201/)"

<h3 id="fouc">:unresolved を使って FOUC を防ぐ</h3>

[FOUC (Flash of unstyled content: スタイルが与えられていないコンテンツによる明滅)](http://en.wikipedia.org/wiki/Flash_of_unstyled_content) をなくすため、Custom Elements 仕様では、新しい CSS 擬似クラスである `:unresolved` を定義しています。`createdCallback()` が呼び出されるまでの、[未解決の要素](#unresolvedels) に使って下さい ([ライフサイクルメソッド参照](#lifecycle))。一度解決すれば、要素はもう未解決ではなくなります。アップグレードプロセスが完了し、要素は定義された状態に変わります。

<p class="notice">CSS <code>:unresolved</code> は Chrome 29 からサポートされています。</p>

**例：** 登録されるとフェードインする "x-foo" タグ：

    <style>
      x-foo {
        opacity: 1;
        transition: opacity 300ms;
      }
      x-foo:unresolved {
        opacity: 0;
      }
    </style>

`:unresolved` は [未解決の要素](#unresolvedels) にのみ適用され、 `HTMLUnknownElement` ([要素のアップグレードについて](#upgrades) 参照) から継承された要素には適用されないことに注意して下さい。

    <style>
      /* すべての未解決の要素に破線を適用 */
      :unresolved {
        border: 1px dashed red;
        display: inline-block;
      }
      /* 未解決の x-panel は赤 */
      x-panel:unresolved {
        color: red;
      }
      /* x-panel の定義が登録されると緑に変わる */
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

`:unresolved` についてより詳しく知るには、Polymer の [A Guide to styling elements](http://www.polymer-project.org/articles/styling-elements.html#preventing-fouc) をご覧下さい。


<h2 id="historysupport">歴史とブラウザーサポート状況</h2>

<h3 id="featuredetect">機能検知</h3>

機能検知は `document.registerElement()` の存在をチェックするだけです：
    
    function supportsCustomElements() {
      return 'registerElement' in document;
    }

    if (supportsCustomElements()) {
      // Good to go!
    } else {
      // Use other libraries to create components.
    }

<h3 id="support">ブラウザーサポート状況</h3>

`document.registerElement()` は Chrome 27 と Firefox ~23 でフラグ付きで実装されました。しかし、その後仕様が大きく変更したため、Chrome 31 が最新の仕様に対応した最初のブラウザーということになります。

<p class="notice fact">Custom Elements は Chrome 31 で <code>about:flags</code> の "Experimental Web Platform features" フラグをオンにすることで利用できます。</p>

ブラウザーサポートがよくなるまでの間使うことができる Polyfill がいくつかあります：

- Google の [Polymer](http://polymer-project.org) の [polyfill](http://www.polymer-project.org/platform/custom-elements.html)
- Mozilla の [x-tags](http://www.x-tags.org/)

<h3 id="elementel">HTMLElementElement はどうなったの？</h3>

標準化を追いかけてきた人ならば、`<element>` という仕様が存在していたことをご存知のはずです。これは新しい要素を宣言的に定義できる素晴らしいものでした：

    <element name="my-element">
      ...
    </element>

残念なことに、[アップグレードプロセス](#upgrades) などで対処すべき問題が多過ぎたため、2013 年 8 月、Dimitri Glazkov が、少なくともしばらくは `<element>` を仕様から取り除くことを [public-webapps](http://lists.w3.org/Archives/Public/public-webapps/2013JulSep/0287.html) のメーリングリストで宣言しました。

Polymer では `<polymer-element>` を使うことで、宣言的に要素を登録する方法を実装しています。どうやって？ `document.registerElement('polymer-element')` と [テンプレートから要素を作る](#fromtemplate) で述べたテクニックを使っています。

<h2 id="conclusion">最後に</h2>

Custom Elements は HTML のボキャブラリーを拡張し、新しいトリックや、ウェブプラットフォームの虫食い穴を飛び越えるためのツールを提供してくれます。これを Shadow DOM や `<template>` と組み合わせて使うことで、Web Components の絵が見えてきます。マークアップはまたセクシーになるのです！

Web Components について調べてみたいと思った方は、ぜひ [Polymer](http://polymer-project.org) をご覧下さい。期待以上のものが待ってるはずですよ！

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

