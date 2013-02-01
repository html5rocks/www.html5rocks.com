<h2 id="toc-intro">はじめに</h2>

オーディオはマルチメディア体験を優れたものにする大きな要因となります。
映画をサウンドをOFFにして観ると、そのことに気付かれるでしょう。

ゲームもまた例外ではありません。
わたしの最高のビデオゲームの思い出は音楽とサウンドエフェクトによるものです。
あれから20年近く経つのに、未だに [近藤浩治][kondo]の[『ゼルダの伝説』][zelda]
や  [Matt Uelmen][uelmen] の [Diablo のサウンドトラック][diablo] が頭から離れません。
同様の親しみやすさはサウンドエフェクトにも当てはまります。
例えば、Warcraftのクリック音や、任天堂の古いゲームなどです。

ゲーム・オーディオには独特の難しさがあります。まず、説得力のあるゲーム音楽を作るために、
デザイナーはプレイヤーの置かれた状態に合わせて音を調整する必要があります。
しかしながら、ゲームの状態というのは、ともすれば予測不可能になります。
実際、ゲームの一つのシーンがどれだけの時間続くのか分かりません。
また、室内の音や物体の位置関係など、サウンドは環境と複雑にからみ合っています。
さらに、一度にたくさんの音を鳴らす場面では、すべての音を同時に、
パフォーマンスを損なうこと無く鳴らさなければいけません。

[kondo]: http://ja.wikipedia.org/wiki/近藤浩治
[uelmen]: http://en.wikipedia.org/wiki/Matt_Uelmen
[diablo]: http://www.youtube.com/watch?v=Q2evIg-aYw8
[zelda]: http://www.youtube.com/watch?v=4qJ-xEZhGms

<h2 id="toc-audio">Web におけるゲーム・オーディオ</h2>

シンプルなゲームの場合、HTMLの`<audio>`タグで十分実装できるでしょう。
しかしながら、多くのブラウザにおいて `<audio>` タグは実装が貧弱で、
音が正しく鳴らなかったり、遅延が大きくなったりします。
ブラウザベンダーはこの辺りの実装を熱心に改善している最中なので、これが一時的な問題であることを願います。
ちなみに、[areweplayingyet.org][] は `<audio>` タグの実装状況を確認するのに適したテストスイートです。

`<audio>` タグの仕様を詳しく見てみると、このタグではできないことがたくさんあることに気付くと思います。
そもそもこの仕様はメディア再生のために設計されたものなので、これは特段驚くことではありません。
以下にそれらの制限を挙げてみました：

* 音声信号にフィルターをかけることができない。
* 生のPCMデータにアクセスできない。
* 音源とリスナーの位置や方向の概念がない。
* 精度の高いタイミングを扱えない。

以降の文章では、これらのトピックについて、Web Audio APIを使ったゲーム・オーディオのプログラミング
という文脈で、詳細に解説したいと思います。
ちなみに、APIの簡単なイントロダクションについては[こちら][wa-intro]をご覧ください。

[wa-intro]: http://www.html5rocks.com/en/tutorials/webaudio/intro/
[areweplayingyet.org]: http://areweplayingyet.org/

<h2 id="toc-bg">バックグラウンド・ミュージック</h2>

ゲームはしばしば BGM を繰り返し再生します。例えばこのようなBGMです：

<audio controls loop>
<source src="res/nyan.wav">
</audio>

このようなBGMは、それが短くて予測可能であるほど、とても苛立たしく感じられます。
例えばプレーヤーが、あるエリアやレベルでつまずいてしまっている最中に、同じBGMが繰り返し流れていたとすれば、
落胆しないように徐々に音量を絞ってあげた方がよいかもしれません。また別のアイデアとして、
さまざまな緊張度の音を用意して、それらをゲームの場面によって徐々に音量を絞って切り替えるのも良いかもしれません。

例えば、プレイヤーが壮大なボスバトルのゾーンにいるとして、雰囲気を持った音や、予兆音など、
たくさんの異なった感情を表す音を鳴らすとしましょう。音楽合成ソフトは通常、
尺の等しいトラックを選択して、それらをミックスしてエクスポートする機能を持っています。
そのようにして、異なるトラックを徐々に音量を絞って切り替えることで、ゲームに一貫性を持たせられます。
また、それにより、突拍子もない展開を避けることが出来ます。

![garageband][]

そして Web Audio API を使ってこれらすべてのサンプルをインポートすることができます。
[introductory Web Audio API][wa-intro] で詳細に説明されていますが、
これらは [BufferLoader クラス][bufferloader] を使って XHR 経由で行います。
サウンドのロードは時間がかかるので、ゲームで使用されるアセットは、
ページのロード時やレベルの開始時に、もしくはプレイヤーがゲームをプレイしている最中に
インクリメンタルにロードされるべきです。

次に、各サウンドごとにソースノードを作成し、そして各ソースノードごとにゲインノードを作成して、
それらを接続して以下のようなグラフを作ります：

![background-graph][]

こうすることで、すべてのサウンドを同時に再生して、ループすることができます。
これらのサウンドはすべて再生時間が同じなので、Web Audio API はこれらを同期を取ったまま再生することを保証します。
キャラクターがボスバトルのシーンに近づいたり遠ざかったりするのに合わせて、
該当するノードのゲインを以下のようなアルゴリズムを用いて変更します：

    // Assume gains is an array of AudioGainNode, normVal is the intensity
    // between 0 and 1.
    var value = normVal * (gains.length - 1);
    // First reset gains on all nodes.
    for (var i = 0; i < gains.length; i++) {
      gains[i].gain.value = 0;
    }
    // Decide which two nodes we are currently between, and do an equal
    // power crossfade between them.
    var leftNode = Math.floor(value);
    // Normalize the value between 0 and 1.
    var x = value - leftNode;
    var gain1 = Math.cos(x * 0.5*Math.PI);
    var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
    // Set the two gains accordingly.
    gains[leftNode].gain.value = gain1;
    // Check to make sure that there's a right node.
    if (leftNode < gains.length - 1) {
      // If there is, adjust its gain.
      gains[leftNode + 1].gain.value = gain2;
    }

上記のコードは、２つのソースノードを同時に再生して、両者の間を等パワー曲線
 (詳細は[こちら][wa-intro]) を使って徐々に音量を変更しています。
以下のサンプルでは、Warcraft 2のテーマをベースに、BGMが徐々に緊張感を帯びていく様を体験できます。

<div>
<button id="bg-button">Play/pause</button>
atmospheric
<input id="bg" type="range" value="0" min="0" max="100" style="width: 400px">
boss
</div>

[ソースコード](samples/background-intensity/background.js)

[garageband]: res/garageband.png
[background-graph]: res/background.png
[bufferloader]: http://www.html5rocks.com/en/tutorials/webaudio/intro/js/buffer-loader.js

<h3 id="toc-tag">Audio タグとWeb Audio をリンクさせる</h3>

`<audio>` タグはストリーミングコンテンツの再生に適しているため、
多くのゲーム開発者はBGMの再生に `<audio>` タグを使っていますが、
これらのコンテンツをそのままWeb Audio のコンテキストに接続することができます。

`<audio>` タグはストリーミングコンテンツをすべてダウンロードすること無く、
すぐに再生を開始することができるため、このテクニックは有効です。
また、Web Audio API にストリームを接続することで、ストリームの内容を操作したり解析したりすることができます。
以下の例では、`<audio>` タグで音楽を再生して、ローパスフィルターによりエフェクトをかけています：

    var audioElement = document.querySelector('audio');
    var mediaSourceNode = context.createMediaElementSource(audioElement);
    // Create the filter
    var filter = context.createBiquadFilter();
    // Create the audio graph.
    mediaSourceNode.connect(filter);
    filter.connect(context.destination);

`<audio>` タグとWeb Audio API のインテグレーションについて、さらに深く知りたい方は
[こちら][audiotag]をご覧ください。

[audiotag]: http://updates.html5rocks.com/2012/02/HTML5-audio-and-the-Web-Audio-API-are-BFFs

<h2 id="toc-sfx">サウンド・エフェクト</h2>

ゲームではよく、ユーザーの入力やゲームの状態の変化にあわせてサウンドエフェクトを使用します。
しかしながら、BGMの場合と同様、サウンドエフェクトもまた、ユーザーにとって煩わしいものになりがちです。
そのようなことを避けるためにしばしば使われる手法として、よく似た、しかし異なったサウンドをプールして
使い分けることがあります。簡単な例では足音のサンプル、また、凝った例では
 [Warcraft シリーズ][war-sounds]のキャラクターをクリックしたときの音などがあります。

他にも、ゲームのサウンドエフェクトの特徴として、たくさんの音を同時に鳴らすことが挙げられます。
複数のキャラクターがマシンガンを打ち合っているまっただ中にいると想像してみてください。
それぞれのマシンガンは一秒に何回も弾を発射するので、同時に何十ものサウンドエフェクトを
再生しなければなりません。複数の音源を正確なタイミングで再生することは
 Web Audio API が得意とするところの一つです。

以下の例では、複数の銃声のサンプルを少しずつ時間をずらして再生することで、
マシンガンの銃撃戦を再現しました。

    var time = context.currentTime;
    for (var i = 0; i < rounds; i++) {
      var source = this.makeSource(this.buffers[M4A1]);
      source.noteOn(time + i * interval);
    }

このコードは実際に実行できます：

<button onclick="mgun.shootRound(0, 3, 0.1);">Short burst M4A1</button>
<button onclick="mgun.shootRound(1, 3, 0.1);">Short burst M1 Garand</button><br/>
<button onclick="mgun.shootRound(0, 10, 0.05);">Long burst M4A1</button><br/>

少しうるさかったでしょうか？ 
後の章で、距離の取り方とコンプレッサーの適用について説明します。

ところで、もしゲーム内のすべてのマシンガンの音がまったく同じであれば、非常にたいくつです。
もちろん、それらの音はターゲットとの距離や、相対的な位置により変化させることができます
 (これについては後述します。) が、それでもまだ十分ではありません。
幸運なことに Web Audio API は簡単に音を変化させるための２つの方法を提供してくれます：

1. 銃弾の発射時間を微妙にずらす。
2. playbackRate を調整することで音のピッチを変更し、本物の銃声を再現する。

以下に、これら２つのエフェクトの例を示します：

<button onclick="mgun.shootRound(0, 10, 0.08, 0.05);">Time-randomized M4A1</button>
<button onclick="mgun.shootRound(1, 10, 0.08, 0, 1);">Pitch-randomized Garand</button>

[ソースコード](samples/machine-gun/gun.js)

これらのテクニックの実例をもっと見たい方は[ビリヤード台のデモ][pooltable]をご覧ください。
そこではランダムサンプリングと playbackRate のテクニックを用いて、ビリヤードの玉の衝突音を再現しています。

[pooltable]: http://chromium.googlecode.com/svn/trunk/samples/audio/o3d-webgl-samples/pool.html
[war-sounds]: http://www.youtube.com/watch?v=MXgr6SYYNZM

<h2 id="toc-3d">3D 立体音響</h2>

ゲームにはしばしば、２次元もしくは３次元の幾何学的な空間が設定されていますが、
その場合、オーディオをステレオで立体的に鳴らすことで、ゲームの臨場感を高めることができます。
幸いなことに、Web Audio API を使えば、ハードウェア内蔵のステレオ機能を非常に簡単な方法で利用することができます。
次に紹介するデモはステレオスピーカ (できればヘッドフォン) で聴かなければ意味をなしません。
ここではマウスをキャンパスの上で移動させることで、音源の角度を変えています。

<span id="position-sample" style="border: 1px solid black; display: inline-block;">
</span>

[ソースコード](samples/position/position.js)

上の例では、リスナー (ヒトのアイコン) がキャンバスの中央にいて、
マウスの移動で音源 (スピーカーのアイコン) を動かします。
ここでは、このようなエフェクトを [AudioPannerNode][] を使って実現しています。
基本的なアイデアとして、マウスの移動によって音源の位置を以下のように変えています：

    PositionSample.prototype.changePosition = function(position) {
      // Position coordinates are in normalized canvas coordinates
      // with -0.5 < x, y < 0.5
      if (position) {
        if (!this.isPlaying) {
          this.play();
        }
        var mul = 2;
        var x = position.x / this.size.width;
        var y = -position.y / this.size.height;
        this.panner.setPosition(x * mul, y * mul, -0.5);
      } else {
        this.stop();
      }
    };

以下にWeb Audio で立体音響を扱う際に知っておくべき事項を挙げます：

* リスナーはデフォルトで (0, 0, 0) を起点とします。
* Web Audio の立体音響のAPIは値の単位がありません。私はデモの音が聴こえやすいように値を倍にしています。
* Web Audio の座標は Y が上方向に増加するデカルト座標です。これはほとんどのグラフィックスシステムと逆になるので、上記のコードではY軸を反転させています。

<h3 id="toc-3d-adv">サウンド・コーン</h3>

この立体音響のモデルは [OpenAL][openal] に習って作られており、とてもパワフルで先進的なものです。
さらに詳しく知りたい方は、リンク先の文書の３章と４章をごらんください。

![position-model][]

位置と方向により空間を設定可能にするため、Web Audio のコンテキストには単一の
 [AudioListener][] が割り当てられています。
各ソースノードを AudioPannerNode に接続することで、入力音声を立体化することができます。
AudioPannerNode は位置と方向以外にも、距離および方向モデルを値として持つことができます。

距離モデルとは、音源の近さとゲインの関係を示したものです。
一方、方向モデルとは内部コーンと外部コーンを規定することで設定します。
つまり、リスナーが内部コーン、外部コーン、その中間、のいずれの空間に位置するかによって、
ゲイン (通常、負の値) が決まります。

    var panner = context.createPanner();
    panner.coneOuterGain = 0.5;
    panner.coneOuterAngle = 180;
    panner.coneInnerAngle = 0;

ここでの例は２次元ですが、このモデルは容易に３次元に一般化できます。
3Dの立体音響のデモは[こちら][3d-sample]をご覧ください。
また、Web Audio のサウンドモデルは、位置に加えて速度を与えることで、ドップラー効果を作り出すことも出来ます。
ドップラー効果のデモは[こちら][doppler]をご覧ください。

この章のトピックに関して、さらに詳しいチュートリアル
 ( [mixing positional audio and WebGL][webgl] ) がありますのでぜひお読みください。

[AudioPannerNode]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioPannerNode-section
[AudioListener]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioListener-section
[doppler]: http://chromium.googlecode.com/svn/trunk/samples/audio/doppler.html
[openal]: http://connect.creativelabs.com/openal/Documentation/OpenAL%201.1%20Specification.pdf
[position-model]: res/position-model.png
[webgl]: /tutorials/webaudio/positional_audio/
[3d-sample]: http://chromium.googlecode.com/svn/trunk/samples/audio/simple.html

<h2 id="toc-room">ルーム・エフェクトとフィルター</h2>

実際には音の知覚というものは、その音が聴かれる部屋によって大きく変わります。
同じドアのきしみでも、地下室と大きなオープンホールとではかなり異なった音になります。
それぞれの場面ごとに異なる音のサンプルを用意するには法外なコストがかかり、
さらにゲームのアセットのデータ量も増えるので、
擬似的にこのようなエフェクトを作り出すことで、製品の価値を高めたいとお考えでしょう。

大雑把に言えば、元の音と実際に耳に聴こえる音の差分を、オーディオ用語では[インパルス応答][ir-wiki]と呼びます。
これらのインパルス応答を丹念に録音して、オーディオファイルとして公開している[サイト][ir-google]があります。

ある環境からインパルス応答を生成する方法に関しては、Web Audio API 仕様書の
 [Convolution][convolution] の "Recording Setup" の節をご覧ください。

さて、我々にとって重要なことですが、Web Audio API の提供する [ConvolverNode][] を使えば、
これらのインパルス応答を簡単にサウンドに適用することができます。

    // Make a source node for the sample.
    var source = context.createBufferSource();
    source.buffer = this.buffer;
    // Make a convolver node for the impulse response.
    var convolver = context.createConvolver();
    convolver.buffer = this.impulseResponseBuffer;
    // Connect the graph.
    source.connect(convolver);
    convolver.connect(context.destination);

以下の軍のスピーチのデモでは、様々な異なったインパルス応答を用いて再生しています。

<button onclick="room.playPause();">Play/pause</button>
<input type="radio" name="ir" value="0" class="effect" checked>Telephone</input>
<input type="radio" name="ir" value="1" class="effect">Muffler</input>
<input type="radio" name="ir" value="2" class="effect">Spring feedback</input>
<input type="radio" name="ir" value="3" class="effect">Crazy echo</input>

[ソースコード](samples/room-effects/room-effects.js)

Web Audio API 仕様書のページにある[ルームエフェクトのデモ][effects]もご覧ください。
また、[こちらのデモ][drywet]は Jazz のスタンダードを dry (元の音) と wet (ConvolverNodeでエフェクトをかけた音)
 で聴くことが出来ます。

[convolution]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#Convolution-section
[ConvolverNode]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#ConvolverNode-section
[ir-google]: https://www.google.com/search?q=impulse+responses
[ir-wiki]: http://en.wikipedia.org/wiki/Impulse_response
[effects]: http://chromium.googlecode.com/svn/trunk/samples/audio/convolution-effects.html
[drywet]: http://kevincennis.com/audio/

<h2 id="toc-final">最後の仕上げ</h2>

これでゲームは完成です。立体音響を設定したので、かなりの数の AudioNode のグラフが出来上がりましたが、
あとはこれらを一度に再生するだけです。が、喜ぶのはまだ早いです。 実はもう一点、考慮すべきことがあります。

複数のサウンドを正規化せずに単純に重ねていくと、スピーカーの許容量を超えてしまいます。
画像がキャンバスの境界を超えるのと同様に、サウンドもまた最大値を超えるとクリッピングされてしまい、
明らかに歪んで聞こえます。以下はそのような状態の波形です：

<img src="res/clipping.png" style="width: 100%; max-width: 500px;"/>

以下はクリッピングされた音の実例です。まず、波形はこのようになります：

<img src="res/clipping2.png" style="width: 100%; max-width: 500px;"/>

そして、音はこのようになります：

<audio controls loop>
<source src="res/clipping.mp3">
</audio>

上の例のように耳障りな歪みや、また逆に、リスナーがボリュームを上げないと聞きとれない位の
極度に小さい音は、改善されるべきです。

<h3 id="toc-clip-detect">クリッピングの検出</h3>

技術的な観点から言うと、クリッピングはチャネルの信号が正常値の範囲、すなわち -1 から 1 を超えたときに生じます。
このような状況に陥った場合、視覚的に分かるようにすれば便利です。
それには、以下のように [JavaScriptAudioNode][jsan] をオーディオグラフに接続します：

    // Assume entire sound output is being piped through the mix node.
    var meter = context.createJavaScriptNode(2048, 1, 1);
    meter.onaudioprocess = processAudio;
    mix.connect(meter);
    meter.connect(context.destination);

以下は processAudio ハンドラの実装部です。ここでクリッピングを検出しています：

    function processAudio(e) {
      var buffer = e.inputBuffer.getChannelData(0);

      var isClipping = false;
      // Iterate through buffer to check if any of the |values| exceeds 1.
      for (var i = 0; i < buffer.length; i++) {
        var absValue = Math.abs(buffer[i]);
        if (absValue >= 1) {
          isClipping = true;
          break;
        }
      }
    }

一般的には、`JavaScriptAudioNode` の使用はパフォーマンスに影響するので使いすぎるべきではありません。
代替手段として `RealtimeAnalyserNode` をオーディオグラフに接続して、`requestAnimationFrame` による描画時に
 `getByteFrequencyData` を呼び出して計測する、という方法もあります。
この方法はより効率的ですが、すべての信号をチェックできないので、クリッピングを見逃してしまう可能性があります。
描画はたかだか1秒に60回ですが、音声信号はそれよりもはるかに短いタイミングで変化するからです。

クリッピングの検出は非常に重要なので、将来的に MeterNode というものが
Web Audio API の標準のノードとして追加されるかもしれません。

<h3 id="toc-clip-prevent">クリッピングの抑止</h3>

AudioGainNode でマスターゲインを調整して音圧を抑えることで、クリッピングを防ぐことができます。
ただし、ゲームのサウンドというものは様々な要素によって変化するので、
実際にはマスターのゲイン値だけでクリッピングの有無が決まる訳ではありません。
一般的に、最悪のケースを予想してゲインを調整しなければいけませんが、
これは科学というよりはアートに近いです。

以下のデモでマスターゲインを調整して、どのように聴こえるか実際に試してください。
ゲインを上げすぎるとクリッピングが生じ、また、クリッピングが検出されるとインジケーターが赤くなります。
ちなみに、以下で使用されている楽曲は[光田康典][ct-composer]作曲の『クロノ・トリガー』のトラックを
 Disco Dan が[リミックス][ct-remix]したものです。

<style>
  #meter {width: 36px; height: 36px; display: inline-block; border: 1px solid black;}
  .clip {background: #FF6600;}
  .noclip {background: #00FF66;}
</style>
<button onclick="meter.playPause()">Play/pause</button>
Master gain: <input type="range" min="0" step="0.1" max="10" onchange="meter.gainRangeChanged(this)">
Meter level: <span id="meter"></span>

[ソースコード](samples/metering/metering.js)

<h3 id="toc-sweet">隠し味</h3>

コンプレッサーは音楽やゲームの制作において、信号を均一に整え、
全体の中で突出した部分を抑えるために一般的に使用されています。
Web Audio の世界では、`DynamicsCompressorNode` がこの役割を担います。
DynamicsCompressorNode をオーディオグラフに接続することで、より大きくてリッチで完全なサウンドが得られ、
さらにクリッピングを抑えることが出来ます。以下は仕様書から直接引用した文章です：

> (このノードは) 最も音量の高い部分を抑え、最も音量の低い部分を引き上げる。 (中略) 
>  特に、非常に多くの独立したサウンドが同時に再生されるようなゲームや音楽のアプリケーションでは、
> 信号のレベルを一定に保つことでクリッピングを避けることは重要である。

いつどのような音が鳴るか予測できないゲームのサウンドにおいては、
コンプレッサーを適用することは、通常良い結果を生みます。
DinahMoe labs の [Plink][plink] はこの良い例です。
ここで再生される音は、完全にあなたと他の参加者によって決定されます。
ただし、ある特殊なケースにおいては、コンプレッサーは不要です。
例えば苦労してマスタリングした音源は、すでにベストな状態にチューニングされているので、
コンプレッサーを適用する必要はありません。

コンプレッサーを適用するには、単に DynamicsCompressorNode を
オーディオグラフの最後 (destinationの手前) に追加するだけです。

    // Assume the output is all going through the mix node.
    var compressor = context.createDynamicsCompressor();
    mix.connect(compressor);
    compressor.connect(context.destination);

コンプレッサーの詳細に関しては、こちらの[Wikipediaの記事][dcwp]がとても参考になります。

まとめると、クリッピングが発生していないか注意して、マスターゲインノードを挿入することでそれを回避します。
そして、コンプレッサーノードを使用して、全体の音を引き締めます。
これにより、オーディオグラフは以下のようになります：

<img src="res/final.png" />

[jsan]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#JavaScriptAudioNode-section
[dcn]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#DynamicsCompressorNode-section
[dcwp]: http://ja.wikipedia.org/wiki/コンプレッサー_(音響機器)
[ct-remix]: http://ocremix.org/remix/OCR00883/
[ct-composer]: http://ja.wikipedia.org/wiki/光田康典
[plink]: http://labs.dinahmoe.com/plink

<h2 id="toc-conclusion">おわりに</h2>

以上で Web Audio API を使ったゲームオーディオ開発において、最も重要と思われる事項はすべてカバーできました。
これらのテクニックを使って、本当に優れたオーディオ体験を今すぐブラウザ上で作り出すことができます。
最後に、ブラウザ固有の Tips ですが、タブが後ろに回った際に、[page visibility API][vapi] を使って
必ず音を止めるようにしてください。さもなければユーザーをいらだたせることになるかもしれません。

また、Web Audio に関する追加情報として、入門者向けには [getting started][wa-intro] をご覧ください。
また、質問がある場合は [web audio FAQ][wa-faq] で既に回答されていないか確認してください。
それでもまだ質問がある場合は、 [Stack Overflow][so] で [web-audio][so] のタグを付けて質問してください。

最後になりますが、実際に Web Audio API を使用して作られたすばらしいゲームをいくつか挙げておきます。

* [Field Runners][fieldrunners] およびその[技術的詳細][fieldrunners-bocoup]が書かれた文書。
* [Angry Birds][angrybirds] Web Audio API に移行した。詳細については[こちら][angrybirds-wa]を参照。
* [Skid Racer][skid] 立体音響をうまく使用したゲーム。

[angrybirds]: http://chrome.angrybirds.com
[angrybirds-wa]: http://googlecode.blogspot.com/2012/01/angry-birds-chrome-now-uses-web-audio.html
[fieldrunners]: http://fieldrunnershtml5.appspot.com/
[fieldrunners-bocoup]: http://weblog.bocoup.com/fieldrunners-playing-to-the-strengths-of-html5-audio-and-web-audio/
[wa-faq]: http://updates.html5rocks.com/2012/01/Web-Audio-FAQ
[so]: http://stackoverflow.com/questions/tagged/web-audio
[skid]: https://skid.gamagio.com/play/

[vapi]: http://www.samdutton.com/pageVisibility/

<script src="samples/buffer-loader.js"></script>
<script src="samples/position/position.js"></script>
<script src="samples/machine-gun/gun.js"></script>
<script src="samples/background-intensity/background.js"></script>
<script src="samples/room-effects/room-effects.js"></script>
<script src="samples/metering/metering.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    try {
      context = new webkitAudioContext();
    }
    catch(e) {
      alert("Web Audio API is not supported in this browser");
    }
    position = new PositionSample(
        document.querySelector('#position-sample'),
        context);
    background = new BackgroundIntensity(
        document.querySelector('#bg-button'),
        document.querySelector('#bg'),
        context);
    mgun = new MachineGun(context);
    room = new RoomEffectsSample(
        document.querySelectorAll('input.effect'),
        context);
    meter = new MeteringSample(document.querySelector('#meter'));
  });
</script>
