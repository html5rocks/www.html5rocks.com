{% include "warning.html" %}

<h2 id="toc-intro">소개</h2>

안녕하세요. 웹 앱을 작성하는 누구나가 자신의 생산성을 유지하는 것이 얼마나 중요한지 알고 있을겁니다. 여러분이 정확한 보일러플레이트를 찾아 개발과 테스트 워크플로우를 세팅하고 소스의 최소화 및 압축하는 것과 같은 지루한 작업을 걱정해야만 하는 도전에 직면하게 됩니다.

다행스럽게도 최근의 프론트엔드 도구들은 이러한 일을 대부분 자동화하는 것을 지원하여 강력한 앱의 작성에만 집중할 수 있게 해줍니다. 이 글에서 웹 앱 개발 시 [Web Components](http://html5-demos.appspot.com/static/webcomponents/index.html#1)를 위한 polyfill 및 sugar 라이브러리인 [Polymer](http://polymer-project.org)와 이를 사용하는 앱을 간단하게 생성할 수 있는 작업흐름 도구인 [Yeoman](http://yeoman.io)을 어떻게 사용하는지 보여드리도록 하겠습니다.

<img src="image_0.png" class="screenshot">

<p class="notice"><b>주목:</b> 만약 여러분이 웹 컴포넌트가 처음이라면, 그것들이 제공하는 웹 플랫폼의 기능들에 대한 환상적인 <a href="http://www.polymer-project.org/getting-started.html">문서들</a>을 읽어보기를 권합니다. <a href="http://www.polymer-project.org/platform/custom-elements.html">Custom Element</a>, <a href="http://www.polymer-project.org/platform/shadow-dom.html">Shadow DOM</a>, <a href="http://www.polymer-project.org/platform/html-imports.html">HTML Imports</a> 등을 가능하게 하는 Polymer를 통해 그것들을 어떻게 사용하는지에 대한 가이드입니다.</p>

<h2 id="toc-meet-tools">Yo, Grunt 그리고 Bower를 만나보자</h2>

Yeoman은 생산성 향상을 위한 3개의 도구를 가진 모자 쓴 남자입니다.

* [yo](http://yeoman.io)는 프레임워크에 특화된 기반 구조(scaffold)들의 생태계를 제공하는 구조화 도구로 제가 이전에 말한 귀찮은 작업들 중 일부를 수행하는데 사용할 수 있는 생성기를 호출합니다. 

* [grunt](http://gruntjs.com)는 여러분의 프로젝트를 빌드하고 미리 보고 테스트하는데 사용됩니다. Yeoman팀에서 제공하는 태스크들과 [grunt-contrib](https://github.com/gruntjs/grunt-contrib)로부터의 도움에 감사하게 될 겁니다.

* [bower](http://bower.io)는 의존성을 관리하는데 사용됩니다. 따라서 더 이상 여러분의 스크립트들을 수동으로 다운로드하고 관리하지 않아도 됩니다.

하나 혹은 2개의 명령어를 통해 Yeoman은 여러분의 앱(혹은 모델과 같은 독립적인 코드 조각들)을 위한 보일러플레이트를 작성하고 여러분의 Sass를 컴파일하고 CSS, JS, HTML과 이미지들을 작게 줄이거나 합칠 할 수 있으며 현재 디렉토리에서 간단한 웹서버를 실핼할 수 있도록 합니다. 또한 단위 테스트 등을 할 수도 있습니다.

여러분은 [Node Packaged Modules](http://npmjs.org) (npm)으로부터 생성기를 설치할 수 있으며 거기에는 오픈소스 커뮤니티에서 작성한 많은 그리고 현재 사용 가능한 220개 이상의 [생성기](http://yeoman.io/community-generators.html)가 있습니다. 인기있는 생성기에는 [generator-angular](https://github.com/yeoman/generator-angular), [generator-backbone](https://github.com/yeoman/generator-backbone) 그리고 [generator-ember](https://github.com/yeoman/generator-ember)가 있습니다.

<img src="image_1.png" class="screenshot"/>

최근 버전의 [Node.js](http://nodejs.org)가 설치되어 있다면 당장 터미널을 열어 다음을 실행하세요.

    $ npm instal -g yo

이게 전부입니다. 여러분은 이제 Yo, Grunt 그리고 Bower를 설치했으며 커맨드라인에서 그것들을 즉시 실행할 수 있습니다. 여기 `yo`의 실행 결과가 있습니다.

<img src="image_2.png" class="screenshot"/>

<p class="notice"><b>주의:</b> 만약 Backbone과 같은 다른 프레임워크를 이용하여 어플리케이션을 완성하고자 할 때 Yeoman을 어떻게 쓰는지에 대해 읽어보고 싶으시다면, <a href="http://net.tutsplus.com/tutorials/javascript-ajax/building-apps-with-the-yeoman-workflow/">Yeoman 작업흐름을 이용한 앱 빌드</a>가 흥미로울 것입니다.</p>

<h2 id="toc-polymer-generator">Polymer 생성기</h2>

제가 이전에 이야기한 것과 같이 Polymer는 모던 브라우저들에서 웹 컴포넌트의 사용을 가능하게 하는 polyfill 및 sugar 라이브러리입니다. 이 프로젝트는 개발자들이 미래의 플랫폼을 이용하여 앱을 구축할 수 있도록 해주며 진행 중인 규격이 보다 향상되도록 W3C에 제안을 가능하게 해줍니다.

<img src="image_3.png" class="screenshot"/>

[generator-polymer](https://github.com/yeoman/generator-polymer)는 Yeoman을 이용한 Polymer 앱의 기반 구조를 지원하는 새로운 생성기로 커맨드라인을 통해 쉽게 Polymer (사용자) 요소를 쉽게 생성하고 사용자화 해주고 그것들을 HTML Imports를 이용하여 추가할 수 있게 해줍니다. 이것은 여러분의 보일러플레이트 코드를 작성하는 시간을 절약해줍니다.

다음 실행을 통해 Polymer의 생성기를 설치해봅시다.

    $ npm install generator-polymer -g

이게 전부입니다. 이제 여러분의 앱은 웹 컴포넌트의 강력함을 손에 넣었습니다!

새롭게 설치된 우리의 생성기는 이용이 가능한 작고 특별한 조각들을 가지고 있습니다.

* `polymer:element`는 새로운 개별 Polymer 요소를 구조화하는데 사용됩니다.<br/>`yo polymer:element carousel`이 그 예입니다.

* `polymer:app`는 초기 index.html와 프로젝트에 대한 Grunt 태스크들과 빌드 설정을 포함한 Gruntfile.js 그리고 프로젝트에 적합한 폴더 구조와 같은 기반구조를 만드는데 사용됩니다. 또한 프로젝트를 위한 Sass Bootstrap을 이용하는 옵션도 제공합니다.

<h2 id="toc-build-app">Polymer 앱을 만들어보자!</h2>

몇몇 사용자 Polymer 요소들과 우리의 새로운 생성기을 사용하여 간단한 블로그를 구축할 것이다.

<img src="image_4.png" class="screenshot"/>

시작을 위해 터미널에서 `mkdir my-new-project && cd $_`를 사용하여 새로운 디렉토리를 생성하고 cd를 통해 않으로 들어가봅시다. 이제 다음 실행을 통해 여러분의 Polymer 앱에 시동을 걸 수 있습니다.

    $ yo polymer

<img src="image_5.png" class="screenshot"/>

이것은 Bower를 통해 최신 버전의 Polymer를 가져오고 index.html와 디렉토리 구조, 작업 흐름을 위한 Grunt 태스크를 구성합니다. 자, 그럼 준비가 완료될 때까지 커피나 한잔할까요?

좋습니다, 이제 우리는 이렇게 앱의 미리보기를 위해 `grunt server`를 실행할 수 있습니다.

<img src="image_6.png" class="screenshot"/>

서버는 텍스트 편집기를 작동하여 사용자 요소를 편집하고 저장하면 자동으로 리로드되는 라이브 리로드(LiveReload)를 지원합니다. 이것은 여러분이 만든 앱의 현재 상태의 훌륭한 실시간 화면을 여러분에게 제공합니다.

다음으로, 블로그 게시물에서 설명하고 있는 새로운 Polymer 요소를 생성해봅시다.

    $ yo polymer:element post

<img src="image_7.png" class="screenshot"/>

Yeoman은 생성자를 포함 여부와 `index.html` 내의 기둥(Post) 요소를 포함하기 위해 HTML Import를 사용 여부와 같은 몇가지를 우리에게 질문합니다. 이제 처음 두개의 옵션에 '아니오'라고 답하고 세번째 옵션은 공란으로 남겨둡시다.

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

우리의 블로그는 새로운 게시물을ㅇ읽고 쓰기 위한 공간이 필요할 것입니다. 실제 데이터 서비스를 이용한 작업의 시연을 위해, 우리는 [Google Apps Spreadsheets API](https://developers.google.com/google-apps/spreadsheets/)를 이용할 것입니다. 이것은 우리가 Google Docs를 이용하여 생성된 모든 스프레드쉬트의 내용을 읽을 수 있도록 해줄 것입니다.

이것을 설치해보도록 합시다. :

1. 브라우저(여기서는 크롬을 추천합니다.)를 열고 [이 Google Docs Spreadsheet](https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0)를 열어봅시다. 이것은 다음과 같은 필드들을 포함하고 있는 샘플 게시물 데이터입니다. : <ul class="inline-list">
  <li>ID</li>
  <li>제목</li>
  <li>저자</li>
  <li>내용</li>
  <li>날짜</li>
  <li>키워드</li>
  <li>(저자의) 이메일</li>
  <li>(게시물의 슬러그 URL을 위한) 슬러그(Slug)</li>
</ul>

2. **File** 메뉴로 가서 스프레드쉬트의 복사본을 생성하기 위해 **Make a copy**를 선택하세요. 여가삼아 내용을 수정하거나, 게시물의 추가나 삭제는 여러분의 자유입니다.

3. **File** 메뉴로 한번 더 가서 **Publish to the web**을 선택하세요.

4. **start publishing**을 클릭하세요.

5. **발행된 데이터의 링크얻기(Get a link to the published data)**라는 이름으로 마지막 텍스트 상자에서 제공된 URL의 **key** 일부를 복사할 수 있습니다. 그것이 이렇게 생겼습니다. <a href="https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0">https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0</a>

6. 이어지는 URL의 **your-key-goes-here**에 **key**를 붙여넣으세요. : **<a href="https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=">https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=</a>**. <a href="https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script">https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script</a> 같은 것들이 위와 같이 키를 사용하는 예가 될 수 있을 것입니다.

7. 브라우저에 URL을 붙여넣고 여러분의 블로그 콘텐츠의 JSON 버전을 보기 위해 그것을 파헤쳐볼 수도 있습니다. 만약 URL로 나중에 반복적으로 화면에 출력하기 위한 이 데이터의 형식을 리뷰하는데는 아주 약간의 시간만이 걸립니다.

브라우저에서 JSON 출력은 약간 무섭게 보이겠지만, 절대 걱정하지 마세요! 우리는 그저 게시물에만 관심을 가지고 있습니다.

Google Spreadsheets API는 블로그에 있는 각 필드들을 특별한 접두어 <code>post.gsx$</code>를 붙여 출력합니다. 예를 들어 <code>post.gsx$title.$t</code>, <code>post.gsx$author.$t</code>, <code>post.gsx$content.$t</code> 등 우리가 우리의 JSON 출력에 존재하는 각 "행"을 순회하고자 할 때 각 게시물의 관계된 값을 돌려주는 이 필드들을 참조할 겁니다.

이제 여러분은 많은 양의 마크업을 여러분의 스프레드쉬트의 데이터와 [바인딩](http://www.polymer-project.org/docs/polymer/databinding.html)할 수 있는새롭게 구성된 게시물 요소를 수정할 수 있게 되었습니다. 그렇게 하기 위해서, 우리는 앞서 생성했던 게시물의 타이틀, 저자, 내용과 다른 필드 등을 읽을`post` 속성에 대해 소개할 것입니다. (우리가 나중에 덧붙일) `selected` 속성은 오로지 사용자가 올바른 슬러그(slug)로 네비게이션했을 때 게시물을 보여주기 위해 사용될 것입니다.

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

다음으로, `yo polymer:element blog`의 실행을 통해 블로그를 위한 게시물과 레이아웃들의 컬렉션을 모두 포함하고 있는 blog 요소를 생성해봅시다.

    $ yo polymer:element blog

    [?] Would you like to include constructor=''? No

    [?] Import to your index.html using HTML imports? Yes

    [?] Import other elements into this one? (e.g 'another_element.html' or leave blank) post.html

       create app/elements/blog.html

이때 우리는 페이지에서 보여주길 원하는 블로그를 [HTML imports](http://www.polymer-project.org/platform/html-imports.html)을 사용하여 삽입할 것입니다. 특별히 세번째 프롬프트에서 우리는 포함하고자 하는 요소로써 `post.html`를 지정하였습니다.

앞에서 본 바와 같이, 새로운 요소 파일이 (blog.html)로 생성되어 /elements 디렉토리에 추가되면서 post.html을 삽입하고 템플릿 태그 내에 &lt;post-element&gt;를 포함할 것입니다.

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

우리가 index에 [HTML imports](http://www.polymer-project.org/platform/html-imports.html)(HTML 문서를 다른 HTML 문서들에서 포함하고 재사용하는 방법)를 사용하여 blog 요소를 포함할 것인지에 대해 질의한 것과 마찬가지로 그것 또한 문서의 '<head>'에 정확하게 추가되었는지에 대해 검증할 수 있습니다.

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

환상적이군요!

<h3 id="toc-dependencies">Bower를 이용한 의존성 추가하기</h3>

다음으로 posts.json을 읽기 위한 [Polymer JSONP](https://github.com/Polymer/polymer-elements/tree/master/polymer-jsonp) 유틸리티 요소를 사용하기 위한 우리의 요소들을 편집해봅시다. git 저장소의 복제하거나 `bower install polymer-elements`을 실행하여 Bower를 통해 'polymer-elements'를 설치하여 어댑터를 가져올 수 있습니다.

<img src="image_9.png" class="screenshot"/>

일단 유티리티를 받으면, 다음과 같이 blog.html 요소를 추가하는 것처럼 그것을 포함하는 것이 필요할 것입니다.

    <link rel="import" href="../bower_components/polymer-jsonp/polymer-jsonp.html">

그리고, 그를 위한 태그를 포함시키고 마지막 부분에 <code>&callback=</code>를 추가하여 앞에 나온 스프레드쉬트를 우리의 블로그에 포스팅하기 위한 <code>url</code>를 넣어야 합니다.

    <polymer-jsonp auto url="https://spreadsheets.google.com/feeds/list/your-key-value/od6/public/values?alt=json-in-script&callback=" response="[[posts]]"></polymer-jsonp>

<p class="notice"><b>주의:</b>  만약 더 이상 아무것도 할 수 없다면 튜토리얼을 계속하기 위해 여러분의 URL 값으로 <a href="https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script">https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script</a>에 있는 제 스프레드쉬트를 편하게 사용하셔도 됩니다.</p>

여기에서, 이제 우리는 일단 읽어진 우리의 스프레드쉬트를 순환하기 위한 템플릿들을 추가할 수 있습니다. 처음에 슬러그(slug)에서 가리키는 게시물의 링크를 가진 제목을 목차를 출력합니다.

    <!-- Table of contents -->

    <ul>

      <template repeat="[[post in posts.feed.entry]]">

        <li><a href="#[[post.gsx$slug.$t]]">[[post.gsx$title.$t]]</a></li>

      </template>

    </ul>

두번째로 각 entry에 마다 'post-element'의 인스턴스 하나를 게시물의 내용을 전달하여 렌더링합니다. 우리가 스프레드쉬트 한 행의 게시물 내용을 나타내는 'post' 속성과 덧붙이고자 하는 'selected' 속성을 route로 전달하고 있다는데 주목하시기 바랍니다.

    <!-- Post content -->

    <template repeat="[[post in posts.feed.entry]]">

      <post-element post="[[post]]" selected="[[route]]"></post-element>

    </template>

여러분이 템플릿에서 볼 수 있는 'repeat' 속성으로 게시물들의 컬렉션 배열이 제공되면 그 안의 모든 요소에 대해 [[bindings]]을 가진 인스턴스를 생성하고 관리할 수 있습니다.


<img src="image_10.png" class="screenshot"/>

이제 우리는 [[route]]를 덧붙이기 위해 URL 해쉬가 변경될 때마다 [[route]]로 바인딩하는 Flatiron director 라이브러리를 사용하고 트릭을 부릴 수 있을 것입니다.

고맙게도 이미 우리가 그렇게 할 수 있는 [Polymer element](https://github.com/Polymer/more-elements/tree/master/flatiron-director)([more-elements](https://github.com/Polymer/more-elements) 패키지의 일부)가 있습니다.
/elements 디렉토리에 한번 복사하고 나면, 우리는 `<flatiron-director route="[[route]]" autoHash></flatiron-director>`로 그것을 참조할 수 있으며, 'route'를 우리가 바인딩하고 싶은 속성처럼 지정하고 어떠한 해시의 변경값도 자동으로 읽도록(autoHash) 정의할 수 있습니다.

이제 우리가 가진 모든 것을 함께 버무려봅시다.

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

와우! 우리는 이제 Yeoman으로 구축된 2개의 Polymer 요소를 이용하여 JSON으로부터 데이터를 읽어오는 간단한 블로그를 만들었습니다.

<h3 id="toc-third-party">서드파티 요소로 작업하기</h3>

웹 컴포넌트를 둘러싼 요소의 생태계는 [customelements.io](http://customelements.io/)같은 컴포넌트 갤러리 사이트가 나타나기 시작하며 천천히 성장하고 있습니다.
커뮤니티에서 만들어진 요소들을 살펴보던 중 저는 [gravatar profiles](https://github.com/djalmaaraujo/gravatar-element)을 불러오기 위한 것을 발견했습니다.
그것을 가지고 우리의 블로그에도 실제로 추가해보도록 하겠습니다.

<img src="image_12.png" class="screenshot"/>

gravatar 요소의 원본을 '/elements' 디렉토리에 복사하고, post.html에 HTML imports를 통해 포함한 뒤 템플릿에 <gravatar-element>를 추가하고, username의 소스처럼 우리의 스프레드쉬트로부터 email을 전달합니다. 콰광!

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

우리에게 어떻게 보이는지 살펴봅시다.

<img src="image_13.png" class="screenshot"/>

멋지군요!

비교적 짧은 시간에 우리는 보일러플레이트 코드를 작성하고 수동으로 의존성을 관리하거나 로컬서버를 설치하고 작업흐름을 구축하는 것에 대한 걱정없이 몇가지 웹 컴포넌트로 구성된 간단한 어플리케이션을 만들었습니다. 

<h3 id="toc-optimization">어플리케이션 최적화하기</h3>

Yeoman의 작업흐름은 [Grunt](http://gruntjs.com)-어플리케이션의 최적화 버전을 생성하기 위한 많은 양의 (Gruntfile에 정의된) 빌드 태스크들을 실행하는 작업 실행기-로 불리는 또다른 오픈소스 프로젝트를 포함하고 있습니다. 자체 (디렉토리)에서 'grunt'를 실행하기만 하면 'default' 태스크가 린트, 테스팅, 빌드를 위한 작업들을 세팅하고 실행할 것입니다.

    grunt.registerTask('default', [

        'jshint',

        'test',

        'build'

    ]);

위의 `jshint` 태스크는 여러분이 선호하는 (코딩) 방식을 학습하기 위해 여러분의 `.jshintrc`를 확인하고 프로젝트 안에 있는 모든 자바스크립트 파일에 대해 확인 작업을 실행할 것입니다. JSHint로 실행할 수 있는 완전한 옵션을 알고 싶으시면 [이 문서](http://www.jshint.com/docs/#options)를 확인하시기 바랍니다.

`test' 태스크는 이것과 약간 비슷하게 보이지만 우리가 특별하게 추천하는 테스트 프레임워크인 모카(Mocha)를 생성하고 여러분의 앱에 적용할 것입니다. 그것은 또한 여러분이 만든 테스트를 실행할 수 있습니다.

    grunt.registerTask('test', [

        'clean:server',

        'createDefaultTemplate',

        'jst',

        'compass',

        'connect:test',

        'mocha'

    ]);

우리 앱처럼 이 경우는 꽤 단순하기 때문에 여러분에게 테스트를 위한 코드 작성을 별도의 시험 문제로 남겨두도록 하겠습니다. 빌드 프로세스를 다루기 위해 필요한 사소한 몇가지가 있으므로 `Gruntfile.js`에 정의된 `grunt build` 태스크가 무엇을 하는지 알아보도록 하겠습니다.

    grunt.registerTask('build', [

        'clean:dist',    // .tmp/와 dist/ 폴더를 삭제합니다.

        'compass:dist',  // Sass를 컴파일합니다.

        'useminPrepare', // HTML에서 <!-- special blocks -->을 찾아줍니다.

        'imagemin',      // 이미지를 최적화합니다!

        'htmlmin',       // 여러분의 HTML 파일들을 최소화합니다!

        'concat',        // JS와 CSS를 합치는데 사용하는 태스크

        'cssmin',        // CSS 파일들을 최소화합니다.

        'uglify',        // JS를 최소화합니다.

        'copy',          // .tmp/와 app/의 파일들을 dist/로 복사합니다.

        'usemin'         // 새로운 파일들로 HTML 내 참조를 갱신합니다.

    ]);


'grunt build'를 실행하고 앱에 대한 제작 완료 버전이 만들어지며 실행해볼 준비가 완료될 것입니다. 한번 해보죠.

<img src="image_14.png" class="screenshot"/>

성공입니다!

만약 더 이상 진행하기가 어렵다면, 이미 만들어진 polymer-blog 버전을 [https://github.com/addyosmani/polymer-blog](https://github.com/addyosmani/polymer-blog)에서 확인할 수 있습니다.

<p class="notice"><b>주의:</b> 사용자가 Yeoman, Grunt, Bower을 실행 시 대다수의 문제들은 확실한 관리자 권한을 얻지 못하는 것과 관련이 있습니다. 반드시 Node와 NPM에서 <a href="https://gist.github.com/isaacs/579814">권장하는</a> 설치 방법을 따르시기 바랍니다.</p>

<h3 id="toc-in-store">우리가 지금 무엇을 더 해야할까요?</h3>

웹 컴포넌트는 여전히 혁신의 상태에 있으며 그를 둘러싼 도구들도 그렇습니다.

우리는 현재 로딩 성능의 개선을 위해 [Vulcanize](https://github.com/Polymer/labs/tree/master/vulcanize)(Polymer 프로젝트에 의한 도구)와 같은 프로젝트를 통해 HTML imports의 연결을 어떻게 하면 한가지 방법으로 할 수 있을지와 Bower 같은 패키지 관리자로 컴포넌트를 활용할 수 있는 생태계를 연구하고 있습니다.

우리가 이러한 의문들에 대해 더 좋은 답을 찾으면 여러분에게도 알리겠지만 이보다 흥미로운 시간이 많이 있습니다.

<h3 id="toc-standalone-install">Bower를 이용하여 Polymer를 단독으로 설치하기</h3>

만약 여러분이 Polymer를 가볍게 시작하고자 한다면, 다음과 같은 Bower 실행을 통해 그것을 단독으로 설치할 수 있습니다.

    bower install polymer

이는 bower_components 디렉토리에 Polymer를 추가할 것입니다. 이제 수동으로 어플리케이션 인덱스에서 참조하고 신나게 다룰 수 있을 것입니다.

<h2 id="toc-thoughts">어떻게 생각하십니까?</h2>

이제 여러분은 Yeoman으로 어떻게 웹 컴포넌트를 사용하는 Polymer 앱을 구축하는지 알았습니다. 만약 생성기에 대해 할 이야기가 있으시다면 댓글이나 버그 파일, 포스팅을 Yeoman 이슈 추적기에 남겨주세요. 만약 여러분의 사용에만 생성기를 더 좋게 동작할 수 있는 것만 되더라도 우리가 향상할 수 있는 그 무엇이라도 알려주신다면 무척 고맙겠습니다. :) 
