<h2 id="toc-intro">소개</h2>

[개발자도구의 터미널(DevTools Terminal)](https://github.com/petethepig/devtools-terminal)은 브라우저에 [강력함](http://blog.dfilimonov.com/2013/09/12/devtools-terminal.html)을 가져다주는 새로운 크롬 개발자도구 확장기능입니다. 만약 태스크를 위해 (리소스 다운로드, git 사용, grunt, wget뿐만이 아니라 vim까지도 포함한) 커맨드라인 도구와 크롬 간에 컨텍스트-스위칭을 하고 있음을 깨달을지라도 이 확장 기능이 시간을 절약하는 유용한 도구라는 사실을 발견하게 될 것입니다.

<figure>
  <img src="image_0.png" alt="개발자도구의 터미널은 빠르게 커맨드라인을 다루는데 훌륭합니다." />
  <figcaption>개발자도구의 터미널은 웹앱 작업을 하는 동안 크롬 내부로부터 빠르게 커맨드라인을 다루는데 유용합니다.</figcaption>
</figure>

<figure>
  <img src="image_1.png" alt="개발자도구의 터미널에서 cURL 사용하기" />
  <figcaption>네트워크 패널에서 <a href="https://twitter.com/ChromiumDev/status/317183238026186752">cURL 같은 복사</a>를 한 뒤, 손쉽게 완전한 명령을 개발자도구의 터미널에 붙여놓고 실행합니다.</figcaption>
</figure>

## 왜 브라우저에서 터미널을 사용해야 하는가?

개발을 진행되는 동안 아마 저작을 위한 텍스트 편집기, 테스팅과 디버깅을 위한 브라우저, 패키지를 업데이트하고 헤더를 잘라내거나 Grunt를 사용하는 빌드 프로세스를 위한 터미널들과 같은 몇가지 다른 도구들을 이용하여 작업을 할 수 있습니다.

<figure>
  <img src="image_2.png" alt="개발자도구의 터미널에서 Grunt 실행" />
  <figcaption>브라우저를 벗어나지 않고 Grunt를 이용한 빌드 작업 실행</figcaption>
</figure>

개발 중에 도구들간의 컨텍스트를 변경해야하는 것은 산만하게 만들고 * *비효율성을 이끌어내기도 합니다. 우리는 브라우저를 벗어나지 않고 크롬 개발자도구 내의 [작업영역(Workspaces)](http://www.html5rocks.com/en/tutorials/developertools/revolutions2013/)을 사용하여 (확실한 프로젝트 형태를 위해) 어떻게 코드를 직접 디버깅하고 작성할 수 있는지에 대해 이전에 이야기한 바가 있습니다.

<figure>
  <img src="image_3.png" alt="Git workflow" />
  <figcaption>완전한 git workflow 역시도 가능합니다. 작업영역(Workspace)에서의 작성 뒤에 <em>gif diff</em>에 훌륭합니다.</figcaption>
</figure>

개발자도구의 터미널은 (Dmitry Filimonov가 작성한) 동일한 윈도우 내로부터 코드, 디버그 그리고 빌드를 가능하게 하는 방법을 완전하게 만듭니다. 탭(Tab), 컨트롤(Ctrl) 그리고 Git 색상들까지도 이용하면 일상적인 작업흐름에서의 사용했던 터미널처럼 더 친숙하게 만들 수도 있습니다.

<h2 id="toc-workflow">작업흐름(Workflow)</h2>

<figure>
  <img src="image_4.png" alt="작업흐름의 작성" />
  <figcaption><em>git clone</em>, <em>yeoman</em> 혹은 터미널을 이용하여 사용가능한 다른 도구들을 이용하여 새로운 프로젝트를 시작해봅시다.</figcaption>
</figure>

개인적으로 크롬에서 저작을 위함 작업흐름은 이제 다음과 약간 비슷하게 보일 것입니다.

* **개발자도구의 터미널(DevTools Terminal):** GitHub 저장소를 *git clone*(역주: 저장소 내의 소스트리를 새로운 저장소로 복제하는 git 명령)하기 위해 사용하고 새로운 파일을 *건드리거나* 새로운 앱을 생성하기 위해 *yo (yeoman) *을 실행하는데 사용할 수 있습니다*.* 만약 앱을 미리보기 위한 새로운 서버를 실행하기를 원할 때에도 가능합니다.

* **작업영역(Workspaces): **크롬 내의 웹앱을 편집하고 디버깅합니다. 만약 미리 서버를 실행하였다면 로컬 프로젝트와 네트워크 파일들을 매핑할 수 있습니다. Sass나 Less를 사용할 수 있으며 [CSS preprocessor](https://developers.google.com/chrome-developer-tools/docs/css-preprocessors)의 변경을 CSS 파일들에 다시 반영할 수도 있습니다.

* **개발자도구(DevTools)**** 터미널(Terminal): **이제 소스 컨트롤에 커밋하거나 의존성(의존성이 있는 모듈)들을 내려받기 위해 (npm, bower 같은) 패키지 관리자를 사용하거나 동일한 앱의 최적화 버전을 생성하기 위해 (grunt, make 같은) 빌드 프로세스를 실행할 수도 있습니다.

비록 윈도우를 정렬하는데 약간의 시간이 걸릴 수는 있지만, 브라우저 내에서 필요로하는 대부분의 것들을 달성할 수 있어 쾌적합니다.

<figure>
  <img src="image_5.png" alt="터미널 내에서의 ls 명령 사용" />
  <figcaption><em>ls</em>을 사용하여 현재 작업 중인 디렉토리 내의 파일을 리스트합니다. 작업영역 밖의 디렉토리를 보는데도 훌륭합니다.</figcaption>
</figure>


<h2 id="toc-installation">설치</h2>

개발자도구의 터미널은 [Chrome Web Store](https://chrome.google.com/webstore/detail/devtools-terminal/leakmhneaibbdapdoienlkifomjceknl?hl=en)에서 설치할 수 있습니다. 만약 여러분이 Mac이나 Linux 사용자라면, 일단 크롬에 추가를 하고나면 개발자 도구를 열기 위해 간단하게 "요소 검사(Inspect Element)"를 하거나 <span class="kbd">Ctrl</span> + <span class="kbd">Shift</span> + <span class="kbd">I</span>할 수 있으며 새로운 "Terminal" 탭을 통해 사용하는 것이 가능해질 것입니다.

윈도우즈 사용자들은 Node.js 프록시를 사용하여 시스템 터미널 확장에 연결하는 과정이 필요할 것입니다. 이 설정을 위해 다음과 같이 npm으로부터 `devtools-terminal`를 설치하시기 바랍니다.

<pre>npm install -g devtools-terminal</pre>

그리고나서 새로운 커맨드라인 윈도우를 열고 `devtools-terminal`을 실행합니다. 그리고 개발자도구를 열어 "Terminal" 탭에서 기본 설정 옵션을 사용하여 서버에 연결합니다. 필요하다면 포트와 주소를 더욱 커스터마이징할 수 있습니다.

<figure>
  <img src="image_6.png" alt="개발자도구의 터미널은 설치 과정에서 연결 상세 정보의 커스터마이징을 지원합니다." />
</figure>

<h2 id="toc-limitations">제한점들</h2>

개발자도구의 터미널은 몇가지 주의할만한 제한점들을 가지고 있습니다. Mac에서의 Terminap.app이나 iTerm2과는 다르게 탭(Tab)들이나 다중 윈도우, 뒤로가기(History playback)를 아직 지원하지 않습니다. 그러나 여러분이 크롬에서 다수의 새로운탭을 여는 것과 마찬가지로 개발자도구의 터미널 개별 인스턴스를 가질 수 있는 각각의 터미널을 열 수 있습니다. (역주: 새로 실행을 통해 여러개의 동일한 터미널 프로그램을 실행하는 것이 가능하다는 뜻입니다.) 이는 다음과 같은 크롬 앱스(Chrome Apps) 화면에서 처리할 수 있습니다.

<figure>
  <img src="image_7.png" alt="개발자도구의 터미널은 밝은 테마와 어두운 테마를 모두 지원합니다." />
  <figcaption>현재 확장기능(Extension)은 기본적으로 밝은 테마와 어두운 테마를 모두 지원합니다.</figcaption>
</figure>

<p class="notice">이 확장 기능은 현재 내년(2014년)에 단계적으로 폐지되어 갈 네이티브 메세징 API(Native Messaging API)를 위한 <a href="http://blog.chromium.org/2013/09/saying-goodbye-to-our-old-friend-npapi.html">NPAPI</a>을 필요로 합니다. 발자도구의 터미널 개발자 Dmitry Fillimonov는 가까운 시기에 이 API와 Native Client API을 위한 NPAPI를 사용하지 않도록 하는 계획을 가지고 있습니다.</p>

<h2 id="toc-conclusions">결론</h2>

개발자도구의 터미널(과 [Auxilio](http://krasimirtsonev.com/blog/article/Auxilio-Chrome-extension-or-how-I-boost-my-productivity)같은 비슷한 확장기능)은 여러분이 개발 중에 편집기, 브라우저, 커맨드라인 사이에서 왔다갔다 하는 것을 피할 수 있도록 도와줄 것입니다.

브라우저 내 터미널(In-browser terminal)이 모든 사람에게 한잔의 차는 아니겠지만, 여러분의 작업흐름을 보완해줄 유용한 확장기능(Extension)을 발견할 수 있을 것이고 우리는 여러분이 그것을 시도해보기를 권하며 얼마나 그를 좋아할지 보고 싶습니다!