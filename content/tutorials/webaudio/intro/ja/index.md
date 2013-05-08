HTML5の&lt;audio&gt;要素が登場する前、Webの静寂を破るにはFlash等のプラグインが必要でした。
&lt;audio&gt;タグにより、Webで音を出すのにプラグインは必要なくなりましたが、洗練されたゲームや対話型のアプリケーションを実装するには、まだまだ制約が多いのが現状です。

Web Audio APIは音声を処理・合成するためのWebアプリケーション向けのハイレベルなJavaScript APIです。
このAPIの目指すところは、今日のゲームのオーディオエンジンが備えている機能や、DAWに見られるようなミキシング、編集、フィルタリング等の機能を実現することです。
以降の章では、入門編として、このパワフルなAPIをわかりやすく解説したいと思います。

<h2 id="toc-context">AudioContext</h2>

[AudioContext][]はすべての音声の再生を管理します。
Web Audio APIを使って音を出すには、ひとつ以上のサウンドソースを作成し、`AudioContext`インスタンスが提供するサウンドデスティネーションに接続します。
ここで直接接続することも可能ですが、中間に音声信号を処理するためのモジュールとして機能する[AudioNodes][]をいくつでもはさむことができます。
この[ルーティング][routing]の仕組みは、Web Audio の[仕様][spec]において、さらに詳細に説明されています。

ひとつの`AudioContext`インスタンスで、複数の音声入力と複雑なオーディオグラフに対応できるので、オーディオアプリケーションを開発する際には、通常ひとつのインスタンスしか必要ありません。

以下は`AudioContext`を作成するコードです。

    var context;
    window.addEventListener('load', init, false);
    function init() {
      try {
        context = new webkitAudioContext();
      }
      catch(e) {
        alert('Web Audio API is not supported in this browser');
      }
    }

WebKitベースのブラウザでは、`webkitAudioContext`のように`webkit`プリフィックスをつけてください。

AudioNodeの作成や、音声データのデコード等、Web Audio APIの主要な機能は`AudioContext`のメソッドとして提供されています。

[AudioContext]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioContext-section
[AudioNodes]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioNode-section
[routing]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#ModularRouting-section
[spec]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html

<h2 id="toc-load">音をロードする</h2>

Web Audio APIで、小〜中規模のファイルを扱うには、AudioBufferを使用します。
基本的なアプローチとして、サウンドファイルの取得には、[XMLHttpRequest][xhr]を使います。

WAV, MP3, AAC, OGGおよび[その他複数][formats]のフォーマットの音声ファイルがサポートされています。
なお、ブラウザごとにサポートする音声フォーマットは[異なります][formats2]。

以下のコードでは、音声サンプルをロードしています。

    var dogBarkingBuffer = null;
    var context = new webkitAudioContext();

    function loadDogSound(url) {
      var request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      // Decode asynchronously
      request.onload = function() {
        context.decodeAudioData(request.response, function(buffer) {
          dogBarkingBuffer = buffer;
        }, onError);
      }
      request.send();
    }

音声ファイルはバイナリデータ(非テキスト)なので、上記の例では`responseType`に`'arraybuffer'`を指定しています。
`ArrayBuffer`に関しては、こちらの[XHR2関連の記事][xhr2]をご覧ください。

受信した(未デコードの)オーディオデータは、いったん保持されて後でデコードされるか、もしくはAudioContextの`decodeAudioData()`メソッドを使ってすぐにデコードされます。
このメソッドは`request.response`に格納されている音声ファイルの`ArrayBuffer`を引数として受け取り、非同期でデコードします。
(つまり、JavaScriptのメイン実行スレッドをブロックしません。)

`decodeAudioData()`の処理が完了した際に、コールバック関数が呼ばれ、デコード済みのPCM音声データが`AudioBuffer`として渡されます。

<h2 id="toc-play">音を再生する</h2>

<figure>
<img src="diagrams/simple.png"/>
<figcaption>単純なオーディオグラフ</figcaption>
</figure>

`AudioBuffer`がロードされたので、これで音の再生の準備が整いました。
例えば、犬の鳴き声の音声データのロードが完了して、`AudioBuffer`を取得したとしましょう。
以下のコードで、音声データを再生することができます。

    var context = new webkitAudioContext();

    function playSound(buffer) {
      var source = context.createBufferSource(); // creates a sound source
      source.buffer = buffer;                    // tell the source which sound to play
      source.connect(context.destination);       // connect the source to the context's destination (the speakers)
      source.noteOn(0);                          // play the source now
    }

この`playSound()`関数はユーザーのキー押下やマウスクリックに反応して呼び出されることを想定しています。

`noteOn(time)`関数は正確なタイミングでの音声の再生を可能にするので、ゲームや、その他リアルタイム性が求められるアプリケーションに向いています。
しかしながら、正確なスケジューリングのためには、音声のバッファがすでにロードされている必要があります。

[xhr]: https://developer.mozilla.org/En/XMLHttpRequest/Using_XMLHttpRequest
[xhr2]: http://www.html5rocks.com/en/tutorials/file/xhr2/
[formats]: http://en.wikipedia.org/wiki/Audio_file_format
[formats2]: https://developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements#Browser_compatibility

<h2 id="toc-abstract">Web Audio APIの抽象化</h2>

多くの場合、特定の音声データをロードするコードをハードコーディングするのは望ましくありません。
オーディオアプリケーションやゲーム向けの、小〜中規模の音声データを扱うためのアプローチはたくさんありますが、
ここでは[BufferLoaderクラス][BufferLoader]を使ったやり方を紹介します。

以下は`BufferLoader`クラスの使用例です。ここではロードが完了してすぐに、２つの`AudioBuffer`を作成し、同時にそれらを再生しています。


    window.onload = init;
    var context;
    var bufferLoader;

    function init() {
      context = new webkitAudioContext();

      bufferLoader = new BufferLoader(
        context,
        [
          '../sounds/hyper-reality/br-jam-loop.wav',
          '../sounds/hyper-reality/laughter.wav',
        ],
        finishedLoading
        );

      bufferLoader.load();
    }

    function finishedLoading(bufferList) {
      // Create two sources and play them both together.
      var source1 = context.createBufferSource();
      var source2 = context.createBufferSource();
      source1.buffer = bufferList[0];
      source2.buffer = bufferList[1];

      source1.connect(context.destination);
      source2.connect(context.destination);
      source1.noteOn(0);
      source2.noteOn(0);
    }

[BufferLoader]: js/buffer-loader.js

<h2 id="toc-abstract">時間の管理: リズムに同期して音を再生する</h2>

Web Audio APIにより、開発者は正確に再生をスケジュールすることができます。
これを実証すべく、簡単なリズムトラックを用意しました。
以下は、おそらく最も有名なドラムのパターンです：

<figure>
<img src="diagrams/drum.png"/>
<figcaption>単純なロックドラムパターン</figcaption>
</figure>

ここでは、4分の4拍子で、ハイハットが8分音符ごとに、バスドラとスネアが交互に4分音符ごとに演奏されています。

`kick`, `snare`, `hihat`がすでにバッファにロードされているとして、音を鳴らすコードは以下のようになります。

    for (var bar = 0; bar < 2; bar++) {
      var time = startTime + bar * 8 * eighthNoteTime;
      // Play the bass (kick) drum on beats 1, 5
      playSound(kick, time);
      playSound(kick, time + 4 * eighthNoteTime);

      // Play the snare drum on beats 3, 7
      playSound(snare, time + 2 * eighthNoteTime);
      playSound(snare, time + 6 * eighthNoteTime);

      // Play the hi-hat every eighth note.
      for (var i = 0; i < 8; ++i) {
        playSound(hihat, time + i * eighthNoteTime);
      }
    }

楽譜では無限にリピートするように書かれていますが、コードでは１回しか繰り返していません。
`playSound`は指定されたバッファを指定された時刻に再生する関数で、以下のようになります。


    function playSound(buffer, time) {
      var source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.noteOn(time);
    }


<input type="button" onclick="RhythmSample.play();" value="Play"/>

[ソースコード](js/rhythm-sample.js)

<h2 id="toc-volume">ボリュームを変更する</h2>

音に対する操作で、真っ先に思い浮かぶのは、ボリュームの変更でしょう。
Web Audio APIを使って音量を変更するには、ソースを[AudioGainNode][]経由でデスティネーションに接続します。

<figure>
<img src="diagrams/gain.png"/>
<figcaption>Gainノードを含むオーディオグラフ</figcaption>
</figure>

対応するコードは以下のようになります。

    // Create a gain node.
    var gainNode = context.createGainNode();
    // Connect the source to the gain node.
    source.connect(gainNode);
    // Connect the gain node to the destination.
    gainNode.connect(context.destination);

ひとたびグラフが構成されると、`gainNode.gain.value`を以下のように変更することで、ボリュームを変更することができます。

    // Reduce the volume.
    gainNode.gain.value = 0.5;

以下のコードは、`<input type="range">`要素を使って実装されたボリュームコントロールのデモです。 

<input type="button" onclick="VolumeSample.toggle();" value="Play/Pause"/>
Volume: <input type="range" min="0" max="100" value="100" onchange="VolumeSample.changeVolume(this);" />

[ソースコード](js/volume-sample.js)

<h2 id="toc-xfade">２つの音声間のクロスフェード</h2>

ここで、少し複雑なシナリオを考えてみましょう。
つまり、複数のサウンドを交互に切り替えて再生しなくてはならないとします。
これはDJ系のアプリケーションではよくあることで、例えば２つのターンテーブルの一方の音楽から他方へとパンします。

これは、以下のオーディオグラフにより、実現可能です。

<figure>
<img src="diagrams/crossfade.png"/>
<figcaption>Gainノード経由で接続された２つのソース</figcaption>
</figure>

以下の関数を使い、単純に２つの[AudioGainNode][AudioGainNode]を作成し、ソースに接続します。

    function createSource(buffer) {
      var source = context.createBufferSource();
      // Create a gain node.
      var gainNode = context.createGainNode();
      source.buffer = buffer;
      // Turn on looping.
      source.loop = true;
      // Connect source to gain.
      source.connect(gainNode);
      // Connect gain to destination.
      gainNode.connect(context.destination);

      return {
        source: source,
        gainNode: gainNode
      };
    }

<h3 id="toc-xfade-ep">等パワー曲線によるクロスフェード</h3>

単にリニアにクロスフェードしただけでは、２つの音声間をパンしたときに音量が不自然に変化してしまいます。

<figure>
<img src="diagrams/linear-fade.png"/>
<figcaption>リニアクロスフェード</figcaption>
</figure>

これを解決するために、等パワー曲線を使用します。つまり、２つの音声のゲインの曲線は一定に変化せずに、より高い振幅で交わります。
これにより音量の不自然な減衰は最小限に抑えられ、音量レベルの異なる２つの音声間であっても、均等にクロスフェードすることができます。

<figure>
<img src="diagrams/equal-fade.png"/>
<figcaption>等パワー曲線によるクロスフェード</figcaption>
</figure>

以下のコードは、`<input type="range">`要素を使って実装された２音声間のクロスフェードのデモです。 

<input type="button" onclick="CrossfadeSample.toggle();" value="Play/Pause"/>
Drums <input type="range" min="0" max="100" value="100" onchange="CrossfadeSample.crossfade(this);" /> Organ

[ソースコード](js/crossfade-sample.js)

<h3 id="toc-xfade-play">プレイリストにおけるクロスフェード</h3>

その他のクロスフェードの適用例としては、音楽プレイヤーアプリケーションがあります。
例えば、楽曲が切り替わる際に、継ぎ目を目立たないようにするために、現在のトラックがフェードアウトされ、新しいトラックがフェードインします。
これを実現するためには、クロスフェードが未来に実行されるようにスケジューリングする必要があります。
ここで、スケジューリングにJavaScriptの`setTimeout`を使うことも出来ますが、`setTimeout`では正確なスケジューリングは[できません][jstimer]。
Web Audio APIでは、`AudioGainNode`のGain値のようなパラメータを、未来のある時刻にスケジューリングするには、[AudioParam][]インターフェイスを使います。

プレイリストのトラックを切り替えるには、現在再生されているトラックのGain値が減少するようにスケジューリングするとともに、
次のトラックのGain値が増加するようにスケジューリングします。これらの処理は、現在のトラックの再生が完了する少し前に実行します。

    function playHelper(bufferNow, bufferLater) {
      var playNow = createSource(bufferNow);
      var source = playNow.source;
      var gainNode = playNow.gainNode;
      var duration = bufferNow.duration;
      var currTime = context.currentTime;
      // Fade the playNow track in.
      gainNode.gain.linearRampToValueAtTime(0, currTime);
      gainNode.gain.linearRampToValueAtTime(1, currTime + ctx.FADE_TIME);
      // Play the playNow track.
      source.noteOn(0);
      // At the end of the track, fade it out.
      gainNode.gain.linearRampToValueAtTime(1, currTime + duration-ctx.FADE_TIME);
      gainNode.gain.linearRampToValueAtTime(0, currTime + duration);
      // Schedule a recursive track change with the tracks swapped.
      var recurse = arguments.callee;
      ctx.timer = setTimeout(function() {
        recurse(bufferLater, bufferNow);
      }, (duration - ctx.FADE_TIME) * 1000);
    }

Web Audio APIには、パラメータの値を徐々に変化させるために使える`RampToValue`のメソッド群が用意されています。
`linearRampToValueAtTime` や `exponentialRampToValueAtTime` 等があります。

値の変化のタイミングは上記のlinearやexponential等が標準で用意されていますが、
`setValueCurveAtTime`関数に配列を指定することで、独自のカーブを指定することができます。

以下のデモでは、上記のアプローチを用いて、プレイリスト風のトラック間の自動クロスフェードを実現しています。

<input type="button" onclick="CrossfadePlaylistSample.toggle();" value="Play/Pause"/>

[ソースコード](js/crossfade-playlist-sample.js)

[jstimer]: http://stackoverflow.com/questions/2779154/understanding-javascript-timer-thread-issues
[AudioParam]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioParam-section
[AudioGainNode]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioGainNode-section

<h2 id="toc-filter">音にフィルターを適用する</h2>

<figure>
<img src="diagrams/filter.png"/>
<figcaption><code>BiquadFilterNode</code>を含むオーディオグラフ</figcaption>
</figure>

Web Audio APIを使って、あるオーディオノードから別のノードへパイプすることで複雑なチェーンを構築して、凝ったサウンドエフェクトを実現することができます。

このような用法のひとつの例として、[BiquadFilterNode][]をソースとデスティネーションの間に配置する場合があります。
このオーディオノードを使えば、グラフィックイコライザーが備えるような様々な低レベルのフィルタリングや、さらに複雑なエフェクト、例えば特定の周波数帯域を強調したり、抑えたりといったことが可能です。

以下のフィルターがサポートされています。

* Low pass filter
* High pass filter
* Band pass filter
* Low shelf filter
* High shelf filter
* Peaking filter
* Notch filter
* All pass filter

すべてのフィルターは[Gain値][gain]、周波数、およびクオリティファクタをパラメータとして指定することができます。
Low pass フィルターは低周波数の信号を通し、高周波数の信号を破棄します。指定された周波数の値によりカットオフ周波数が決まり、クオリティファクタにより特性のなだらかさが変化します。
Gain値はLow shelf や Peaking 等の一部のフィルタにのみ影響します。 Low pass フィルターでは使用されません。

では、音声サンプルから低音のみを抽出する、単純な Low pass フィルタを実装してみましょう。

    // Create the filter
    var filter = context.createBiquadFilter();
    // Create the audio graph.
    source.connect(filter);
    filter.connect(context.destination);
    // Create and specify parameters for the low-pass filter.
    filter.type = 0; // Low-pass filter. See BiquadFilterNode docs
    filter.frequency.value = 440; // Set cutoff to 440 HZ
    // Playback the sound.
    source.noteOn(0);

以下のデモでは、同様のテクニックを使ってます。
ここでは、チェックボックスで Low pass フィルターを有効／無効にでき、周波数とクオリティ値をスライダで調整できます。

<input type="button" onclick="FilterSample.toggle();" value="Play/Pause"/>
Filter on: <input type="checkbox" checked="false"
    onchange="FilterSample.toggleFilter(this);"/>
Frequency: <input type="range" min="0" max="1" step="0.01" value="1" onchange="FilterSample.changeFrequency(this);" />
Quality: <input type="range" min="0" max="1" step="0.01" value="0" onchange="FilterSample.changeQuality(this);" />

[ソースコード](js/filter-sample.js)

一般的に、周波数の指定は対数になります。これは、人間の聴覚がそのような原則で作用しているからです。
(例えばピアノ中央の「ラ」の音は440Hz、そのオクターブ上の「ラ」は880Hzといった具合に。)
より詳細に知りたい方は上記のソースコードのリンク先のFilterSample.changeFrequency関数をご覧ください。

最後に、サンプルコードでは、フィルターを接続したり外したりして、AudioContextのグラフを動的に変更していますが、
AudioNodeをグラフから外すには、`node.disconnect(outputNumber)`を呼び出します。
例えば、グラフを、フィルタを通した状態から直接接続された状態に再構成するには、以下のようにします。

    // Disconnect the source and filter.
    source.disconnect(0);
    filter.disconnect(0);
    // Connect the source directly.
    source.connect(context.destination);


[BiquadFilterNode]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#BiquadFilterNode-section
[gain]: http://en.wikipedia.org/wiki/Gain
[qfactor]: http://en.wikipedia.org/wiki/Audio_filter#Self_oscillation

<h2 id="toc-further">参考音源</h2>

この記事では、音声のロードや再生を含む、Web Audio APIの基本を説明しました。
また、Gainノードやフィルターを用いてオーディオグラフを構築し、一般的なサウンドエフェクトを実現するためにオーディオパラメータの値をスケジューリングしました。
この時点で、あなたはすでに、素敵なWebオーディオアプリケーションを作るための準備ができています。

もし着想のヒントが必要でしたら、すでに多くの開発者がWeb Audio APIを使用した[すばらしいサンプル][samples]を作っているので、ぜひ参考にしてください。
以下は私のお気に入りです。

* [AudioJedit][jedit], SoundCloudのパーマリンクを使った、ブラウザ上でサウンド編集するツール
* [ToneCraft][tcraft], 3Dのプロックを積み上げてサウンドを作るシーケンサー
* [Plink][plink], Web Audio と Web Socket を使った、同時参加型音楽作成ゲーム

[samples]: http://chromium.googlecode.com/svn/trunk/samples/audio/samples.html
[plink]: http://labs.dinahmoe.com/plink/
[jedit]: http://audiojedit.herokuapp.com/
[tcraft]: http://labs.dinahmoe.com/ToneCraft/
