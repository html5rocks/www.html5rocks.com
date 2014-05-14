<h2 id="toc-intro">はじめに</h2>

テンプレートというコンセプトはウェブ開発において真新しいものではありません。むしろ、Django (Python) や ERB/Haml (Ruby)、Smarty (PHP) といった [サーバーサイトテンプレート言語／エンジン](http://en.wikipedia.org/wiki/Template_engine_(web)) は長きにわたって愛されてきました。しかしここ数年、MVC フレームワークが爆発的な盛り上がりを見せ、それぞれに微妙に異なってはいますが、プレゼンテーションレイヤーにテンプレートと呼ばれる共通のメカニズム (View) を持っていることをご存じの方は多いでしょう。

そう、テンプレートは素晴らしいのです。周りの人にも聞いてみてください。その [定義](http://www.thefreedictionary.com/template) すら愛おしくなってくるはずです：

> **template** (名詞) - 毎回作り直す必要がないように、特定のアプリケーションの開始状態として利用される、予め決まった様式を持つドキュメントまたはファイル。

「毎回作り直す必要がないように」あなたがどうかは知りませんが、私はできればサボりたいと思っています。ならウェブプラットフォームが開発者が欲しいと思っているネイティブ機能を持たない理由なんてあるでしょうか？

[WatWG HTML Templates 仕様][spec-link] こそがその答えなのです。この仕様では新しく `<template>` 要素を定義し、標準で DOM ベースのクライアントサイドテンプレートのアプローチについて記述しています。テンプレートにより、HTML にパースできるマークアップの切れ端を宣言し、ページロード時点では利用されないながらも、ランタイムにインスタンス化することが可能になります。[Rafael Weinstein](https://plus.google.com/111386188573471152118/posts) を引用するならこうです：

<blockquote>
  テンプレートは、何があってもブラウザにいじくりまわされたくない HTML の塊を置いておく場所なのです。
  <cite>Rafael Weinstein (仕様編集者)</cite>
</blockquote>

<h3 id="toc-detect">機能検知</h3>

`<template>` の機能を検知するには、DOM 要素を作り、`.content` プロパティがあるかどうかを調べます：

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // template が利用可能
    } else {
      // 古いテンプレートテクニックかライブラリを使う
    }

<h2 id="toc-started">テンプレートコンテンツを宣言する</h2>

HTML `<template>` 要素はあなたのマークアップ上のテンプレートを表します。中身は「テンプレートのコンテンツ」つまりクローン可能な、**自律動作できない DOM** です。
テンプレートを、あなたのアプリケーションが終了するまで繰り返し使えるスキャフォールド (足場) と考えて下さい。

テンプレートのコンテンツを作るには、マークアップを宣言して、`<template>` 要素でくるんで下さい：

    <template id="mytemplate">
      <img src="" alt="great image">
      <div class="comment"></div>
    </template>

<blockquote class="commentary talkinghead">
勘の鋭い皆さんならお気付きでしょうが、`src` が空であることにお気付きでしょう。しかしこれは意図されたものなのです。空の画像は 404 になりませんし、コンソールエラーも吐きません。なぜなら、ページロード時にコンテンツを取りに行かないからです。ソース URL は後から動的に生成することができます。以下をご覧下さい。
</blockquote>

<h2 id="toc-pillars">要点</h2>

コンテンツを `<template>` で囲むと、いくつかの重要なプロパティが得られます。

1. **コンテンツはアクティベートされるまで、自律動作しません。** つまり、あなたのマークアップは隠れた DOM として存在するだけで、レンダリングされないのです。

2. テンプレート内のどんなコンテンツも副作用を持ちません。 **スクリプトは動作しませんし、画像はロードされません。オーディオも再生されません** ...テンプレートが実際に利用されるまでは。

3. **コンテンツはドキュメント内に存在しないものとして扱われます。** メインページ内で行う `document.getElementById()` または `querySelector()` は template の子ノードを返しません。

4. テンプレートは `<head>`, `<body>` または `<frameset>` 内なら **どこにでも置くことができ** 、その中に置けるコンテンツなら、何を置いても構いません。なお、ここで言う「どこにでも」は `<template>` が通常 HTML パーサーが許可しないすべての場所 (...ただし[コンテンツモデル](http://www.w3.org/TR/html5-diff/#content-model) の子要素を除く) でも安全に利用できることを意味します。`<table>` や `<select>` の子要素として置くことも可能です：

        <table>
        <tr>
          <template id="cells-to-repeat">
            <td>some content</td>
          </template>
        </tr>
        </table>

<h2 id="toc-using">テンプレートをアクティベートする</h2>

テンプレートを使うには、アクティベート (有効化) する必要があります。アクティベートしなければ、コンテンツはレンダリングされません。
最も簡単な方法は、`.content` を `document.importNode()` を使って再帰的にコピーすることです。`.content` プロパティはテンプレートの中身を持つ、読み込み専用の `DocumentFragment` です。

    var t = document.querySelector('#mytemplate');
    // src をランタイムに埋める
    t.content.querySelector('img').src = 'logo.png';

    var clone = document.importNode(t.content, true);
    document.body.appendChild(clone);

テンプレートはスタンプを押すように複製されることで、はじめてアクティベートされます。この例では、コンテンツはコピーされ、画像がリクエストされ、最終的なマークアップがレンダリングされます。

<h2 id="toc-using">デモ</h2>

<h3 id="toc-demo-insert">例：自律動作しないスクリプト</h3>

この例はテンプレートコンテンツが自律動作しないことを表すものです。`<script>` はボタンを押された場合のみテンプレートから複製され、動作します。

    <button onclick="useIt()">Use me</button>
    <div id="container"></div>
    <script>
      function useIt() {
        var content = document.querySelector('template').content;
        // Update something in the template DOM.
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

<h3 id="toc-demo-sd">例：テンプレートから Shadow DOM を作る</h3>

ほとんどの人が [Shadow DOM](/webcomponents/shadowdom/) にホストを与える際、`.innerHTML` にマークアップの文字列をセットします：

    <div id="host"></div>
    <script>
      var shadow = document.querySelector('#host').createShadowRoot();
      shadow.innerHTML = '<span>Host node</span>';
    </script>

このアプローチの問題は、Shadow DOM が複雑になればなるほど、文字列の連結が必要になることです。これではスケールしませんし、コードも汚くなってしまいます。このアプローチはそもそも、XSS が生まれた背景でもあったはずです。そこで登場するのが `<template>` です。

より良い方法は、shadow root にテンプレートコンテンツを直接継ぎ足すことです。

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
    <h3>Add a Comment</h3>
  </header>
  <content select="p"></content>
  <textarea></textarea>
  <footer>
    <button>Post</button>
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

<h2 id="toc-gotcha">私の得た「気付き」</h2>

以下は私が `<template>` を実際に使ってみた上で得られた気付きです：

- もし [modpagespeed](http://code.google.com/p/modpagespeed/) をお使いなら、この [バグ](http://code.google.com/p/modpagespeed/issues/detail?id=625) にお気を付け下さい。インラインで `<style scoped>` が定義されたテンプレートは、PageSpeed の CSS リライト機能によって `head` に移動される場合があります。
- テンプレートを「事前にレンダリング」つまり、アセットを事前に読み込んだり、JavaScript を実行したり、CSS を読み込んだりする方法はありません。それはサーバーとクライアントに任せることです。テンプレートがレンダリングされるのは、ページが読み込まれた後です。
- ネストされたテンプレートにご注意下さい。おそらくあなたの期待通りには動きません。例えば：

        <template>
          <ul>
            <template>
              <li>Stuff</li>
            </template>
          </ul>
        </template> 

    外側の template をアクティベートしても、内側の template はアクティベートされません。これはつまり、ネストされたテンプレートは、内側の template も手動でアクティベートされている必要があるということを意味します。 

<h2 id="toc-old">標準への道</h2>

ウェブ標準に準拠した HTML テンプレートへの道のりは長いものでした。我々は長年に渡り、再利用可能なテンプレートを作り出す方法を考え抜いてきました。下記 2 つは私が見つけたよくあるテンプレートの手法です。比較のために掲載しておきます。

<h3 id="toc-offscreen">方法 1：オフスクリーン DOM</h3>

長年使われてきたアプローチのひとつは、「オフスクリーン」な DOM を作り、`hidden` 属性や `display:none` を使って見えない場所に隠すというものです：

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

このテクニックは有用なものですが、いくつかの欠点もあります：

- <label class="good"></label> *DOM を使う* - ブラウザは DOM を知っています。簡単にコピーできます。
- <label class="good"></label> *何もレンダリングされない* - `hidden` を使えば隠すことができます。
- <label class="bad"></label> *自律動作してしまう* - コンテンツが隠されていても、画像ではネットワークリクエストが発生してしまいます
- <label class="bad"></label> *スタイル・テーマ付けが面倒* - 埋め込まれるページは、テンプレートにスタイルを集約させるため、すべて CSS ルール `#mytemplate` で前置されなければなりません。これは非常にもろく、名前の衝突が起こらない保証もありません。埋め込まれるページが既に同じ id を持っている場合など、もう罠にハマってしまったようなものです。

<h3 id="toc-overloadingscript">方法 2: script をオーバーロードする</h3>

もうひとつの方法は `<script>` をオーバーロードし、その内容を文字列として操作する方法です。この方法は [Micro Templating utility](http://ejohn.org/blog/javascript-micro-templating/) として 2008 年に John Resig がおそらく初めて提唱しました。
現在では [handlebars.js](http://handlebarsjs.com/) も含め、他にも多数存在しています。

例えば：

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

このテクニックを要約すると：

- <label class="good"></label> *何もレンダリングされない* - ブラウザは `<script>` が元から `display:none` であるため、レンダリングしません。
- <label class="good"></label> *自律動作しない* - ブラウザは `type` が `"text/javascript"` でない限り `script` の内容を JavaScript としてパースすることはありません。
- <label class="bad"></label> *セキュリティ上の懸念* - `.innerHTML` の使用が推奨されているため、ユーザー入力のテンプレート埋め込みは容易に XSS 脆弱性に繋がります。

<h2 id="toc-conclusion">まとめ</h2>

jQuery が DOM 操作を劇的にシンプルに変化させた時のことを覚えていますか？その結果が `querySelector()` や `querySelectorAll()` など、プラットフォームへのネイティブ機能としての追加です。明らかな大成功だったでしょう？ライブラリが CSS セレクターを使って DOM を取得するという機能の人気を押し上げ、ウェブ標準がそれを追いかける。必ずしも成功するパターンではありませんが、私はこういうアプローチが *大好き* です。

私はこれは、`<template>` にも当てはまるものと考えています。template は、クライアントサイドでのテンプレートの挙動を標準化するだけでなく、[2008 年から使われてきたハック](#toc-old) を不要なものとします。
私にとって、ウェブのオーサリングプロセスをよりまともで、メンテナンスしやすく、かつ必要十分な機能で満たすことは、いつも良いことなのです。

<h2 id="toc-resources">追加リソース</h2>

- [WhatWG 仕様][spec-link]
- [はじめての Web Components](http://w3c.github.io/webcomponents/explainer/#template-section)
- [&lt;web>components&lt;/web>](http://html5-demos.appspot.com/static/webcomponents/index.html) ([video](http://www.youtube.com/watch?v=eJZx9c6YL8k)) - 拙著の理解しやすいプレゼンテーションです

[spec-link]: http://www.whatwg.org/specs/web-apps/current-work/multipage/scripting-1.html#the-template-element


