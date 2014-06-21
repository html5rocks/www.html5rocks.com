<h2 id="why">なぜ imports が必要なのか？</h2>

ウェブ上で様々なリソースを読み込みたいとします。JavaScript であれば `<script src>`、CSS なら `<link rel="stylesheet">`、画像なら `<img>`、動画なら `<video>`、音声なら `<audio>` を使いますよね。ウェブ上のコンテンツのほとんどは、ロードするのに、シンプルで宣言的な方法が用意されています。しかし HTML をロードする場合はそういう訳にいきません。やり方としては：

1. **`<iframe>`** - 試して、実際に動きましたが、ちょっと重いですね。iframe のコンテンツは他のページのコンテキスト上に表示されます。大抵のケースでは用を足しますが、課題を残す場合もあります (フレームのサイズを縮めるのは面倒、JavaScript で操作するのもなかなかしんどい。スタイリングに至っては、ほとんど不可能です。)
- **AJAX** - [`xhr.responseType="document"` をするのは大好きですが](http://ericbidelman.tumblr.com/post/31140607367/mashups-using-cors-and-responsetype-document)、HTML をロードするのに JavaScript が必要というのでは、正しい方法とは思えません。
- **クレイジーハック&#8482;** - 文字列に埋め込んで、コメントとして隠す方法とか (例： `<script type="text/html">`)・・・どうなんでしょうね？

この皮肉が分かりますか？ **ウェブの最も基本的なコンテンツである HTML を読み込むには、かなりの労力が必要なのです！** でも幸運な事に、[Web Components](http://w3c.github.io/webcomponents/explainer/) を使えば、これを楽に実現することができます。

<h2 id="started">Getting started</h2>

[Web Components](http://w3c.github.io/webcomponents/explainer/) の一部である [HTML Imports](http://w3c.github.io/webcomponents/spec/imports/) は、HTML ドキュメントが他の HTML をドキュメントに取り込むための方法です。マークアップに限定されているわけではありません。import は CSS や JavaScript、その他 `.html` が持つことのできるどんなものでも、取り込むことができるのです。import は **関連する HTML/CSS/JavaScript をロードするためのツール** と言い換えることもできます。

<h3 id="basics">基本</h3>

ページに `<link rel="import">` を宣言して、import を使ってみます：

    <head>
      <link rel="import" href="/path/to/imports/stuff.html">
    </head>

import の URL は _インポートロケーション_ と呼ばれます。別のドメインからコンテンツをロードする場合、インポートロケーションは CORS に対応している必要があります：

    <!-- Resources on other origins must be CORS-enabled. -->
    <link rel="import" href="http://example.com/elements.html">

<p class="notice fact">ブラウザのネットワークスタックは、自動的に同じ URL へのリクエストを省略します。同じ URL への参照は、一度しか読み込まれません。何度同じロケーションをインポートしようとしても、一度しか実行されません。</p>

<h3 id="featuredetect">機能検知とサポート</h3>

サポート状況を検知するには、`<link>` 要素に `.import` があるかをチェックします：

    function supportsImports() {
      return 'import' in document.createElement('link');
    }

    if (supportsImports()) {
      // Good to go!
    } else {
      // Use other libraries/require systems to load files.
    }

ブラウザのサポート状況はまだ初期の段階にあります。Chrome 31 が HTML Imports を最初に実装したブラウザで、Chrome 36 では最新の仕様に対応しました。Chrome Canary の `about:flags` で **Enable experimental Web Platform features** をオンにすることで利用可能です。他のブラウザについては [Polymer の polyfill](http://www.polymer-project.org/platform/html-imports.html) が利用可能です。

<p class="notice tip"><b>Enable experimental Web Platform features</b> では、他の Web Components の機能も利用可能になります。</p>

<h3 id="bundling">リソースのバンドリング</h3>

HTML Imports は HTML/CSS/JavaScript (他の import も含め) のバンドリングを可能にします。これは基本的な機能ですが、とてもパワフルです。テーマやライブラリを作りたい場合だけでなく、アプリケーションを論理的に分割したい場合に、ひとつの URL だけで済ませられるというだけでも価値がある機能です。場合によっては、アプリそのものを import で提供するなんてことも可能です。ちょっと考えてみてください。

<blockquote class="commentary talkinghead">ひとつの URL で済ませることは、第三者が再利用可能なリソースを、ひとつのパッケージにまとめることができるということです。</blockquote>

実際に利用可能な例として [Bootstrap](http://getbootstrap.com/) が挙げられます。Bootstrap は複数のファイル (bootstrap.css, bootstrap.js, fonts) から成り立ちます。プラグインは jQuery に依存性があり、マークアップ例も提供されています。開発者には、フレームワークの中から必要に応じて機能を選択する柔軟性をもたらします。典型的な開発者の多くが、このやり方で Bootstrap すべてをダウンロードするやり方を選択する方に賭けてもいいくらいです。

HTML Imports は Bootstrap のようなもので特に威力を発揮します。将来的に、Bootstrap のロードはこんな感じになるでしょう：

    <head>
      <link rel="import" href="bootstrap.html">
    </head>

ユーザーは HTML Import の link をロードするのみ。複数に分割されたファイルを読み込む必要はありません。Bootstrap 全体が bootstrap.html として import にまとめられます：

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

これでよしとしましょう。素敵じゃないですか。

<h3 id="events">ロード/エラーイベント</h3>

`<link>` 要素は ロードが成功すると `load` イベントを、失敗すると (例：リソースが 404 など) `onerror` イベントを発火します。

import は即座にロードを試みます。面倒なことは `onload` や `onerror` 属性を使うことで避けられます：

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

<p class="notice tip">イベントハンドラーがページ内で、 import のロードより先に定義されていることに注意して下さい。import は、ブラウザがタグを発見し次第ロードされます。関数がまだ存在していないと、undefined な関数名であるとコンソールエラーを吐き出します。</p>

動的に import を作った場合はこうします：

    var link = document.createElement('link');
    link.rel = 'import';
    link.href = 'file.html'
    link.onload = function(e) {...};
    link.onerror = function(e) {...};
    document.head.appendChild(link);

<h2 id="usingcontent">コンテンツを使う</h2>

ページに import を含めるだけでは、「ここにファイルの中身を置け」という意味にはなりません。「このドキュメントが使えるように取ってきてくれ」と解釈されます。ファイルの中身を実際に使うには、スクリプトを書く必要があります。

重要なアハ体験は、import の中身がドキュメントに過ぎないことに気付いた時です。インポートされたコンテンツは *インポートドキュメント* と呼ばれ、**標準的な DOM API を使って操作することができます。**

<h3 id="importprop">link.import</h3>

インポートされたコンテンツにアクセスするには、link 要素の `.import` プロパティを使います：

    var content = document.querySelector('link[rel="import"]').import;

`link.import` は下記の条件において `null` となります：

- ブラウザが HTML Imports をサポートしない
- `<link>` が `rel="import"` を持たない
- `<link>` が DOM に追加されていない
- `<link>` が DOM から取り除かれている
- リソースが CORS に対応していない

**例**

`warnings.html` の内容が下記の場合を考えてみます：

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

import はドキュメントの特定箇所をページにクローンすることができます：

    <head>
      <link rel="import" href="warnings.html">
    </head>
    <body>
      ...
      <script>
        var link = document.querySelector('link[rel="import"]');
        var content = link.import;

        // warning.html のドキュメントから DOM を取得
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

<h3 id="includejs">import でスクリプトを扱う</h3>

import の中身はメインドキュメントにありません。別の場所に存在します。しかし、メインドキュメントが中心の状況であっても、import の中身をメインページとして扱うことは可能です。import 内にあるスクリプトは、それ自体の DOM、もしくはそれを読み込み元ページの DOM にアクセスすることができます：

**例** - import.html が、自身の持つスタイルシートをメインページに追加します

    <link rel="stylesheet" href="http://www.example.com/styles.css">
    <link rel="stylesheet" href="http://www.example.com/styles2.css">
    ...

    <script>
      // importDoc はこの import のドキュメントを参照
      var importDoc = document.currentScript.ownerDocument;

      // mainDoc はメインドキュメントを参照 (これをインポートしているページ)
      var mainDoc = document;

      // この import から最初のスタイルシートを取り込み、クローン
      // そしてインポートしているドキュメントに追加
      var styles = importDoc.querySelector('link[rel="stylesheet"]');
      mainDoc.head.appendChild(styles.cloneNode(true));
    </script>

何が起こっているのか見てみましょう。import 内のスクリプトが 自分自身を参照 (`document.currentScript.ownerDocument`) し、ドキュメントの一部をインポートしたページ (`mainDoc.head.appendChild(...)`) に追加します。ちょっと気持ち悪いですね。

<blockquote class="commentary talkinghead">import 内のスクリプトは、直接コードを実行するか、インポート元ページに定義させることができます。これは Python における <a href="http://docs.python.org/2/tutorial/modules.html#more-on-modules">module</a> の定義方法に似ています。
</blockquote>

import 内の JavaScript のルール：

- import 内のスクリプトはインポート元となる `document` を含むウィンドウのコンテキスト上で実行されます。そのため、`window.document` はメインページのドキュメントを意味します。このことから 2 つのことが推測されます：
    - import 内のスクリプトで定義された関数は `window` にぶら下がります。
    - import 内の `<script>` ブロックをメインページに追加する必要ありません。スクリプトが再度実行されてしまいます。
- import は、メインページのパースをブロックしません。しかし、import ページ内の script は順番に実行されます。script の順序を守ってくれる反面、defer のような挙動をします。下記でより詳しく説明します。

<h2 id="deliver-webcomponents">Web Components を取り込む</h2>

HTML Imports のデザインは、再利用可能なコンテンツをウェブにロードできるように作られています。特に、Web Components にとって、基本的な [HTML `<template>`](/webcomponents/template/) から、完全な [Custom Elements](/tutorials/webcomponents/customelements/#registering) と Shadow DOM [[1](/tutorials/webcomponents/shadowdom/), [2](/tutorials/webcomponents/shadowdom-201/), [3](/tutorials/webcomponents/shadowdom-301/)] までカバーできる、理想的な作りです。これらのテクノロジーをセットで使うことで、import は Web Components の [`#include`](http://en.cppreference.com/w/cpp/preprocessor/include) のような役割を果たします。

<h3 id="include-templates">template を取り込む</h3>

[HTML Template](/tutorials/webcomponents/template/) 要素は、HTML Imports と相性バツグンです。`<template>` はマークアップの切れ端をテンプレートとして利用するのに適していますが、コンテンツを `<template>` に内包することで、実際に利用されるまで自律的に動作しないようにできるというメリットもあります。スクリプトは、template が DOM に追加されるまで、実行されません。

import.html

    <template>
      <h1>Hello World!</h1>
      <!-- <template> が実際に使われるまで img はリクエストされない -->
      <img src="world.png">
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

        // import で <template> をクローンする
        var template = link.import.querySelector('template');
        var clone = document.importNode(template.content, true);

        document.querySelector('#container').appendChild(clone);
      </script>
    </body>

<h3 id="include-elements">Custom Elements を登録する</h3>

[Custom Elements](tutorials/webcomponents/customelements/) もまた、HTML Imports と相性バツグンの Web Components テクノロジーです。[Imports はスクリプトを実行できる](#includejs) のですから、ユーザーではなく、コンポーネントの作者であるあなたが Custom Elements を定義し、登録してしまいましょう。

elements.html

    <script>
      // <say-hi> を定義し、登録する
      var proto = Object.create(HTMLElement.prototype);

      proto.createdCallback = function() {
        this.innerHTML = 'Hello, <b>' +
                         (this.getAttribute('name') || '?') + '</b>';
      };

      document.registerElement('say-hi', {prototype: proto});

      // Shadow DOM を利用する <shdow-element> を定義し、登録する
      var proto2 = Object.create(HTMLElement.prototype);

      proto2.createdCallback = function() {
        var root = this.createShadowRoot();
        root.innerHTML = "<style>::content > *{color: red}</style>" +
                         "I'm a " + this.localName +
                         " using Shadow DOM!<content></content>";
      };
      document.registerElement('shadow-element', {prototype: proto2});
    </script>

この import では、`<say-hi>` と `<shadow-element>` という 2 つの要素を定義 (そして登録) しています。インポート元ドキュメントは宣言するだけで大丈夫。

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

このワークフローだけでも、HTML Imports は Web Components を共有する最適なソリューションであると言えると思います。

<h3 id="depssubimports">依存性の管理とサブインポート</h3>

<blockquote>
  import が気に入ったようなので、あなたの import <em>の中に</em> さらに import を入れてみました。
</blockquote>

<h4 id="sub-imports">サブインポート</h4>

ひとつの import が他の import を持てると便利なケースが有ります。例えば、他のコンポーネントを再利用したい場合、その要素をロードするのにも import が使えます。

以下は、[Polymer](http://polymer-project.org) で実際に使われている例です。レイアウトとセレクターコンポーネントを再利用した、新しいタブコンポーネントです。依存性は HTML Imports で管理されています。

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

[ソースコード全体](https://github.com/Polymer/polymer-ui-elements/blob/master/polymer-ui-tabs/polymer-ui-tabs.html)

アプリ開発者は、この新しい要素を下記のようにして import できます：

    <link rel="import" href="polymer-ui-tabs.html">
    <polymer-ui-tabs></polymer-ui-tabs>

将来的にもっと新しくてかっこいい `<polymer-selector2>` 要素が登場した際、`<polymer-selector>` と差し替えて、すぐに使い始めることができます。HTML Imports と Web Components のおかげで、ユーザーに迷惑をかけることはありません。

<h4 id="deps">依存性の管理</h4>

jQuery を同じページで何度も呼び出すと、エラーが発生するのはみなさんご存知と思います。複数のコンポーネントが同じライブラリを呼び出すとしたら、Web Components にとって _とても大きな_ 問題になると思いませんか？ HTML Imports なら心配ありません。依存性の管理にも役立ちます。

HTML Imports にライブラリを内包することで、リソースは自動的に重複を避けられます。
ドキュメントは一度だけパースされ、スクリプトも一度だけ実行されます。jQuery のコピーを読み込む jquery.html を呼び出す import を定義した場合を例に見てみましょう。

jquery.html

    <script src="http://cdn.com/jquery.js"></script>

この import は後で再利用できます：

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

      document.registerElement('ajax-element', {prototype: proto});
    </script>

メインページでさえ、必要なら jquery.html を呼び出して構いません。

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

jquery.html が複数の import で宣言されているにも関わらず、ドキュメントはブラウザによって一度しか読み込まれません。Network パネルで検証してみれば一目瞭然です：

<figure>
  <img src="requests-devtools.png">
  <figcaption>jquery.html が必要とされるのは一度だけ</figcpation>
</figure>

<h2 id="performance">パフォーマンスに関する考察</h2>

HTML Imports は大変素晴らしいものですが、他の新しいウェブテクノロジー同様、賢く使うべきです。ウェブ開発のベストプラクティスは変わりません。いくつか覚えておくべきことをまとめました。

<h3 id="perf-concat">import を連結する</h3>

ネットワークリクエストを減らすことは常に重要です。もし複数の import リンクがあるなら、ひとつのリソースにまとめましょう。

[Vulcanize](https://github.com/Polymer/vulcanize) は [Polymer](http://www.polymer-project.org/) チームの開発した npm のビルドツールで、複数の HTML Imports ファイルを再帰的にひとつにまとめます。Web Components のビルドステップのひとつと考えて下さい。

<h3 id="perf-caching">Import はブラウザキャッシュが効く</h3>

多くの人は、ブラウザのネットワークスタックが長年をかけてチューニングされてきたことを忘れがちです。Import (とサブインポート) はこの利点を活かすことができます。`http://cdn.com/bootstrap.html` import にはサブリソースが含まれるかもしれませんが、キャッシュされるはずです。

<h3 id="perf-inert">コンテンツは追加した場合のみ有効</h3>

コンテンツは実際に使われるまで自律的に動作しないと考えて下さい。動的に読み込まれた通常のスタイルシートを思い浮かべて下さい：

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'styles.css';

ブラウザは `link` が DOM に追加されるまで、style.css をリクエストしません：

    document.head.appendChild(link); // browser requests styles.css

動的に作られたマークアップであれば：

    var h2 = document.createElement('h2');
    h2.textContent = 'Booyah!';

`h2` は DOM に追加されるまで、意味を持ちません。

このコンセプトは import ドキュメントについても当てはまります。DOM に追加するまで、コンテンツは有効ではありません。実のところ、import ドキュメントで直接実行されるのは `<script>` タグだけです。詳しくは [imports でスクリプトを扱う](#includejs) をご覧ください。

<h3 id="perf-parsing">非同期ロードに最適化する</h3>

**import はメインページのパースをブロックしません** 。import 内のスクリプトは順番に実行されますが、インポート元ページはブロックされません。script の順序を守ってくれる反面、defer のような挙動をします。import を `<head>` タグに入れる利点の一つは、パーサーができるだけ早くその内容を扱えるためです。メインドキュメントの `<script>` がページをブロックすることに変わりないことは覚えておいて下さい：

    <head>
      <link rel="import" href="/path/to/import_that_takes_5secs.html">
      <script>console.log('I block page rendering');</script>
    </head>

アプリの構造とユースケースによって、非同期の挙動を最適化する方法はいくつかあります。メインページでのブロックを防ぐには、下記のテクニックをお試し下さい。

**シナリオ #1 (推奨)：`<head>` にも `<body>` にも script が含まれないケース**

`<script>` の配置について私のオススメは、import の直後は避けた方がいい、というものです。script タグは、できるだけページの最後に置きましょう・・・・でももうやってますよね？ ;)

例：

    <head>
      <link rel="import" href="/path/to/import.html">
      <link rel="import" href="/path/to/import2.html">
      <!-- script は避ける -->
    </head>
    <body>
      <!-- script は避ける -->

      <div id="container"></div>

      <!-- script は避ける -->
      ...

      <script>
        // その他のスクリプト等

        // import コンテンツを取り込む
        var link = document.querySelector('link[rel="import"]');
        var post = link.import.querySelector('#blog-post');

        var container = document.querySelector('#container');
        container.appendChild(post.cloneNode(true));
      </script>
    </body>

全て、一番下に置いています。

**シナリオ #1.5：import が自ら追加するケース**

もうひとつの方法は、import で [自分自身のコンテンツを追加する](#includejs) 方法です。import 作者の必要とする条件に対応できれば、import はメインページの一部に自身を追加することができます：

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
      <!-- script は不要。import がすべて面倒を見てくれます。 -->
    </body>

**シナリオ #2：`<head>` か `<body>` に script が含まれるケース**

ロードに時間を要する import が含まれる場合、import に続く `<script>` はブロックされてしまいます。例えば Google Analytics は、`<head>` 内にトラッキングコードを置くことを推奨しています。`<script>` を `<head>` 内に置かざるを得ない場合は、import を動的に追加することで、ブロックさせないようにすることもできます。

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

        addImportLink('/path/to/import.html'); // Import is added early :)
      </script>
      <script>
        // other scripts
      </script>
    </head>
    <body>
       <div id="container"></div>
       ...
    </body>

もうひとつのアプローチは、import を `<body>` の終わり近くに置く方法です：

    <head>
      <script>
        // other scripts
      </script>
    </head>
    <body>
      <div id="container"></div>
      ...

      <script>
        function addImportLink(url) { ... }

        addImportLink('/path/to/import.html'); // import が追加されるのは一番最後 :(
      </script>
    </body>

<p class="notice"><b>注意：</b> 最後のアプローチはあまりオススメできません。ページの終わりに到達するまで、パーサーはインポートを始めません。</p>

<h2 id="tips">覚えておくべきこと</h2>

- import の mimetype は `text/html` です。

- 他のオリジンに存在するリソースは CORS に対応している必要があります。

- 同じ URL からの import は、取得もパースも一度しか行われません。これは import 内の script は、読み込まれた最初の一度しか実行されないことを意味します。

- import 内の script は順番に実行されますが、メインドキュメントのパースはブロックしません。

- import リンクは「コンテンツをここに #include せよ」という意味ではありません。「このドキュメントが使えるように取ってきてくれ」と解釈されます。スクリプトは import が読み込まれると同時に実行されますが、スタイルシートやマークアップなどのリソースは、明示的にメインページに追加されなければなりません。これは HTML Imports と `<iframe>` (コンテンツを読み込んでここに表示) の最も大きな違いです。

<h2 id="conclusion">まとめ</h2>

HTML Imports は、HTML/CSS/JavaScript を一つのリソースとしてバンドルさせてくれます。それ自体が便利なのはもちろんですが、とりわけ Web Components の世界では、パワフルといえます。開発者は再利用可能なコンポーネントを作り、 第三者が `<link rel="import">` だけで、自分のアプリに取り込めるようにできるのです。

HTML Imports はシンプルなコンセプトですが、たくさんのユースケースを可能にします。

<h3 id="usecases">ユースケース</h3>

- 関連する [HTML/CSS/JS をひとつのバンドルとして](#bundling) **配布** 理論的には、ウェブアプリを丸々別のウェブアプリにインポートすることも可能です。
- **コードの整理** - コードを論理的に別々のファイルに分け、モジュラー構造と再利用性を促します。
- [Custom Element](/tutorials/webcomponents/customelements/) の定義を **提供** 。import は Custom Elements を [登録](/tutorials/webcomponents/customelements/#registering) し、アプリに取り込むことができます。要素のインターフェースと定義を、実際の使用と切り分けるというソフトウェアパターンを実践することができます。
- [**依存性の管理**](#depssubimports) - リソースは一度しか読み込まれません。
- **スクリプトをまとめる** - import 以前、大きなサイズの JavaScript ライブラリは、動き始める前に全体をパースする必要がありました。import があれば、script A がパースされるとすぐに、ライブラリが動作を始めます。レイテンシーは低くなるはずです。

      `<link rel="import" href="chunks.html">`:

        <script>/* script A */</script>
        <script>/* script B */</script>
        <script>/* script C */</script>
        ...

- **HTML のパースを並行に** - ブラウザ史上はじめて、HTML パーサーが 2 つ以上同時に動きます。

- import の読み込み URL を変更するだけで、アプリ内で **デバッグモードの切り替えを可能にします**。アプリは、import されるドキュメントがバンドルされているリソースか、コンパイルされているリソースか、ツリー構造かなどを知る必要はありません。

