{% include "warning.html" %}

<h2 id="toc-intro">Introduzione</h2>

Il concetto di templating non è nuovo nell'ambito dello sviluppo web. Difatti, [linguaggi/engine di templating](http://en.wikipedia.org/wiki/Template_engine_(web)) lato server come Django (Python), ERB/Haml (Ruby) e Smarty (PHP) si vedono in giro da parecchio tempo. Nell'ultimo paio d'anni comunque, si è assistito ad un'esplosione di nuovi framework MVC. Tra di loro sono tutti differenti, sebbene la maggior parte di loro condivida un meccanismo comune per il rendering del layer di presentazione (ovvero la view): i template.

Diciamoci la verità. I template sono fantastici. Chiedete in giro se volete. Anche la sola [definizione](http://www.thefreedictionary.com/template) di template fa sentire coccolati e al sicuro:

> **template** (n) - Un documento o un file con un formato predeterminato, utilizzato come punto di partenza per una determinata applicazione in modo che il formato non debba essere ricreato ogni volta che il file viene adoperato.

"...non deve essere ricreato ogni volta..." Non so voi, ma io adoro evitare lavoro extra. Ma allora, perché le piattaforme web difettano di un supporto nativo per qualcosa cui gli sviluppatori sono chiaramente interessati?

La risposta si trova nella [specifica W3C dei Template HTML][spec-link]. Questa definisce un nuovo elemento `<template>` il quale descrive un approccio standard e DOM-based per il templating lato client. I template consentono di creare frammenti di markup che vengono parsati come HTML e inutilizzati al caricamento della pagina, ma che possono essere istanziati in seguito durante l'esecuzione. Per citare [Rafael Weinstein](https://plus.google.com/111386188573471152118/posts) (uno degli autori della specifica):

> "I template sono un posto in cui infilare un mucchietto di HTML con cui il browser non deve pasticciare... per nessun motivo."


<h3 id="toc-detect">Scoperta della funzionalità</h3>

Per rilevare la funzionalità `<template>`, si crea un relativo elemento del DOM e si controlla che esista la proprietà `.content`:

    function supportsTemplate() {
      return 'content' in document.createElement('template');
    }

    if (supportsTemplate()) {
      // Good to go!
    } else {
      // Use old templating techniques or libraries.
    }

<h2 id="toc-started">Dichiarazione del contenuto template</h2>

L'elemento HTML `<template>` represents a template in your markup. rappresenta un template nel markup. Esso contiene "contenuti template"; in sostanza si tratta di **pezzi inerti di DOM clonabile**. Si pensi ai template come a parti di una struttura che possono essere utilizzati (e riutilizzati) durante l'intero ciclo di vita dell'applicazione.

Per creare un contenuto template, si dichiarano degli elementi di markup e si impacchettano in un elemento `<template>`:

    <template id="mytemplate">
      <img src="" alt="great image">
      <div class="comment"></div>
    </template>

<blockquote class="commentary talkinghead">
Il lettore attento avrà notato che il tag immagine è vuoto. Questa mancanza è del tutto adeguata e intenzionale. Un tag immagine non correttamente formato non genera un codice 404 e non produce errori nella console, perché non viene prelevato al caricamento della pagina. Siamo noi che più avanti nell'esecuzione possiamo generare dinamicamente la URL sorgente, come mostrato nelle <a href="#toc-pillars">fondamenta</a>.
</blockquote>

<h2 id="toc-pillars">Fondamenta</h2>

Includere del contenuto in un`<template>` gode di alcune importanti proprietà.

1. Il **contenuto è effettivamente inerte fin quando non viene attivato**. In poche parole, questo markup è nascosto e non viene renderizzato.

2. Qualsiasi contenuto all'interno di un template non ha effetti collaterali. **Gli script non vengono eseguiti, le immagini non vengono caricate, l'audio non viene riprodotto**,...fin quando il template non viene utilizzato.

3. **Il contenuto non è considerato interno al documento**. Utilizzare `document.getElementById()` o `querySelector()` nella pagina principale non restituirà i nodi interni di un template.

4. I template **possono** essere posizionati ovunque in `<head>`, `<body>`, o `<frameset>` e possono contenere qualsiasi tipo di contenuto in essi consentito. Si consideri che "ovunque" significa che `<template>` può tranquillamente essere usato in posti non consentiti dal parser HTML...tutti tranne i figli dei [content model](http://www.w3.org/TR/html5-diff/#content-model). Un template può inoltre essere posizionato come figlio di `<table>` o `<select>`:

        <table>
        <tr>
          <template id="cells-to-repeat">
            <td>some content</td>
          </template>
        </tr>
        </table>

<h2 id="toc-using">Attivare un template</h2>

Per usare un template, questo deve essere attivato, altrimenti il suo contenuto non sarà mai renderizzato. Il modo più semplice per attivare un template è creare una copia profonda del suo `.content`, utilizzando `cloneNode()`. `.content` è una proprietà in sola lettura cui fa riferimento `DocumentFragment`, contenente le interiora di un template.

    var t = document.querySelector('#mytemplate');
    // Populate the src at runtime.
    t.content.querySelector('img').src = 'logo.png';
    document.body.appendChild(t.content.cloneNode(true));

Dopo aver eliminato un template, il suo contenuto "prende vita". Nell'esempio il contenuto viene clonato, viene eseguita la richiesta per l'immagine, e viene renderizzato il markup complessivo.

<h2 id="toc-using">Demo</h2>

<h3 id="toc-demo-insert">Esempio: Script inerti</h3>

Questo esempio mostra l'inerzia del contenuto di un template. Lo `<script>` viene eseguito solo quando si preme il pulsante, eliminando il template.

    <button onclick="useIt()">Use me</button>
    <div id="container"></div>
    <script>
      function useIt() {
        var content = document.querySelector('template').content;
        // Update something in the template DOM.
        var span = content.querySelector('span');
        span.textContent = parseInt(span.textContent) + 1;
        document.querySelector('#container').appendChild(
            content.cloneNode(true));
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
    document.querySelector('#container').appendChild(content.cloneNode(true));
  }
</script>
</div>

<h3 id="toc-demo-sd">Esempio: Creare un DOM Shadow da un template</h3>

Molte persone includono un [DOM Shadow](/tutorials/webcomponents/shadowdom/) ad un host settando una stringa di markup a `.innerHTML`:

    <div id="host"></div>
    <script>
      var shadow = document.querySelector('#host').webkitCreateShadowRoot();
      shadow.innerHTML = '<span>Host node</span>';
    </script>

Il problema di questo approccio è che tanto più complesso diventa il DOM Shadow, tante più concatenazioni di stringhe devono essere fatte. Non essendo un approccio scalabile, le cose si complicano in fretta e i bambini iniziano a piangere. Questo approccio inoltre rappresenta il modo in cui XSS è nato! `<template>` ci viene a soccorrere.

Qualche volta sarebbe meglio lavorare direttamente sul DOM aggiungendo il contenuto di un template ad una root shadow:

    <template>
    <style>
      @host {
        * {
          background: #f8f8f8;
          padding: 10px;
          -webkit-transition: all 400ms ease-in-out;
          box-sizing: border-box;
          border-radius: 5px;
          width: 450px;
          max-width: 100%;
        }
        *:hover {
          background: #ccc;
        }
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
      var shadow = document.querySelector('#host').webkitCreateShadowRoot();
      shadow.appendChild(document.querySelector('template').content);
    </script>

<template id="demo-sd-template">
<style>
  @host {
    * {
      background: #f8f8f8;
      padding: 10px;
      -webkit-transition: all 400ms ease-in-out;
      box-sizing: border-box;
      border-radius: 5px;
      width: 450px;
      max-width: 100%;
    }
    *:hover {
      background: #ccc;
    }
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
    var shadow = host.webkitCreateShadowRoot();
    shadow.applyAuthorStyles = true;
    shadow.appendChild(document.querySelector('#demo-sd-template').content);
  } else {
    document.querySelector('#unsupportedbrowsersneedscoping').style.display = 'none';
    host.style.display = 'none';
  }
})();
</script>

<h2 id="toc-gotcha">Guai in arrivo</h2>

Riporto alcuni problemi in cui mi sono imbattuto utilizzando `<template>` allo stato brado:

- Se si utilizza [modpagespeed](http://code.google.com/p/modpagespeed/), bisogna fare attenzione a questo [bug](http://code.google.com/p/modpagespeed/issues/detail?id=625). I template che definiscono uno `<style scoped>` inline potrebbero essere spostati in testa grazie alla regola di riscrittura CSS PageSpeed.
- Non c'è modo di "prerenderizzare" un template, il che significa che non è possibile precaricare gli asset, processare i JS, scaricare i CSS iniziali e così via. Questo vale sia per il server che per il client. L'unico momento in cui un template viene renderizzato è quando prende vita.
- Attenzione ai template innestati. Questi non si comportano come ci si potrebbe aspettare. Ad esempio:

        <template>
          <ul>
            <template>
              <li>Stuff</li>
            </template>
          </ul>
        </template>

    L'attivazione del template più esterno non comporta l'attivazione del template interno. Ovvero, i template innestati richiedono che i figli siano attivati manualmente.

<h2 id="toc-old">Verso uno standard</h2>

Non dimentichiamoci da dove veniamo. La strada per un templating HTML standard è di quelle lunghe. Durante gli anni sono stati messi a punto degli espedienti piuttosto ingegnosi per la creazione di template riusabili. Qui in basso ne sono presentati due piuttosto comuni in cui mi sono imbattuto. Li includo in questo articolo come termine di paragone.

<h3 id="toc-offscreen">Metodo 1: DOM Offscreen</h3>

Un approccio che è stato usato per lungo tempo prevede la creazione di un DOM "offscreen" e nasconderlo alla vista usando l'attributo `hidden` o `display:none`.

    <div id="mytemplate" hidden>
      <img src="logo.png">
      <div class="comment"></div>
    </div>

Anche se questa tecnica funziona, essa presenta diversi svantaggi. Riassumendo:

- <label class="good"></label> *Utilizza DOM* - il browser conosce DOM. Con DOM ci sa fare, e si può facilmente clonare.
- <label class="good"></label> *Nulla viene renderizzato* - l'aggiunta di `hidden` evita che il blocco venga visualizzato.
- <label class="bad"></label> *Non inerte* - anche se il contenuto è nascosto, una richiesta viene comunque eseguita per l'immagine.
- <label class="bad"></label> *tili e temi poco agevoli* - una pagina incorporata deve prefissare tutte le sue regole CSS con `#mytemplate` al fine di includere gli stili nel template. Questo è un meccanismo piuttosto fragile e non ci sono garanzie di non generare eventuali collisioni di nomi. Ad esempio, siamo nei guai se la pagina interna ha già un elemento con quell'id.

<h3 id="toc-offscreen">Metodo 2: Overloading degli script</h3>

Un'altra tecnica prevede l'overloading di `<script>` e la manipolazione del suo contenuto come se fosse una stringa. Probabilmente John Resig è stato il primo a mostrare questa tecnica nel 2008 con la sua [utility per Micro Templating](http://ejohn.org/blog/javascript-micro-templating/). Oggi ne esistono diverse altre, compresi alcuni nuovi arrivati come [handlebars.js](http://handlebarsjs.com/).

Ad esempio:

    <script id="mytemplate" type="text/x-handlebars-template">
      <img src="logo.png">
      <div class="comment"></div>
    </script>

The rundown of this technique:

- <label class="good"></label> *Nulla viene renderizzato* - il browser non renderizza questi blocchi perché `<script>` è `display:none` di default.
- <label class="good"></label> *Inerte* - il browser non parsa il contenuto di uno script come JS perché il suo tipo viene impostato come qualcosa di diverso da "text/javascript".
- <label class="bad"></label> *Problemi di sicurezza* - questa tecnica incoraggia l'uso di `.innerHTML`. Il parsing a run-time di dati forniti dall'utente può facilmente portare a vulnerabilità XSS.

<h2 id="toc-conclusion">Conclusione</h2>

Ricordate quando jQuery rese incredibilmente semplice lavorare con i DOM? Il risultato fu che `querySelector()`/`querySelectorAll()` vennero aggiunti alla piattaforma. Una vittoria evidente, no? Una libreria rese popolare il prelevamento di DOM con i selettori CSS e gli standard adottarono quella libreria. Non funziona sempre in questo modo, ma *amo* quando funziona in questo modo.

Penso che `<template>` rappresenti un caso simile. Questo tag standardizza il modo di fare templating lato client, e cosa ancora più importante elimina la necessità dei nostri [folli hack del 2008](#toc-old). Rendere l'intero precesso di sviluppo web più equilibrato, giù gestibile e sempre più ricco di funzionalità è a mio avviso sempre una buona cosa.

<h2 id="toc-resources">Risorse aggiuntive</h2>

- [Specifica W3C][spec-link]
- [Introduzione ai Web Components](https://dvcs.w3.org/hg/webcomponents/raw-file/tip/explainer/index.html#template-section)
- [&lt;web>components&lt;/web>](http://html5-demos.appspot.com/static/webcomponents/index.html) ([video](http://www.youtube.com/watch?v=eJZx9c6YL8k)) - una presentazione davvero completa da parte del sottoscritto.

[spec-link]: https://dvcs.w3.org/hg/webcomponents/raw-file/tip/spec/templates/index.html


