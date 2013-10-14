{% include "warning.html" %}

<h2 id="toc-intro">소개</h2>

안녕하세요. 웹 앱을 작성하는 누구나 자신의 생산성을 유지하는 것이 얼마나 중요한지 알고 있습니다. 여러분이 제대로된 보일러플레이트를 찾아서 개발 환경을 설치하고 작업 흐름을 시험하고 여러분의 모든 소스들의 최소화 및 압축과 같은 귀찮은 작업을 걱정할 때 도전이 시작합니다.

다행스럽게도 최근의 프론트엔드 도구들은 이러한 일을 대부분 자동화하는 것을 도와줘서 강력한 앱의 작성에만 집중할 수 있게 해줍니다. 이 글은 웹 앱 개발 시 [Web Components](http://html5-demos.appspot.com/static/webcomponents/index.html#1)를 위한 polyfill 및 sugar 라이브러리인 [Polymer](http://polymer-project.org)를 사용하는 앱 생성의 간소화하는 작업흐름 도구인 [Yeoman](http://yeoman.io)을 어떻게 사용하는지 보여줍니다.

<img src="image_0.png" class="screenshot">

<p class="notice"><b>주목:</b> 만약 여러분이 웹 컴포넌트가 처음이라면, 그것들이 제공하는 웹 플랫폼의 기능들에 대한 환상적인 (문서들)[http://www.polymer-project.org/getting-started.html]을 읽어보기를 권합니다. [Custom Element](http://www.polymer-project.org/platform/custom-elements.html), [Shadow DOM](http://www.polymer-project.org/platform/shadow-dom.html), [HTML Imports](http://www.polymer-project.org/platform/html-imports.html) 등을 가능하게 하는 Polymer를 통해 그것들을 어떻게 사용하는지에 대한 가이드입니다.</p>

<h2 id="toc-meet-tools">Yo, Grunt 그리고 Bower를 만나보자</h2>

Yeoman은 여러분의 생산성 향상을 위한 3개의 도구를 가진 모자 쓴 남자입니다.

* [yo](http://yeoman.io)는 프레임워크에 특화된 기반 구조(scaffold)들의 생태계를 제공하는 구조화 도구로 제가 이전에 말한 귀찮은 작업들 중 일부를 수행하는데 사용할 수 있는 생성기를 호출합니다. 

* [grunt](http://gruntjs.com)는 여러분의 프로젝트를 빌드하고 미리 보고 테스트하는데 사용됩니다. 여러분은 Yeoman팀에서 제공하는 태스크들과 [grunt-contrib](https://github.com/gruntjs/grunt-contrib)로부터의 도움에 감사하게 될 겁니다.

* [bower](http://bower.io)는 의존성을 관리하는데 사용됩니다. 따라서 여러분은 더이상 여러분의 스크립트들을 수동으로 다운로드하고 관리하지 않아도 됩니다.

하나 혹은 2개의 명령어를 통해 Yeoman은 여러분의 앱(혹은 모델과 같은 독립적인 코드 조각들)을 위한 보일러플레이트를 작성하고 여러분의 Sass를 컴파일하고 CSS, JS, HTML과 이미지들을 작게 줄이거나 합칠 할 수 있으며 현재 디렉토리에서 간단한 웹서버를 실핼할 수 있도록 합니다. 또한 여러분이 단위 테스트 등을 할 수도 있습니다.

여러분은 [Node Packaged Modules](http://npmjs.org) (npm)으로부터 생성기를 설치할 수 있으며 거기에는 오픈소스 커뮤니티에서 작성한 많은 그리고 현재 사용 가능한 220개 이상의 [생성기](http://yeoman.io/community-generators.html)가 있습니다. 인기있는 생성기에는 [generator-angular](https://github.com/yeoman/generator-angular), [generator-backbone](https://github.com/yeoman/generator-backbone) 그리고 [generator-ember](https://github.com/yeoman/generator-ember)가 있습니다.

<img src="image_1.png" class="screenshot"/>

최근 버전의 [Node.js](http://nodejs.org)가 설치되어 있다면 여러분은 당장 터미널을 열어 다음을 실행하세요.

    $ npm instal -g yo

저것이 전부입니다. 여러분은 이제 Yo, Grunt 그리고 Bower를 설치했고 커맨드라인에서 그것들을 즉시 실행할 수 있습니다. 여기 `yo`의 실행 결과가 있습니다.

<img src="image_2.png" class="screenshot"/>

<p class="notice"><b>주의:</b> 만약 여러분이 백본과 같은 다른 프레임워크를 이용하여 어플리케이션을 완성하고자 할 떄 Yeoman을 어떻게 쓰는지에 대해 읽어보고 싶으시다면, [Yeoman 작업흐름을 이용한 앱 빌드](http://net.tutsplus.com/tutorials/javascript-ajax/building-apps-with-the-yeoman-workflow/)가 흥미로울 것입니다.</p>

<h2 id="toc-polymer-generator">Polymer 생성기</h2>

제가 이전에 이야기한 것과 같이 Polymer는 모던 브라우저들에서 웹 컴포넌트의 사용을 가능하게 하는 polyfill 및 sugar 라이브러리입니다. 이 프로젝트는 개발자들이 미래의 플랫폼을 이용하여 앱을 구축할 수 있도록 해주며 진행 중인 규격이 보다 향상되도록 W3C에 제안을 가능하게 해줍니다.

<img src="image_3.png" class="screenshot"/>

[generator-polymer](https://github.com/yeoman/generator-polymer)는 여러분이 Yeoman을 이용한 Polymer 앱의 기반 구조에 도움을 주는 새로운 생성기로 커맨드라인을 통해 쉽게 Polymer (사용자) 요소를 쉽게 생성하고 사용자화 해주고 그것들을 HTML Imports를 이용하여 추가할 수 있게 해줍니다. 이것은 여러분의 보일러플레이트 코드를 작성하는 시간을 절약해줍니다.

다음 실행을 통해 Polymer의 생성기를 설치해봅시다.

    $ npm install generator-polymer -g

저것이 전부입니다. 이제 여러분의 앱은 웹 컴포넌트의 강력함을 손에 넣었습니다!

새롭게 설치된 우리의 생성기는 여러분이 이용할 수 있는 적은 특정 조각들을 가지고 있습니다.

* `polymer:element`는 새로운 개별 Polymer 요소를 구조화하는데 사용됩니다. `yo polymer:element carousel`가 그 예입니다.

* `polymer:app`는 여러분의 초기 index.html와 프로젝트에 대한 Grunt 태스크들과 빌드 설정을 포함한 Gruntfile.js 그리고 프로젝트에 적합한 폴더 구조와 같은 기반구조를 만드는데 사용됩니다. 또한 여러분의 프로젝트를 위한 Sass Bootstrap을 이용하는 옵션도 제공합니다.

<h2 id="toc-build-app">Polymer 앱을 만들어보자!</h2>

몇몇 사용자 Polymer 요소들과 우리의 새로운 생성기을 사용하여 간단한 블로그를 구축할 것이다.

<img src="image_4.png" class="screenshot"/>

시작을 위해 터미널에서 `mkdir my-new-project && cd $_`를 사용하여 새로운 디렉토리를 생성하고 cd를 통해 않으로 들어가봅시다. 이제 여러분은 다음 실행을 통해 여러분의 Polymer 앱에 시동을 걸 수 있습니다.

    $ yo polymer

<img src="image_5.png" class="screenshot"/>

이것은 Bower를 통해 최신 버전의 Polymer를 가져오고 index.html와 디렉토리 구조, 여러분의 작업 흐름을 위한 Grunt 태스크를 구성합니다. 자, 그럼 준비가 완료될 때까지 커피나 한잔할까요?

좋습니다, 이제 우리는 이렇게 앱의 미리보기를 위해 `grunt server`를 실행할 수 있습니다. :

<img src="image_6.png" class="screenshot"/>

서버는 텍스트 편집기를 작동하여 사용자 요소를 편집하고 저장하면 자동으로 리로드되는 라이브 리로드(LiveReload)를 지원합니다. 이것은 여러분이 만든 앱의 현재 상태의 훌륭한 실시간 화면을 여러분에게 제공합니다.

다음으로, 블로그 포스트에서 설명하고 있는 새로운 Polymer 요소를 생성해봅시다.

    $ yo polymer:element post

<img src="image_7.png" class="screenshot"/>

Yeoman은 생성자를 포함 여부와 `index.html` 내의 기둥(Post) 요소를 포함하기 위해 HTML Import를 사용 여부와 같은 몇가지를 우리에게 질문합니다. 이제 처음 두개 옵션에 '아니오'라고 답하고 세번째 옵션은 공란으로 남겨둡시다.

<p class="notice"><b>주의:</b> 만약 우리가 두번째 질문에 '예'라고 말하면, 생성기는 post.html을 포함하고 그것을 index.html에 포함한다. 또한 &lt;post-element&gt;를 선언하여 페이지 로딩 시에 요소를 렌더링합니다.</p>

    $ yo polymer:element post

    [?] Would you like to include constructor=''? No

    [?] Import to your index.html using HTML imports? No

    [?] Import other elements into this one? (e.g 'another_element.html' or leave blank) 

       create app/elements/post.html

이것은 `/elements` 디렉토리의 post.html에 새로운 Polymer 요소를 생성합니다.

    <polymer-element name="post-element"  attributes="">

      <template>

        <style>
          @host { :scope {display: block;} }
        </style>

        <span>I'm <b>post-element</b>. This is my Shadow DOM.</span>

      </template>

      <script>

        Polymer('post-element', {

          //applyAuthorStyles: true,

          //resetStyleInheritance: true,

          created: function() { },

          enteredView: function() { },

          leftView: function() { },

          attributeChanged: function(attrName, oldVal, newVal) { }

        });

      </script>

    </polymer-element>


포함하고 있는 것은 다음과 같습니다.

* [사용자 요소](http://www.polymer-project.org/platform/custom-elements.html)를 위한 보일러플레이트 코드는 여러분의 페이지 내에 사용자 DOM 엘리먼트 형식을 사용할 수 있도록 해줍니다. (예. &lt;post-element&gt;)

* 클라이언트측 '네이티브' 템플레이팅을 위한 [템플릿 태그](http://www.html5rocks.com/tutorials/webcomponents/template/)과 요소의 스타일을 캡슐화하기 위한 [스코프 스타일](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/)

* 요소의 [등록](http://www.polymer-project.org/polymer.html#element-declaration) 보일러플레이트와 [생명주기 이벤트](http://www.polymer-project.org/polymer.html#lifecyclemethods).


<h3 id="toc-data">실제 데이터 소스로 작업하기</h3>

우리의 블로그는 새로운 포스트를 읽고 쓰기 위한 공간이 필요할 것입니다. 실제 데이터 서비스를 이용한 작업의 시연을 위해, 우리는 [Google Apps Spreadsheets API](https://developers.google.com/google-apps/spreadsheets/)를 이용할 것입니다. 이것은 우리가 Google Docs를 이용하여 생성된 모든 스프레드쉬트의 내용을 읽을 수 있도록 해줄 것입니다.

이것을 설치해보도록 합시다. :

1. 여러분의 브라우저(여기서는 크롬을 추천합니다.)를 열고 [이 Google Docs Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0)를 열어봅시다. 이것은 다음과 같은 필드들을 포함하고 있는 샘플 포스트 데이터입니다. : <ul class="inline-list">
  <li>ID</li>
  <li>제목</li>
  <li>저자</li>
  <li>내용</li>
  <li>날짜</li>
  <li>키워드</li>
  <li>(저자의) 이메일</li>
  <li>(포스트의 슬러그 URL을 위한) 슬러그(Slug)</li>
</ul>

2. **File** 메뉴로 가서 스프레드쉬트의 복사본을 생성하기 위해 **Make a copy**를 선택하세요. 여가삼아 내용을 수정하거나, 포스트를 추가나 삭제는 여러분의 자유입니다.

3. **File** 메뉴로 한번 더 가서 **Publish to the web**을 선택하세요.

4. **start publishing**을 클릭하세요.

5. **발행된 데이터의 링크얻기(Get a link to the published data)**라는 이름으로 마지막 텍스트 상자에서 제공된 URL의 **key** 일부를 복사할 수 있습니다. 그것이 이렇게 생겼습니다. [https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0](https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0)

6. 이어지는 URL의 **your-key-goes-here**(여러분의-키는-여기로-갑니다)에 **key**를 붙여넣으세요. : **[https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=](https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=)**. [https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script](https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script) 같은 것들이 위와 같이 키를 사용하는 예가 될 수 있을 것입니다.

7. 여러분은 여러분의 브라우저에 URL을 붙여넣고 여러분의 블로그 콘텐츠의 JSON 버전을 보기 위해 그것을 파헤쳐볼 수도 있습니다. 만약 URL로 나중에 여러분이 반복적으로 화면에 출력하기 위한 이 데이터의 형식을 리뷰하는데는 아주 약간의 시간만이 걸립니다.

여러분의 브라우저에서 JSON 출력은 약간 무섭게 보이겠지만, 절대 걱정하지 마세요! 우리는 그저 여러분의 포스트에만 관심을 가지고 있습니다.

Google Spreadsheets API는 여러분의 블로그에 있는 각 필드들을 특별한 접두어 <code>post.gsx$</code>를 붙여 출력합니다. 예를 들어 <code>post.gsx$title.$t</code>, <code>post.gsx$author.$t</code>, <code>post.gsx$content.$t</code> 등. 우리가 우리의 JSON 출력에 존재하는 각 "행"을 순회하고자 할 때 각 포스트의 관계된 값을 돌려주는 이 필드들을 참조할 겁니다.


You can now edit your newly scaffolded post element to [bind](http://www.polymer-project.org/docs/polymer/databinding.html) portions of markup to the data in your spreadsheet. To do so, we introduce an attribute `post`, which will read for the post title, author, content and other fields we created earlier. The `selected` attribute (which we will populate later) is used to only show a post if a user navigates to the correct slug for it. 

    <polymer-element name="post-element" attributes="post selected">

      <template>

        <style>
          @host { :scope {display: block;} }
        </style>

          <div class="col-lg-4">

              <template if="[[post.gsx$slug.$t === selected]]">

                <h2>
                  <a href="#[[post.gsx$slug.$t]]">
                    [[post.gsx$title.$t  ]]
                  </a>
                </h2>

                <p>By [[post.gsx$author.$t]]</p>

                <p>[[post.gsx$content.$t]]</p>

                <p>Published on: [[post.gsx$date.$t]]</p>

                <small>Keywords: [[post.gsx$keywords.$t]]</small>

              </template>

            </div>

      </template>

      <script>

        Polymer('post-element', {

          created: function() { },

          enteredView: function() { },

          leftView: function() { },

          attributeChanged: function(attrName, oldVal, newVal) { }

        });

      </script>

    </polymer-element>


Next, let's create a blog element which contains both a collection of posts and the layout for your blog by running `yo polymer:element blog`.

    $ yo polymer:element blog

    [?] Would you like to include constructor=''? No

    [?] Import to your index.html using HTML imports? Yes

    [?] Import other elements into this one? (e.g 'another_element.html' or leave blank) post.html

       create app/elements/blog.html


This time we import the blog into index.html using [HTML imports](http://www.polymer-project.org/platform/html-imports.html) as we would like it to appear in the page. For the third prompt specifically, we specify `post.html` as the element we would like to include.

As before, a new element file is created (blog.html) and added to /elements, this time importing post.html and including <post-element> within the template tag:


    <link rel="import" href="post.html">

    <polymer-element name="blog-element"  attributes="">

      <template>

        <style>
          @host { :scope {display: block;} }
        </style>

        <span>I'm <b>blog-element</b>. This is my Shadow DOM.</span>

            <post-element></post-element>

      </template>

      <script>

        Polymer('blog-element', {

          //applyAuthorStyles: true,

          //resetStyleInheritance: true,

          created: function() { },

          enteredView: function() { },

          leftView: function() { },

          attributeChanged: function(attrName, oldVal, newVal) { }

        });

      </script>

    </polymer-element>


As we asked for the blog element to be imported using [HTML imports](http://www.polymer-project.org/platform/html-imports.html) (a way to include and reuse HTML documents in other HTML documents) to our index, we can also verify that it has been correctly added to the document `<head>`:

    <!doctype html>
        <head>

            <meta charset="utf-8">

            <meta http-equiv="X-UA-Compatible" content="IE=edge">

            <title></title>

            <meta name="description" content="">

            <meta name="viewport" content="width=device-width">

            <link rel="stylesheet" href="styles/main.css">

            <!-- build:js scripts/vendor/modernizr.js -->

            <script src="bower_components/modernizr/modernizr.js"></script>

            <!-- endbuild -->

            <!-- Place your HTML imports here -->

            <link rel="import" href="elements/blog.html">

        </head>

        <body>

            <div class="container">

                <div class="hero-unit" style="width:90%">

                    <blog-element></blog-element>

                </div>

            </div>

          <script>
            document.addEventListener('WebComponentsReady', function() {
                // Perform some behaviour
            });
          </script>

            <!-- build:js scripts/vendor.js -->

            <script src="bower_components/polymer/polymer.min.js"></script>

            <!-- endbuild -->

    </body>

    </html>

Fantastic. 

<h3 id="toc-dependencies">Adding dependencies using Bower</h3>

Next, let’s edit our element to use the [Polymer JSONP](https://github.com/Polymer/polymer-elements/tree/master/polymer-jsonp) utility element to read in posts.json. You can either get the adapter by git cloning the repository or installing `polymer-elements` via Bower by running `bower install polymer-elements`. 

<img src="image_9.png" class="screenshot"/>

Once you have the utility, you’ll need to include it as an import in your blog.html element with:

    <link rel="import" href="../bower_components/polymer-jsonp/polymer-jsonp.html">

Next, include the tag for it and supply the <code>url</code> to our blog posts spreadsheet from earlier, adding <code>&callback=</code> to the end:

    <polymer-jsonp auto url="https://spreadsheets.google.com/feeds/list/your-key-value/od6/public/values?alt=json-in-script&callback=" response="[[posts]]"></polymer-jsonp>

<p class="notice"><b>Note:</b>  if you find yourself stuck, feel free to use my spreadsheet <a href="https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script">https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script</a> as the value of your URL so you can continue with the tutorial.</p>

With this in place, we can now add templates to iterate over our spreadsheet once it has been read in. The first outputs a table of contents, with a linked title for a post pointing at the slug for it.

    <!-- Table of contents -->

    <ul>

      <template repeat="[[post in posts.feed.entry]]">

        <li><a href="#[[post.gsx$slug.$t]]">[[post.gsx$title.$t]]</a></li>

      </template>

    </ul>

The second renders one instance of `post-element` for each entry found, passing the post content through to it accordingly. Notice that we’re passing through a `post` attribute representing the post content for a single spreadsheet row and a `selected` attribute which we will populate with a route.

    <!-- Post content -->

    <template repeat="[[post in posts.feed.entry]]">

      <post-element post="[[post]]" selected="[[route]]"></post-element>

    </template>

The `repeat` attribute you see being used in our template creates and maintains an instance with [[ bindings ]] for every element in the array collection of our posts, when it is provided.

<img src="image_10.png" class="screenshot"/>

Now in order for us to get the current [[route]] populated, we’re going to cheat and use a library called Flatiron director which binds to [[route]] whenever the URL hash changes. 

Thankfully there’s a [Polymer element](https://github.com/Polymer/more-elements/tree/master/flatiron-director) (part of the [more-elements](https://github.com/Polymer/more-elements) package) that we can grab for it. Once copied to the /elements directory, we can reference it with `<flatiron-director route="[[route]]" autoHash></flatiron-director>`, specifying `route` as the property we wish to bind to and tell it to automatically read the value of any hash changes (autoHash).

Putting everything together we now get:


    <link rel="import" href="post.html">

    <link rel="import" href="polymer-jsonp/polymer-jsonp.html">

    <link rel="import" href="flatiron-director/flatiron-director.html">

    <polymer-element name="blog-element"  attributes="">

      <template>

        <style>
          @host { :scope {display: block;} }
        </style>

        <div class="row">

          <h1><a href="/#">My Polymer Blog</a></h1>

          <flatiron-director route="[[route]]" autoHash></flatiron-director>

          <h2>Posts</h2>

          <!-- Table of contents -->

          <ul>

            <template repeat="[[post in posts.feed.entry]]">

              <li><a href="#[[post.gsx$slug.$t]]">[[post.gsx$title.$t]]</a></li>

            </template>

          </ul>

          <!-- Post content -->

          <template repeat="[[post in posts.feed.entry]]">

            <post-element post="[[post]]" selected="[[route]]"></post-element>

          </template>

        </div>

        <polymer-jsonp auto url="https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdHVQUGd2M2Q0MEZnRms3c3dDQWQ3V1E/od6/public/values?alt=json-in-script&callback=" response="[[posts]]"></polymer-jsonp>

      </template>

      <script>

        Polymer('blog-element', {

          created: function() {},

          enteredView: function() { },

          leftView: function() { },

          attributeChanged: function(attrName, oldVal, newVal) { }

        });

      </script>

    </polymer-element>


<img src="image_11.png" class="screenshot"/>

Woo! We now have a simple blog that's reading data from JSON and using two Polymer elements scaffolded with Yeoman. 

<h3 id="toc-third-party">Working with 3rd party elements</h3>

The element ecosystem around Web Components has been growing lately with component gallery sites like [customelements.io](http://customelements.io/) beginning to appear. Looking through the elements created by the community, I found one for fetching [gravatar profiles](https://github.com/djalmaaraujo/gravatar-element) and we can actually grab and add it to our blog site too.

<img src="image_12.png" class="screenshot"/>

Copy the gravatar element sources to your `/elements` directory, include it via HTML imports in post.html and then add <gravatar-element> to your template, passing in the email field from our spreadsheet as the source of the username. Boom!


    <link rel="import" href="gravatar-element/src/gravatar.html">

    <polymer-element name="post-element" attributes="post selected">

      <template>

        <style>
          @host { :scope {display: block;} }
        </style>

          <div class="col-lg-4">

              <template if="[[post.gsx$slug.$t === selected]]">

                <h2><a href="#[[post.gsx$slug.$t]]">[[post.gsx$title.$t]]</a></h2>

                <p>By [[post.gsx$author.$t]]</p>

                <gravatar-element username="[[post.gsx$email.$t]]" size="100"></gravatar-element>

                <p>[[post.gsx$content.$t]]</p>

                <p>[[post.gsx$date.$t]]</p>

                <small>Keywords: [[post.gsx$keywords.$t]]</small>

              </template>

            </div>

      </template>

      <script>

        Polymer('post-element', {

          created: function() { },

          enteredView: function() { },

          leftView: function() { },

          attributeChanged: function(attrName, oldVal, newVal) { }

        });

      </script>

    </polymer-element>

Let’s take a look at what this gives us:

<img src="image_13.png" class="screenshot"/>

Beautiful!

In a relatively short time, we've created a simple application composed of several web components without having to worry about writing boilerplate code, manually downloading dependencies or setting up a local server or build workflow. 

<h3 id="toc-optimization">Optimizing your application</h3>

The Yeoman workflow includes another open-source project called <a href="http://gruntjs.com">Grunt</a> - a task runner that can run a number of build-specific tasks (defined in a Gruntfile) to produce an optimized version of your application. Running `grunt` on its own will execute a `default` task the generator has setup for linting, testing and building:

    grunt.registerTask('default', [

        'jshint',

        'test',

        'build'

    ]);


The `jshint` task above will check with your `.jshintrc` file to learn your preferences, then run it against all of the JavaScript files in your project. To get the full run down of your options with JSHint, check [the docs](http://www.jshint.com/docs/#options). 

The `test` task looks a little like this, and can create and serve your app for the test framework we recommend out of the box, Mocha. It will also execute your tests for you:

    grunt.registerTask('test', [

        'clean:server',

        'createDefaultTemplate',

        'jst',

        'compass',

        'connect:test',

        'mocha'

    ]);



As our app in this case is fairly simplistic, we'll leave writing tests up to you as a separate exercise. There are a few other things we'll need to have our build process handle, so let's take a look at what the `grunt build` task defined in our `Gruntfile.js` will do:

    grunt.registerTask('build', [

        'clean:dist',    // Clears out your .tmp/ and dist/ folders

        'compass:dist',  // Compiles your Sassiness

        'useminPrepare', // Looks for <!-- special blocks --> in your HTML

        'imagemin',      // Optimizes your images!

        'htmlmin',       // Minifies your HTML files

        'concat',        // Task used to concatenate your JS and CSS

        'cssmin',        // Minifies your CSS files

        'uglify',        // Task used to minify your JS

        'copy',          // Copies files from .tmp/ and app/ into dist/

        'usemin'         // Updates the references in your HTML with the new files

    ]);


Run `grunt build` and a production ready version of your app should be built, ready for you to ship. Let’s try it out.

<img src="image_14.png" class="screenshot"/>

Success!

If you get stuck, a pre-built version of polymer-blog is available for you to check out [https://github.com/addyosmani/polymer-blog](https://github.com/addyosmani/polymer-blog).

<p class="notice"><b>Note:</b> the most common issues users run into with Yeoman, Grunt and Bower are related to not having the sufficient administrator permissions. Please ensure you’ve followed the <a href="https://gist.github.com/isaacs/579814">recommended</a> installation steps for Node and NPM.</p>

<h3 id="toc-in-store">What more do we have in store?</h3>

Web Components are still in a state of evolution and as such so is the tooling around them. 

We’re currently looking at how one might go about concatenating their HTML imports for improved loading performance via projects like [Vulcanize](https://github.com/Polymer/labs/tree/master/vulcanize) (a tool by the Polymer project) and how the ecosystem for components might work with a package manager like Bower. 

We’ll let you know as and when we have better answers to these questions, but there are lots of exciting times ahead.

<h3 id="toc-standalone-install">Installing Polymer standalone with Bower</h3>

If you would prefer a lighter start to Polymer, you can install it standalone directly from Bower by running:

    bower install polymer

which will add it to your bower_components directory. You can then reference it in your application index manually and rock the future.

<h2 id="toc-thoughts">What do you think?</h2>

Now you know how to scaffold out a Polymer app using Web Components with Yeoman. If you have feedback on the generator, please do let us know in the comments or file a bug or post to the Yeoman issue tracker. We would love to know if there is anything else you would like to see the generator do better as it's only through your use and feedback that we can improve :) 
