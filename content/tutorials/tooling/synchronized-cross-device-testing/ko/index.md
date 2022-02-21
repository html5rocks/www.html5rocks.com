<h2 id="toc-intro">소개</h2>

만약 여러분이 멀티-디바이스 웹을 목표로 하고 있다면, 사이트와 웹 앱을 많은 수의 디바이스와 설정 전체에 걸쳐 테스트해야만 할 것입니다. 동기화된 테스팅은 이를 도와줄 수 있으며 동시에 디바이스들과 브라우저들 전체에 걸쳐 동일한 인터랙션을 자동으로 수행하기 위한 효과적인 방법입니다.

다음과 같이 동기화된 테스팅은 특히 2개의 시간-소모적인 문제들을 풀도록 도와줄 수 있을 것입니다.

* **시험을 원하는 URL에 대한 모든 디바이스의 동기화 유지.** 수동적으로 각 디바이스 상에 로딩하는 것은 꽤나 오래된 일이며, 시간이 오래 걸리는데다 반복적으로 실패하기 더 쉽습니다.
* **인터랙션의 동기화.** (디바이스들을 동기화하여) 페이지를 로딩할 수 있는 것은 시각적인 테스팅에 훌륭하지만 여러분은 인터랙션 테스팅에 있어서도 이상적인 방법으로 스크롤, 클릭 그리고 다른 행위들을 동기화할 수 있기를 원할 것입니다.

고맙게도 대상 디바이스 중 일부에 액세스하고자 한다면 데스크탑에서 모바일 디바이스로의 흐름을 개선하는데 중점을 둔 많은 도구들이 있습니다. 이 글에서 우리는 Ghostlab, Remote Preview, Adobe Edge Inspect와 Grunt를 살펴보고자 합니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image10.jpg">
  <figcaption>제 책상입니다. 음, 제 책상으로 쓰였던 것입니다. 이제는 그냥 모바일 박물관일뿐입니다.</figcpation>
</figure>


<h2 id="toc-tools">도구들</h2>

<h3 id="toc-ghostlab">GhostLab (Mac)</h3>

<figure>
  <img src="/static/images/screenshots/crossdevice/image00.png">
  <figcaption>Vanamco의 Mac용 Ghostlab</figcpation>
</figure>

[Ghostlab](http://vanamco.com/ghostlab/)은 사이트와 웹 앱들을 다양한 디바이스들에서 테스트하기 위한 상용 맥 어플리케이션($49)입니다. 다음과 같이 최소의 설정으로 동기화된 시뮬레이션을 할 수 있습니다.

* 클릭
* 네비게이션
* 스크롤
* 폼 입력 (예. 로그인 폼들, 가입)

이것은 여러가지의 디바이스들에서 매우 간단하게 사이트의 구석구석에 대한 사용자 경험(Experience)를 테스트할 수 있게 합니다. 일단 페이지를 디바이스 상의 브라우저에서 열고나면 (새로고침을 포함하여) 탐색을 위한 어떠한 변화들이라도 연결된 다른 디바이스들에 즉시 연동됩니다. Ghostlab은 로컬 디렉토리들의 감시를 지원하므로 로컬 파일들의 편집 사항들을 저장이 발생할 때 역시 자동으로 연동되며 언제나 모든 것이 동기화된 상태로 유지됩니다!

저는 Ghostlab를 설치하기 위한 괴롭지 않은 프로세스를 정립했습니다. 시작을 위해 [트라이얼](http://awesome.vanamco.com/downloads/ghostlab/latest/Ghostlab.dmg) (혹은 구입할 생각이시라면 풀 버전)을 다운로드, 설치하고 실행하시기 바랍니다. 그런 다음 맥과 테스트하기를 원하는 디바이스들을 연결하고자 한다면 이들이 동일한 Wifi 네트워크에 있어야 디바이스들을 탐색할 수 있습니다.

일단 Ghostlab이 동작하고 나면, "+"를 눌러 테스팅을 위한 URL을 추가하거나 간단하게 "+"을 브라우저의 주소 으로 드래그할 수 있습니다. 그 대신, 테스트하기 원하는 로컬 폴더를 메인 윈도우에 드래그하면 새로운 사이트 항목이 생성될 것입니다. 이 글에서 저는 [http://html5rocks.com](http://html5rocks.com)의 라이브 버전을 테스트하고 있습니다. 건방진가요, 네? ; )

<figure>
  <img src="/static/images/screenshots/crossdevice/image06.png">
  <figcaption>여러분의 머신 상의 URL이나 로컬 디렉토리를 선택하세요.</figcpation>
</figure>

그 뒤에 사이트 명의 옆에 있는 ">" 플레이 버튼을 클릭하는 것으로 신규 Ghostlab 서버를 실행할 수 있습니다. 이것은 여러분의 네트워크에 한정하여 유효한 IP 주소(예. [http://192.168.21.43:8080](http://192.168.21.43:8080))에서 새로운 서버를 시작합니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image11.jpg">
  <figcaption>URL로부터 로컬에 대한 컨텐츠를 프록시할 Ghostlab 서버</figcpation>
</figure>

여기에 있는 것은 Ghostlab이 제게 준 IP 주소로 제가 접속했던 Nexus 4에 특화된 안드로이드용 크롬입니다. 이와 같은 모든 것을 수행해야 합니다. Ghostlab은 몇몇 다른 솔루션들처럼 디바이스마다 전용의 클라이언트를 설치하는 것을 필요로 하지 않으며 이는 여러분이 한층 더 빠르게 테스팅을 시작할 수 있다는 것을 뜻합니다.

어떠한 디바이스라도 Ghostlab URL로 접속하면 Ghostlab의 메인 윈도우 오른편에 위치한 사이드바 내의 연결된 클라이언트 리스트에 추가될 것입니다. 디바이스 명을 더블클릭하면 스크린 크기, OS 등과 같은 추가적인 정보를 표시합니다. 이제 여러분은 테스트의 탐색과 클륵들의 동기화를 할 수 있을 것입니다! 야호.

또한 Ghostlab은 UA 문자열, 뷰포트의 너비(width)와 높이(height), 디바이스의 픽셀의 화소밀도(Pixel Density), 영상비(Aspect Ratio) 등의 연결된 디바이스에 대한 몇가지 상태를 출력할 수도 있습니다. 언제라도 항목 옆의 설정 아이콘(Cog) 클릭을 통해 조사 중인 기본 URL을 수동으로 변경할 수 있습니다. 이는 아래와 같이 보이는 설정 윈도우를 열 것입니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image05.png">
  <figcaption>와치(Watch), HTTP 헤더, 문자세트 등을 위한 설정 파일들</figcpation>
</figure>

이제 다른 디바이스들 중 하나를 선택할 수 있으며 HTML5Rocks에 관련된 다른 링크의 클릭 및 탐색이 모든 디바이스들뿐만이 아니라 데스크탑의 (동일한 Ghostlab URL로 접속한) 크롬과도 동기화할 수 있습니다.

더 좋은 점은 Ghostlab이 네트워크를 통해 가는 모든 링크들에 대한 프록시를 지원하는 옵션이 있다는 것입니다. 따라서 (예를 들어) 다른 솔루션에서 우리를 괴롭혀왔던 자동적인 디바이스 간의 새로고침이 깨질 수 있는 경우, [http://192.168.21.43:8080/www.html5rocks.com](http://192.168.21.43:8080/www.html5rocks.com) 상에서 [www.html5rocks.com/en/performance](http://www.html5rocks.com/en/performance)로 링크를 클릭하는 것 대신 이 링크를 단순히 [http://192.168.21.43/www.htm5rocks.com/en/performance](http://192.168.21.43/www.htm5rocks.com/en/performance)로 변환할 수 있어 네비게이션이 모든 디바이스간에 완전히 매끄럽게(Seamless) 동작합니다. (*역주: 이는 개발 혹은 테스팅에 있는 로컬 HTML 문서 내의 링크가 외부 링크를 바라보고 있더라도 자동으로 테스트 중인 로컬 HTML의 유효한 링크로 변경해주는 기능을 뜻합니다.*)

이를 가능하게 하도록 하기 위해 "Content Loading" 탭 내의 "Load all content through Ghostlab"를 체크하시기 바랍니다.


<figure>
  <img src="/static/images/screenshots/crossdevice/image08.png">
  <figcaption>Ghostlab URL들을 재생성할 수 있으므로 모든 리소스들은 Ghostlab 프록시를 통해 로딩됩니다. 다수의 페이지들로의 탐색을 동기화하는데 유용합니다.</figcpation>
</figure>

다음 그림에서 이 동작을 확인해보도록 하겠습니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image18.jpg">
  <figcaption>Ghostlab을 이용한 안드로이드, 윈도우8 및 파이어폭스 OS 폰의 테스팅 동기화</figcpation>
</figure>

Ghostlab은 어떠한 지원 브라우저들에서 원하는 갯수만큼의 사이트나 윈도우를 로딩하는 것이 가능합니다. 이는 사이트를 다른 해상도에서 테스트만이 아니라 여러분의 코드가 각기 다른 브라우저들과 플랫폼 상에서 어떻게 동작하는지를 테스트해 볼 수 있습니다. 야호!

<figure>
  <img src="/static/images/screenshots/crossdevice/ghostlabanim.gif">
  <figcaption>모든 테스트 디바이스들 간의 스크롤, 언어 그리고 탐색 동기화</figcpation>
</figure>

Ghostlab은 미리보기를 할 프로젝트 작업공간(Workspace)의 설치를 설정할 수 있도록 하며 디렉토리의 변경을 감시하고 변경의 검출 시 새로고치는 것과 같은 것을 지정할 수 있습니다. 이는 변경들이 모든 연결된 클라이언트들의 새로고침을 발생시킨다는 뜻입니다. 더 이상의 수동 새로고침은 없습니다!

Ghostlab이 도와줄 수 있는 다른 것들에 놀랄 수도 있습니다. 확실한 스위스-아미 나이프는 아니지만 연결된 디바이스 상에서의 원격 코드 감시 또한 지원합니다. 주 인터페이스를 통해, 아무 디바이스 이름 위에서의 더블클릭은 여러분이 플레이 [Chrome DevTools](http://devtools.chrome.com)의 버전을 런칭하는 "디버그" 옵션을 실행합니다.

Ghostlab은 연결된 디바이스들 상에서 스크립트를 디버깅하거나 스타일들을 수정할 수 있도록 하는 [Weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/) 원격 웹 인스펙터를 엮음으로써 이것을 가능하게 합니다. 엘리먼트들을 선택하고 몇가지 성능 프로파일링과 스크립트 디버깅을 할 수 있는 크롬 안드로이드에서 가능한 [원격디버깅(remote debugging)](https://developers.google.com/chrome-developer-tools/docs/remote-debugging)과 유사합니다.

대체로 저는 디바이스들간의 일상적인 테스팅을 위해 얼마나 빠르게 Ghostlab을 사용할 수 있는지가 인상적이었습니다. 여러분이 만약 프리랜서라면 상업 라이센스의 비용이 약간 높다는 (더 많은 선택 사항은 아래에서 보시길) 것을 알 수 있었을 것입니다. 그러나 전 Ghostlab 이외의 것들도 추천해줄 수 있다는 사실이 행복합니다.

<h3 id="toc-edgeinspect">Adobe Edge Inspect CC (Mac, Windows)</h3>

<figure>
  <img src="/static/images/screenshots/crossdevice/image12.png">
  <figcaption>Edge Inspect을 포함한 Adobe Creative Cloud 서브스크립션</figcpation>
</figure>

Adobe Edge Inspect는 Adobe Creative Cloud 서브스크립션 패키지의 일부입니다만 무료 트라이얼처럼 사용할 수도 있습니다. (Edge Inspector 크롬 익스텐션을 통해) 크롬으로 다양한 iOS와 안드로이드 디바이스를 다루는 것을 가능하게 하므로 특별한 URL을 브라우징한다면 모든 연결된 디바이스들 전부를 동기화할 수 있습니다.

설치를 위해서, 가장 먼저 [Adobe Creative Cloud](http://creative.adobe.com/) 계정을 생성하거나 이미 계정을 가지고 있다면 기존 계정으로 로그인합니다. 다음으로 [Edge Inspect](https://creative.adobe.com/inspect)을 다운로드하고 설치합니다. 곁에 두면 유용할 Edge Inspect에 대한 [문서](http://forums.adobe.com/docs/DOC-2535)을 확인하시기 바랍니다.

설치 뒤 연결된 디바이스들간의 브라우징을 동기화할 수 있는 크롬용 [Edge inspect extension](http://www.adobe.com/go/edgeinspect_chrome)을 얻고자 할 수 있습니다.


<figure>
  <img src="/static/images/screenshots/crossdevice/image03.png">
  <figcaption>Edge Inspect CC 크롬 익스텐션</figcpation>
</figure>

동기화 액션들을 원하는 각 디바이스 상의 Edge Insepct 클라이언트의 설치 또한 필요할 수도 있을 것입니다. 고맙게도 
[iOS](http://www.adobe.com/go/edgeinspect_ios), 
[Android](http://www.adobe.com/go/edgeinspect_android) 그리고
[Kindle](http://www.adobe.com/go/edgeinspect_amazon)를 위한 클라이언트들이 사용가능합니다.

이제 뒤에 이어질 설치과정으로 페이지들에 대한 감시들을 시작할 수 있습니다. 이것이 작동하려면 모든 장치가 동일한 네트워크에 연결되어 있는지 확인해야합니다.

크롬에서 Edge Inspect 익스텐션을 통해 테스크톱 상의 Edge Inspect를 시작하고 그리고 나서 디바이스 상에서 앱을 시작합니다. (아래를 살펴보시기 바랍니다.)

<br/>

<figure>
  <img src="/static/images/screenshots/crossdevice/image02.png">
  <figcaption>디바이스의 Edge Inspect 익스텐션 연결</figcpation>
</figure>

이제 데스크탑 상에서 HTML5Rocks.com 같은 사이트를 탐색하면 모바일 디바이스에서 동일한 페이지를 자동으로 탐색할 수 있습니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image17.jpg">
  <figcaption>연결된 다양한 디바이스들 간의 URL의 탐색 제어</figcpation>
</figure>

익스텐션에서 또한 아래 스크린샷에서 보다시피 <> 표식 옆에 디바이스가 리스트된 것을 확인할 수 있습니다. 이에 대한 클릭은 페이지를 조사(inspect)하고 디버깅하는 Weinre 인스턴스를 실행할 것입니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image01.png">
  <figcaption>연결된 디바이스들은 Weinre 디버거의 실행에 쓰이는 <> 표식 뒤에 나타납니다.</figcpation>
</figure>

Weinre는 DOM 뷰어 그리고 콘솔이며 Chrome 개발자도구에 비해 자바스크립트 디버깅, 프로파일링, 네트워크 폭포수(Waterfall) 보기 같은 기능들이 부족합니다. 개발자 도구의 가장 기본적인 것이긴 하지만 DOM 및 자바스크립트 상태의 온전한-검사에 유용합니다.


<figure>
  <img src="/static/images/screenshots/crossdevice/image13.png">
  <figcaption>Weinre를 통한 디버깅</figcpation>
</figure>

Edge Inspect 익스텐션은 또한 연결된 디바이스들로부터 손쉬운 스크린샷 생성을 제공합니다. 레이아웃 테스팅이나 다른 사람들과 공유하기 위한 페이지의 캡쳐를 얻는 정도에는 유용합니다.


<figure>
  <img src="/static/images/screenshots/crossdevice/image04.png">
  <figcaption>Edge Inspect의 스크린샷 생성</figcpation>
</figure>

CC를 이미 구입한 개발자들에게 Edge Inspect는 훌륭한 솔루션입니다. 그러나 각 디바이스는 전용의 클라이언트들이 설치되어야 하며 Ghostlab와 같은 대체 솔루션에서는 알 수 없었던 약간의 추가 설치 작업을 필요로 하는 것과 같은 몇가지 주의할 점이 있습니다.

<h3 id="toc-remotepreview">Remote Preview (Mac, Windows, Linux)</h3>

[Remote Preview](http://viljamis.com/blog/2012/remote-preview/)는 호스팅 중인 HTML 페이지와 컨텐츠를 다양한 디바이스에서 디스플레이할 수 있는 오픈 소스 도구입니다.

Remote preview는 설정 파일내의 URL이 변경되었는지 확인하기 위해 매 1100ms의 간격마다 XHR 호출을 실행합니다. 만약 변경되었다면 스크립트는 각 디바이스에서 페이지를 로딩하고 있는 iframe의 src 속성을 갱신하고 페이지를 그 안에 로딩합니다. 만약 아무 변경도 검출되지 않는 다면 스크립트는 변경이 발생할 때까지 폴링(Polling)을 지속할 것입니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image16.gif">
  <figcaption>27개 이상의 디바이스에서 동기화된 URL 테스팅</figcpation>
</figure>

이는 디바이스를 하나로 엮고 그들 모두에 대한 손쉬운 URL 변경을 위해 훌륭합니다. 시작하는 방법은 다음과 같습니다.

<ol>
<li>Remote Preview <a href="https://github.com/viljamis/Remote-Preview">다운로드</a>하고 모든 파일들을 액세스 가능한 로컬 서버로 이동합니다. 드롭박스(Dropbox), 개발 서버 혹은 다른 솔루션을 사용해도 무방합니다.</li>
<li>이 다운로드로부터 "index.html"을 모든 대상 디바이스 위에 로딩합니다. 이 페이지는 일종의 드라이버(Driver)처럼 사용될 것이며 iframe을 이용하여 테스트하기를 원하는 페이지를 로딩할 것입니다.</li>
<li>(다운로드와 지금부터 사용할 서버를 포함하여) "url.txt"를 미리보고 싶은 URL로 편집하고 저장합니다.</li>
<li>Remote Preview는 url.txt 파일이 변경된 것을 알아차리고 모든 연결된 디바이스들에 여러분의 URL을 로딩하도록 새로고침을 수행할 것입니다.</li>
</ol>

충분하지는 않은 솔루션이지만, Remote Preview는 무료인데다 동작합니다.


<h3 id="toc-gruntlivereload">Grunt + Live-Reload (Mac, Windows, Linux)</h3>

[Grunt](http://gruntjs.com) (그리고 [Yeoman](http://yeoman.io))은 프론트엔드에서 스캐폴딩과 프로젝트 구축에 서용되는 커맨드라인 도구입니다. 만약 이미 이 도구들을 사용하며 live-reload를 설치한 상태라면 로컬 앱을 열고있는 어떠한 디바이스에서도 편집기에서 생기는 각각의 변경에 대한 새로고침을 발생하는 크로스-디바이스 테스팅을 가능하게 하는 작업흐름을 갱신하는 것은 쉽습니다.

여러분은 아마 `grunt server`를 사용하고 있을 것입니다. 이를 프로젝트의 루트 디렉토리에서 실행할 때 소스 파일들에 대한 변경을 감시하고 자동으로 브라우저 윈도우를 새로고침할 것입니다. 서버의 한 부분처럼 동작하는 grunt-contrib-watch 태스크에 감사할 따름입니다.

프로젝트의 기초 골조를 생성하기 위해 Yeoman을 사용할 때가 있다면 데스크탑 상에서 live-reload를 동작하는데 필요한 모든 것을 가지는 Gruntfile을 이미 생성했을 것입니다. 크로스-디바이스에 대한 기능적인 부분을 얻기 위해 (데스트탑 상의) `hostname` 속성 하나만 수정하면 됩니다. 이는 `connect` 밑에 나열되어 있을 것입니다. 만약 `hostname`이 `localhost`로 설정하려면 0.0.0.0으로만 변경하면 됩니다. 다음으로 `grunt server`를 실행하고 평상시처럼 페이지의 미리보기를 표시할 새로운 윈도우를 열어둡니다. URL은 아마 [http://localhost:9000](http://localhost:9000)처럼 보일 것입니다. (9000은 포트 번호입니다.) 

새로운 탭이나 터미널을 열고 시스템의 내부 IP를 찾기 위해 `ipconfig | grep inet`를 사용합니다. `192.168.32.20`같은 것을 볼 수 있을 것입니다. 마지막 단계로 크롬같은 브라우저를 실시간 새로고침(livereloads)를 동기화하기 위한 디바이스에서 열고 이 IP 주소를 앞에서부터 포트 번호까지 타이핑합니다. 예를 들어 `192.169.32.20:9000`처럼.

이게 전부입니다! Live-reload는 이제 데스크탑에서 소스 파일에 대한 편집마다 데스크탑 브라우저 *와* 모바일 디바이스의 브라우저 모두에서 새로고침을 발생할 것입니다. 훌륭합니다!

<figure>
  <img src="/static/images/screenshots/crossdevice/image09.jpg">
  <figcaption>데스크탑에서 편집사항의 저장은 이제 데스크탑 브라우저뿐만이 아니라 같은 URL을 사용하는 디바이스의 모바일 브라우저에서도 실시간 새로고침(live-reload)를 발생할 것입니다.</figcpation>
</figure>

<p>&nbsp;</p>

<figure>
  <img src="/static/images/screenshots/crossdevice/image15.gif">
  <figcaption>크로스 디바이스 실시간 새로고침(live-reload)의 동작. 현재 페이지의 각 편집/저장마다 반응형 디자인에 대해 훌륭한 실시간 테스팅을 제공합니다.</figcpation>
</figure>

또한 Yeoman은 이 작업흐름을 손쉽게 설정하기 하는 것이 가능한 [Mobile generator](https://github.com/yeoman/generator-mobile)를 가지고 있습니다.

<h3 id="toc-emmetlivestyle">Emmet LiveStyle</h3>

Emmet LiveStyle은 여러분의 개발 작업흐름에 실시간 CSS 편집을 제공하는 브라우저 및 편집기 플러그인입니다. 현재는 크롬, 사파리 그리고 Sublime Text에서 지원이 가능하며 양방향 편집(에디터에서 브라우저로 그리고 반대로)을 제공합니다.

Emmet LiveStyle은 변경이 발생했을 때 완전한 브라우저 새로고침을 강제하지 않습니다만, 대신 개발자도구(DevTools)의 원격 디버깅 프로토콜을 통해 CSS 편집 사항을 밀어넣습니다. 이것은 데스크탑 크롬이나 안드로이드 크롬 등 연결된 어떠한 크롬 버전에서도 데스크탑 편집기에서 발생한 변경들을 확인할 수 있다는 것을 의미합니다.

LiveStyle은 윈도우들과 디바이스들 사이의 반응형 디자인 수정과 테스팅에 이상적인 "다중-뷰 모드(multi-view mode)"라고 불리는 것을 가지고 있습니다. 다중-뷰 모드(Multi-view mode)에서 모든 편집기는 개발자도구(DevTools)에서 같은 페이지에 대해 갱신하는 것과 마찬가지로 모든 윈도우에 적용 사항을 갱신합니다.

**LiveStyle 패키지의 설치와 함께 실시간 CSS 편집을 시작하기 위한 방법은 다음과 같습니다.**


<ol>
<li>Sublime Text를 시작하고 프로젝트에서 CSS 파일을 엽니다.</li>
<li>크롬을 시작하고 수정하고 싶은 CSS가 있는 페이지로 갑니다.</li>
<li>개발자도구(DevTools)를 열고 LiveStyle 패널로 갑니다. "Enable LiveStyle" 옵션을 체크합니다. Note: 개발자도구는 적용할 스타일의 갱신 순서대로 각 윈도우의 실시간 편집기 세션이 열고 유지하려고 할 것입니다.</li>
<li>이것이 활성화되면 스타일시트의 리스트가 왼쪽에 나타날 것이며 편집기 파일 리스트가 오른쪽에 나타날 것입니다. 브라우저와 관계된 편집기 파일을 선택하시면 됩니다. 이것이 전부입니다! 짜잔</li>
</ol>

이제 편집기 파일들의 리스트는 파일의 편집, 생성, 열기 혹은 닫기 시에 자동으로 업데이트될 것입니다.

<figure>
  <img src="/static/images/screenshots/crossdevice/image07.gif">
  <figcaption>Sublime에서 CSS의 변경이 즉시 각기 다른 브라우저 윈도우들과 에뮬레이터에 반영되는 중.</figcpation>
</figure>

<h2 id="toc-conclusions">결론</h2>

크로스 디바이스 테스팅은 개발 중인 많은 도전자들로 여전히 새롭고 빠르게 움직이는 세상에 있습니다. 고맙게도 폭넓고 많은 디바이스 세트들에 대한 테스팅과 호환성을 보증하는 많은 수의 무료/유료 도구들도 이미 있습니다.

즉, 이 영역에서 여전히 개선에 대한 많은 잠재력이 있으며 디바이스들간의 테스팅을 더 많이 개선하기 위해 어떻게 도구화를 할 것인지에 대해 고려할 수 있도록 합니다. 설치 시간을 줄이고 크로스 디바이스의 작업흐름을 개선할 수 있는 것이라면 무엇이든 좋습니다.

<h3 id="toc-issues">이슈들</h3>

이 도구들로 테스팅을 하는 동안 아마도 가장 큰 이슈들은 디바이스의 정기적인 잠자기(Sleep) 모드 진입일 것입니다. 이것은 규칙을 깨는 것(Deal-breaker)은 아니지만 얼마 뒤에는 짜증을 유발합니다. 작업을 하는 동안 디바이스들을 잠자지 않도록 설정하는 것은 좋은 아이디어입니다만 배터리를 잡아 먹을 수 있어 계속 전원을 연결해두어야 한다는 사실도 기억하시기 바랍니다.

개인적으로 Ghostlab을 운용하는 동안 어떠한 중대한 문제도 없었습니다. 몇몇 사람은 $49가 약간 터무니없는 가격이라고 할 지 모르지만 만약 이를 자주 사용하고자 한다면 스스로를 위해 조금 더 혹은 덜 지불할 수도 있다는 것을 기억하시기 바랍니다. 설치와 관련된 가장 좋은 것들 중 한가지는 대상 디바이스마다 클라이언트의 설치와 관리에 대해 걱정할 필요가 없다는 것입니다. 같은 URL로 어디서든지 동작합니다.

Adobe Edge Inspect의 경우 각 디바이스별로 특정한 클라이언트를 설치하고 사용해야 한다는 것이 약간 번거롭기는 합니다. 또한 연결된 디바이스 모두가 견고하게 새로고침되지 않기도 하여 크롬 익스텐션에서 이것을 직접 해야한다는 것도 확인했습니다. 또한 Creative Cloud의 구독(subscription)이 필요하며 디바이스에서 선택할 수 있는 브라우저 대신에 클라이언트에서 사이트를 로딩해야 하는 제한도 있습니다. 이것은 아마 테스트를 속도에 제한이 될 것입니다.

Remote Preview는 알려진 바와 같은 기능을 가지고 있지만 정말로 가볍습니다. 이는 디바이스들 간에 사이트를 새로고침하는 것 이외에는 아무것도 없다는 것과 좀 더 발전된 도구화 옵션이 필요할 것이라는 뜻입니다. 동기화된 클릭이나 스크롤을 굳이 예로 들 필요도 없을 것입니다.

<h2 id="toc-recommendations">추천</h2>

만약 시작할만한 무료 크로스 플랫폼 솔루션을 찾고 있다면 Remote Preview의 사용을 권할 것입니다. 기업에서 유료 솔루션을 찾는 경우는 GhostLab이 경험상 항상 훌륭했었지만 이는 Mac에서만 가능합니다. 윈도우 사용자들에게는 Adobe Edge Inspect가 가장 훌륭한 선택이며 몇가지 이상한 점만 뺀다면 일반적으로 작업을 잘 마무리할 수 있습니다.

grunt와 LiveStyle 역시 개발 중 증가되는 실시간 반복 작업에 훌륭합니다.
