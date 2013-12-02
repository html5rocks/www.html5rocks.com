<h2 id="toc-intro">소개<!--Introduction--></h2>

만약 여러분이 멀티-디바이스 웹을 목표로 하고 있다면, 사이트와 웹 앱을 많은 수의 디바이스와 설정 전체에 걸쳐 테스트해야만 할 것입니다. 동기화된 테스팅은 이를 도와줄 수 있으며 동시에 디바이스들과 브라우저들 전체에 걸쳐 동일한 인터랙션을 자동으로 수행하기 위한 효과적인 방법입니다.
<!-- If you're a web developer targeting the multi-device web, you likely have to 
test your sites and web apps across a number of different devices and 
configurations. Synchronized testing can help here and is an effective way to 
automatically perform the same interaction across a number of devices and 
browsers at the same time. -->

다음과 같이 동기화된 테스팅은 특히 2개의 시간-소모적인 문제들을 풀도록 도와줄 수 있을 것입니다.
<!-- Synchronized testing can help solve two particularly time-consuming problems: -->

* **여러분이 시험하기를 원하는 URL을 이용하여 모든 디바이스들이 동기화를 유지하기.** 수동적으로 각 디바이스 상에 로딩하는 것은 꽤나 예전의 일이며, 시간이 오래 걸리는데다 반복적으로 실패하기 더 쉽게 만듭니다.
<!-- * **Keeping all your devices in sync with the URL you want to test.** Manually 
  loading them on each device is so yesterday, takes longer and makes it easier 
  to miss out on regressions. -->
* **인터랙션 동기화하기.** 페이지를 로딩할 수 있는 것은 시각적인 테스팅에 훌륭하지만 인터랙션 테스팅 역시 이상적으로 스크롤, 클릭 그리고 다른 행위들을 동기화할 수 있기를 원할 것입니다.
<!-- * **Synchronizing interactions.** Being able to load up a page is great for 
  visual testing, but for interaction testing you ideally also want to be able 
  to synchronize scrolls, clicks and other behaviours.  -->

여러분의 대상 디바이스 중 몇개에 액세스하기를 원한다면 고맙게도 데스크탑에서 모바일 디바이스로의 흐름을 개선하는데 중점을 둔 많은 도구들이 있습니다. 이 글에서 우리는 Ghostlab, Remote Preview, Adobe Edge Inspect와 Grunt를 살펴보고자 합니다.
<!-- Thankfully if you have access to some of your target devices, there are a number 
of tools aimed at improving the flow from your desktop to your mobile devices. 
In this article, we will look at Ghostlab, Remote Preview, Adobe Edge Inspect 
and Grunt. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image10.jpg">
  <figcaption>제 책상입니다. 음, 제 책상으로 쓰였던 것입니다. 이제는 그냥 모바일 박물관일뿐입니다.<!-- This is my desk. Well, it used to be my desk. It's now just a mobile museum. --></figcpation>
</figure>


<h2 id="toc-tools">도구들<!-- Tools --></h2>

<h3 id="toc-ghostlab">GhostLab (Mac)</h3>

<figure>
  <img src="/static/images/screenshots/crossdevice/image00.png">
  <figcaption>Vanamco의 Mac용 Ghostlab<!-- GhostLab for Mac by Vanamco --></figcpation>
</figure>

[Ghostlab](http://vanamco.com/ghostlab/)은 사이트와 웹 앱들을 다양한 디바이스들에서 테스트하기 위한 상용 맥 어플리케이션($49)입니다. 다음과 같이 최소의 설정으로 동기화된 시뮬레이션을 할 수 있습니다.
<!-- [Ghostlab](http://vanamco.com/ghostlab/) is a commercial Mac application ($49) 
designed to synchronise testing for sites and web apps across multiple devices. 
With minimum setup it allows you to simultaneously sync: -->

* 클릭
* 네비게이션
* 스크롤
* 폼 입력 (예. 로그인 폼들, 가입)
<!-- * Clicks
* Navigation
* Scrolls
* Form input (e.g login forms, sign-up) -->

이것은 여러가지의 디바이스들에서 매우 간단하게 사이트의 구석구석에 대한 사용자 경험(Experience)를 테스트할 수 있게 합니다. 일단 페이지를 디바이스 상의 브라우저에서 열고나면 (새로고침을 포함하여) 탐색을 위한 어떠한 변화들이라도 연결된 다른 디바이스들에 즉시 연동됩니다. Ghostlab은 로컬 디렉토리들의 감시를 지원하므로 로컬 파일들의 편집 사항들을 저장이 발생할 때 역시 자동으로 연동되며 언제나 모든 것이 동기화된 상태로 유지됩니다!
<!-- This makes testing your site's end-to-end user experience on multiple devices 
very straightforward. Once you've opened your page in a browser on your devices, 
any changes to navigation (including refreshes) cause any other connected 
devices to refresh instantly. Ghostlab supports watching local directories, so 
this refresh also happens when you save edits to local files, keeping everything 
in sync always! -->

저는 Ghostlab를 설치하기 위한 괴롭지 않은 프로세스를 정립했습니다. 시작을 위해 [트라이얼](http://awesome.vanamco.com/downloads/ghostlab/latest/Ghostlab.dmg) (혹은 여러분이 구입할 생각이시라면 풀 버전)을 다운로드, 설치하고 실행하시기 바랍니다. 그런 다음 여러분의 맥과 테스트하기를 원하는 디바이스들을 연결하고 싶다면 동일한 Wifi 네트워크에 있어야 디바이스들을 탐색할 수 있습니다.
<!-- I found setting up Ghostlab a painless process. To get started, download, 
install and run the 
[trial](http://awesome.vanamco.com/downloads/ghostlab/latest/Ghostlab.dmg) (or 
full version if you're in the buying mood). You will then want to connect your 
Mac and the devices you wish to test to the same Wifi network so that they're 
discoverable. -->

일단 Ghostlab이 동작하고 나면, "+"를 눌러 테스팅을 위한 URL을 추가하거나 간단하게 "+"을 브라우저의 주소 참으로 드래그할 수 있습니다. 그 대신, 테스트하기 원하는 로컬 폴더를 메인 윈도우에 드래그하면 새로운 사이트 항목이 생성될 것입니다. 이 글에서 저는 [http://html5rocks.com](http://html5rocks.com)의 라이브 버전을 테스트하고 있습니다. 건방진가요, 네? ; )
<!-- Once Ghostlab is running, you can either click "+" to add a URL for testing or 
simply drag it from your browser's address bar. Alternatively, drag the local 
folder you wish to test over into the main window and a new site entry will be 
created. For this article, I'm testing a live version of 
[http://html5rocks.com](http://html5rocks.com). Cheeky, eh? ; ) -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image06.png">
  <figcaption>여러분의 머신 상의 URL이나 로컬 디렉토리를 선택하세요.<!-- Choose a URL or local directory on your machine --></figcpation>
</figure>

그 뒤에 사이트 명의 옆에 있는 ">" 플레이 버튼을 클릭하는 것으로 신규 Ghostlab 서버를 실행할 수 있습니다. 이것은 여러분의 네트워크에 한정하여 유요한 IP 주소(예. [http://192.168.21.43:8080](http://192.168.21.43:8080))에서 새로운 서버를 시작합니다.
<!-- You can then kick-start off a new Ghostlab server by clicking the ">" play 
button next to the name of your site. This starts a new server, available at an 
IP address specific to your network (e.g 
[http://192.168.21.43:8080](http://192.168.21.43:8080)). -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image11.jpg">
  <figcaption>URL로부터 로컬에 대한 컨텐츠를 프록시할 Ghostlab 서버<!-- Ghostlab server locally proxying content from our URL --></figcpation>
</figure>

여기, Ghostlab이 제게 준 IP 주소로 제가 접속했던 Nexus 4와 특정했던 안드로이드용 크롬입니다. 저기 모든 것을 해야 합니다. Ghostlab은 몇몇 다른 솔루션들처럼 디바이스마다 전용의 클라이언트를 설치하는 것을 필요로 하지 않으며 이는 여러분이 한층 더 빠르게 테스팅을 시작할 수 있다는 것을 뜻합니다.
<!-- Here, I've connected up a Nexus 4 and pointed Chrome for Android to the IP 
address Ghostlab gave me. That's all I have to do. Ghostlab doesn't require that 
you install a dedicated client per device like some other solutions and it means 
you can start testing even more quickly.  -->

Ghostlab URL로 접속하는 어떠한 디바이스도 Ghostlab의 메인 윈도우 오른편에 위치한 사이드바 내의 연결된 클라이언트 리스트에 추가될 것입니다. 디바이스 명을 더블클릭하면 스크린 크기, OS 등과 같은 추가적인 정보를 표시합니다. 이제 여러분은 테스트의 탐색과 클륵들의 동기화를 할 수 있을 것입니다! 야호.
<!-- Any device you connect to the Ghostlab URL will be added to the list of 
connected clients in the sidebar to the right of the main Ghostlab window. 
Double-clicking the device name displays additional details such as the screen 
size, OS and so on. You should now be able to test navigating and synchronizing 
clicks! Yay. -->

Ghostlab은 또한 UA 문자열, 뷰포트의 너비(width)와 높이(height), 디바이스의 픽셀의 화소밀도(Pixel Density), 영상비(Aspect Ratio) 등의 연결된 디바이스에 대한 몇가지 상태를 출력할 수도 있습니다. 언제던지, 항목 옆의 설정 아이콘(Cog) 클릭을 통해 조사 중인 기본 URL을 수동으로 변경할 수 있습니다. 이는 아래와 같이 보이는 설정 윈도우를 열 것입니다.
<!-- Ghostlab is also able to display some stats about connected devices like the UA 
string, viewport width and height, device pixel density, aspect ratio and more. 
At any time, you can manually change the base URL you are inspecting by clicking 
the settings cog next to an entry. This opens up a configuration window that 
looks like the below: -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image05.png">
  <figcaption>와치(Watch), HTTP 헤더, 문자세트 등을 위한 설정 파일들<!-- Configure files to watch, HTTP headers, character sets and more. --></figcpation>
</figure>

이제 다른 디바이스들 중 하나를 선택할 수 있으며 HTML5Rocks에 관련된 다른 링크의 클릭 및 탐색이 모든 디바이스들뿐만이 아니라 데스크탑의 (동일한 Ghostlab URL로 접속한) 크롬과도 동기화할 수 있습니다.
<!-- I can now select one of my other connected devices, click on different links 
around HTML5Rocks and the navigation is synchronized both on my desktop Chrome 
(where I entered in the same Ghostlab URL) as well as across all of my devices.  -->

더 좋은 점은 Ghostlab이 네트워크를 통해 가는 모든 링크들에 대한 프록시를 지원하는 옵션이 있다는 것입니다. 따라서 (예를 들어) [http://192.168.21.43:8080/www.html5rocks.com](http://192.168.21.43:8080/www.html5rocks.com) 상에서 다른 솔루션에서 괴롭혀왔던 자동적인 디바이스 간의 새로고침이 깨질 수 있는 [www.html5rocks.com/en/performance](http://www.html5rocks.com/en/performance)로 링크를 클릭하는 것 대신 이 링크를 단순히 [http://192.168.21.43/www.htm5rocks.com/en/performance](http://192.168.21.43/www.htm5rocks.com/en/performance)로 변환할 수 있어 네비게이션이 모든 디바이스간에 완전히 매끄럽게(Seamless) 동작합니다.
<!-- What's even better is that Ghostlab has an option allowing you to proxy all 
links going through the network so that instead of a click on 
[http://192.168.21.43:8080/www.html5rocks.com](http://192.168.21.43:8080/www.html5rocks.com) 
navigating to [www.html5rocks.com/en/performance](http://www.html5rocks.com/en/performance) 
(for example), which would break the automatic cross-device refresh suffered by 
other solutions, it can just translate this link into 
[http://192.168.21.43/www.htm5rocks.com/en/performance](http://192.168.21.43/www.htm5rocks.com/en/performance) 
so that navigating is completely seamless across all my devices. -->

이를 가능하게 하도록 하기 위해 "Content Loading" 탭 내의 "Load all content through Ghostlab"를 체크하시기 바랍니다.
<!-- To enable, check "Load all content through Ghostlab" under the "Content Loading" tab. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image08.png">
  <figcaption>Ghostlab URL들을 재생성할 수 있으므로 모든 리소스들은 Ghostlab 프록시를 통해 로딩됩니다. 다수의 페이지들로의 탐색을 동기화하는데 유용합니다.<!-- Ghostlab can rewrite URLs so all resources are loaded through the Ghostlab proxy. Useful for synchronizing navigations to multiple pages --></figcpation>
</figure>

다음과 같이 이 동작을 보도록 하겠습니다.
<!-- Seeing it in action: -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image18.jpg">
  <figcaption>Ghostlab을 이용한 안드로이드, 윈도우8 및 파이어폭스 OS 폰의 테스팅 동기화<!-- Synchronized testing of an Android, Windows 8 and Firefox OS phone with Ghostlab --></figcpation>
</figure>

Ghostlab은 어떠한 지원 브라우저들에서 원하는 갯수만큼의 사이트나 윈도우를 로딩하는 것이 가능합니다. 이는 사이트를 다른 해상도에서 테스트만이 아니라 여러분의 코드가 각기 다른 브라우저들과 플랫폼 상에서 어떻게 동작하는지를 테스트해 볼 수 있습니다. 야호!
<!-- Ghostlab is capable of loading any number of sites or windows across any 
supported browser. This doesn't just let you test your site at different 
resolutions, but how your code behaves on different browsers and platforms. Yay! -->

<figure>
  <img src="/static/images/screenshots/crossdevice/ghostlabanim.gif">
  <figcaption>모든 테스트 디바이스들 간의 스크롤, 언어 그리고 탐색 동기화<!-- Synchronizing scroll, clicks and navigation across all of the test devices --></figcpation>
</figure>

Ghostlab은 미리보기를 할 프로젝트 작업공간(Workspace)의 설치를 설정할 수 있도록 하며 디렉토리의 변경을 감시하고 변경의 검출 시 새로고치는 것과 같은 것을 지정할 수 있습니다. 이는 변경들이 모든 연결된 클라이언트들의 새로고침을 발생시킨다는 뜻입니다. 더 이상의 수동 새로고침은 없습니다!
<!-- Ghostlab allows you to configure the setup for the project workspace you're 
previewing and you can specify whether you would like changes to the directory 
to be watched and refreshed when detected. This means changes cause all 
connected clients to be refreshed. No more manual refreshes! -->

Ghostlab이 도와줄 수 있는 다른 것들에 놀랄 수도 있습니다. 확실한 스위스-아미 나이프는 아니지만 연결된 디바이스 상에서의 원격 코드 감시 또한 지원합니다. 주 인터페이스를 통해, 아무 디바이스 이름 위에서의 더블클릭은 여러분이 플레이 [Chrome DevTools](http://devtools.chrome.com)의 버전을 런칭하는 "디버그" 옵션을 실행합니다.
<!-- You may be wondering what else Ghostlab can help with. Whilst it's certainly not 
a swiss-army knife, it also supports remote code inspection on connected 
devices. Through the main interface, double-clicking on any device name should 
bring up a "debug" option which will launch a version of the [Chrome DevTools](http://devtools.chrome.com) for 
you to play around with.  -->

Ghostlab은 연결된 디바이스들 상에서 스크립트를 디버깅하거나 스타일들을 수정할 수 있도록 하는 [Weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/) 원격 웹 인스펙터를 엮음으로써 이것을 가능하게 합니다. 엘리먼트들을 선택하고 몇가지 성능 프로파일링과 스크립트 디버깅을 할 수 있는 크롬 안드로이드에서 가능한 [원격디버깅(remote debugging)](https://developers.google.com/chrome-developer-tools/docs/remote-debugging)과 유사합니다.
<!-- Ghostlab makes this possible via the bundled [Weinre](http://people.apache.org/~pmuellr/weinre/docs/latest/) remote web inspector, which 
lets you debug scripts and tweak styles on connected devices. Similar to the [remote debugging](https://developers.google.com/chrome-developer-tools/docs/remote-debugging) experience available for Chrome for Android, you can select elements, run some 
performance profiling and debug scripts.  -->

대체로 저는 디바이스들간의 일상적인 테스팅을 위해 얼마나 빠르게 Ghostlab을 사용할 수 있는지가 인상적이었습니다. 여러분이 만약 프리랜서라면 상업 라이센스의 비용이 약간 높다는 (더 많은 선택 사항은 아래에서 보시길) 것을 알 수 있었을 것입니다. 그러나, 개인적으로는 전 Ghostlab 이외의 것들도 추천해줄 수 있어서 행복합니다.
<!-- All in all, I was impressed with how quickly I was able to use Ghostlab for 
everyday testing across devices. If you're a freelancer, you might find the cost 
of the commerical license a little high (see below for more options).  However, 
I'm happy to recommend Ghostlab otherwise. -->

<h3 id="toc-edgeinspect">Adobe Edge Inspect CC (Mac, Windows)</h3>

<figure>
  <img src="/static/images/screenshots/crossdevice/image12.png">
  <figcaption>Edge Inspect을 포함한 Adobe Creative Cloud 서브스크립션</figcpation>
</figure>

Adobe Edge Inspect는 Adobe Creative Cloud 서브스크립션 패키지의 일부입니다만 무료 트라이얼처럼 사용할 수도 있습니다. (Edge Inspector 크롬 익스텐션을 통해) 크롬으로 다양한 iOS와 안드로이드 디바이스를 다루는 것을 가능하게 하므로 특별한 URL을 브라우징한다면 모든 연결된 디바이스들 전부를 동기화할 수 있습니다.
<!-- Adobe Edge Inspect is part of the Adobe Creative Cloud subscription package, but 
also comes available as a free trial. It allows you to drive multiple iOS and 
Android devices with Chrome (via the Edge Inspector Chrome extension), so that 
if you browse to a particular URL all of your connected devices stay in sync.  -->

설치를 위해서, 가장 먼저 [Adobe Creative Cloud](http://creative.adobe.com/) 계정을 생성하거나 이미 계정을 가지고 있다면 기존 계정으로 로그인합니다. 다음으로 [Edge Inspect](https://creative.adobe.com/inspect)을 다운로드하고 설치합니다. 가까이 두면 유용한 Edge Inspect를 위한 [문서](http://forums.adobe.com/docs/DOC-2535)을 주목하시기 바랍니다.

<!-- To get set up, first sign up for an [Adobe Creative 
Cloud](http://creative.adobe.com/) account or login to an existing account if 
you already have one.  Next, download and install [Edge 
Inspect](https://creative.adobe.com/inspect) from Adobe.com (available for Mac 
and Windows at present, but not Linux - sorry!).  Note the 
[docs](http://forums.adobe.com/docs/DOC-2535) for Edge Inspect are useful to 
keep at hand. -->

설치 뒤 연결된 디바이스들간의 브라우징을 동기화할 수 있는 크롬용 [Edge inspect extension](http://www.adobe.com/go/edgeinspect_chrome)을 얻기를 원할 수 있습니다.
<!-- Once installed, you'll want to get the [Edge inspect extension](http://www.adobe.com/go/edgeinspect_chrome) for Chrome so that you can synchronize browsing between connected devices.  -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image03.png">
  <figcaption>Edge Inspect CC 크롬 익스텐션<!-- The Edge Inspect CC Chrome Extension --></figcpation>
</figure>

동기화 액션들을 원하는 각 디바이스 상의 Edge Insepct 클라이언트의 설치 또한 필요할 수도 있을 것입니다. 고맙게도 
[iOS](http://www.adobe.com/go/edgeinspect_ios), 
[Android](http://www.adobe.com/go/edgeinspect_android) 그리고
[Kindle](http://www.adobe.com/go/edgeinspect_amazon)를 위한 클라이언트들이 사용가능합니다.
<!-- You will also need to install an Edge Inspect client on each device you wish to sync actions with. Thankfully clients are available for 
[iOS](http://www.adobe.com/go/edgeinspect_ios), 
[Android](http://www.adobe.com/go/edgeinspect_android) and 
[Kindle](http://www.adobe.com/go/edgeinspect_amazon). -->

뒤의 설치과정에서 이제 페이지들에 대한 감시들을 시작할 수 있습니다. 이것이 작동하려면 모든 장치가 동일한 네트워크에 연결되어 있는지 확인해야합니다.
<!-- With the installation process behind us, we can now start inspecting our pages. 
You'll need to make sure all your devices are connected to the same network for 
this to work.  -->

크롬에서 Edge Inspect 익스텐션을 통해 테스크톱 상의 Edge Inspect를 시작하고 그리고 나서 디바이스 상에서 앱을 시작합니다. (아래를 살펴보시기 바랍니다.)
<!-- Start up Edge Inspect on your desktop, the Edge Inspect extension in Chrome and then the app on your devices (see below): -->
<br/>

<figure>
  <img src="/static/images/screenshots/crossdevice/image02.png">
  <figcaption>디바이스의 Edge Inspect 익스텐션 연결<!-- Connecting a device up to the Edge Inspect extension --></figcpation>
</figure>

이제 데스크탑 상에서 HTML5Rocks.com 같은 사이트를 탐색하면 모바일 디바이스에서 동일한 페이지를 자동으로 탐색할 수 있습니다.
<!-- We can now navigate to a site like HTML5Rocks.com on desktop and our mobile 
device will automatically navigate to the same page. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image17.jpg">
  <figcaption>연결된 다양한 디바이스들 간의 URL의 탐색 제어<!-- Driving navigation of a URL across multiple connected devices --></figcpation>
</figure>

익스텐션에서 또한 아래 스크린샷에서 보다시피 <> 표식 옆에 디바이스가 리스트된 것을 확인할 수 있습니다. 이에 대한 클릭은 페이지를 조사(inspect)하고 디버깅하는 Weinre 인스턴스를 실행할 것입니다.
<!-- In the extension, you'll also now see your device listed with a <> symbol next 
to it as in the screenshot below. Clicking this will launch an instance of Weinre allowing you to inspect and debug your page.  -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image01.png">
  <figcaption>연결된 디바이스들은 Weinre 디버거의 실행에 쓰이는 <> 표식 뒤에 나타납니다.<!-- Connected devices appear with a <> symbol next to them, which can be used to launch the Weinre debugger --></figcpation>
</figure>

Weinre는 DOM 뷰어 그리고 콘솔이며 Chrome 개발자도구에 비해 자바스크립트 디버깅, 프로파일링, 네트워크 폭포수(Waterfall) 같은 기능들이 부족합니다.
개발자 도구의 가장 기본적인 것이긴 하지만 DOM 및 자바스크립트 상태의 온전한-검사에 유용합니다.
<!-- Weinre is a DOM viewer and console, and lacks features from the Chrome DevTools like JavaScript debugging, profiling, and network waterfall. While it is the bare minimum of developer tooling, it's useful for sanity-checking DOM and JavaScript state. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image13.png">
  <figcaption>Weinre를 통한 디버깅<!-- Debugging with Weinre --></figcpation>
</figure>

Edge Inspect 익스텐션은 또한 연결된 디바이스들로부터 손쉬운 스크린샷 생성을 제공합니다. 레이아웃 테스팅이나 다른 사람들과 공유하기 위한 페이지의 캡쳐를 얻는 정도에는 유용합니다.
<!-- The Edge Inspect extension also supports generating screenshots from connected devices with ease. Useful for layout testing or just getting captures of your page to share with others. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image04.png">
  <figcaption>Edge Inspect의 스크린샷 생성<!-- Screenshot generation with Edge Inspect --></figcpation>
</figure>

CC를 이미 구입한 개발자들에게 Edge Inspect는 훌륭한 솔루션입니다. 그러나 각 디바이스는 전용의 클라이언트들이 설치되어야 하며 Ghostlab와 같은 대체 솔루션에서는 알 수 없었던 약간의 추가 설치 작업을 필요로 하는 것과 같은 몇가지 주의할 점이 있습니다.
<!-- For developers already paying for CC, Edge Inspect is a great solution. It does 
however come with a few caveats such as each device requiring a dedicated client 
to be installed and a little extra setup work that you may not find with an 
alternative like Ghostlab.  -->

<h3 id="toc-remotepreview">Remote Preview (Mac, Windows, Linux)<!-- Remote Preview (Mac, Windows, Linux) --></h3>

[Remote Preview](http://viljamis.com/blog/2012/remote-preview/)는 호스팅 중인 HTML 페이지와 컨텐츠를 다양한 디바이스에서 디스플레이할 수 있는 오픈 소스 도구입니다.
<!-- [Remote Preview](http://viljamis.com/blog/2012/remote-preview/) is an open 
source tool where you host HTML pages and content that you can display on 
multiple devices. -->

Remote preview는 설정 파일내의 URL이 변경되었는지 확인하기 위해 매 1100ms의 간격마다 XHR 호출을 실행합니다. 만약 변경되었다면 스크립트는 각 디바이스에서 페이지를 로딩하고 있는 iframe의 src 속성을 갱신하고 페이지를 그 안에 로딩합니다. 만약 아무 변경도 검출되지 않는 다면 스크립트는 변경이 발생할 때까지 폴링(Polling)을 지속할 것입니다.
<!-- Remote preview executes an XHR call at an interval of every 1100ms to check if a 
URL in a configuration file has changed. If it finds that it has, the script 
updates the src attribute of an iframe loaded into the page for each device, 
loading the page into it. If there are no changes detected, the script will 
continue polling until a change is made. -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image16.gif">
  <figcaption>27개 이상의 디바이스에서 동기화된 URL 테스팅<!-- Synchronized URL testing across 27+ devices --></figcpation>
</figure>

이는 디바이스를 하나로 엮고 그들 모두에 대한 손쉬운 URL 변경을 위해 훌륭합니다. 다음과 같이 시작할 수 있습니다.
<!-- This is great for chaining devices together and easily changing a URL across all 
of them. To get started: -->

<ol>
<li>Remote Preview <a href="https://github.com/viljamis/Remote-Preview">다운로드<!-- Download --></a>하고 모든 파일들을 액세스 가능한 로컬 서버로 이동합니다. 드롭박스(Dropbox), 개발 서버 혹은 다른 솔루션을 사용해도 무방합니다.<!-- Remote Preview and move all of the files for it into a locally accessible server. This can be Dropbox, 
a development server or something else.  --></li>
<li>이 다운로드로부터 "index.html"을 모든 대상 디바이스들상에 로딩합니다. 이 페이지는 일종의 드라이버(Driver)처럼 사용될 것이며 iframe을 이용하여 테스트하기를 원하는 페이지를 로딩할 것입니다.<!-- Load up "index.html" from this download on all of your target devices. This 
page will be used as a driver and will load up the page you want to test using 
an iframe. --></li>
<li>(다운로드와 지금부터 사용할 서버를 포함하여) "url.txt"를 미리보고 싶은 URL로 편집하고 저장합니다.<!-- Edit "url.txt" (included in the download and now served on your server) with 
the URL you wish to preview. Save this file. --></li>
<li>Remote Preview는 url.txt 파일이 변경된 것을 알아차리고 모든 연결된 디바이스들에 여러분의 URL을 로딩하도록 새로고침을 수행할 것입니다.<!-- Remote Preview will notice that the url.txt file has changed and will refresh 
all connected devices to load up your URL. --></li>
</ol>

충분하지는 않은 솔루션이지만, Remote Preview는 무료인데다 동작합니다.
<!-- Whilst a lo-fi solution, Remote Preview is free and works. -->

<h3 id="toc-gruntlivereload">Grunt + Live-Reload (Mac, Windows, Linux)</h3>

[Grunt](http://gruntjs.com) (그리고 [Yeoman](http://yeoman.io))은 프론트엔드에서 스캐폴딩과 프로젝트 구축에 서용되는 커맨드라인 도구입니다. 만약 이미 이 도구들을 사용하며 live-reload를 설치한 상태라면 로컬 앱을 열고있는 어떠한 디바이스에서도 편집기에서 생기는 각각의 변경에 대한 새로고침을 발생하는 크로스-디바이스 테스팅을 가능하게 하는 작업흐름을 갱신하는 것은 쉽습니다.
<!-- [Grunt](http://gruntjs.com) (and [Yeoman](http://yeoman.io)) are command-line 
tools used for scaffolding and building projects on the front-end. If you're 
already using these tools and have live-reload setup, it's easy to update your 
workflow to enable cross-device testing where each change you make in your 
editor causes a reload in any of the devices you've opened up your local app on. -->

여러분은 아마 `grunt server`를 사용하고 있을 것입니다. 프로젝트의 루트 디렉토리에서 실행할 때, 소스 파일들에 대한 변경을 감시하고 자동으로 브라우저 윈도우를 새로고침할 것입니다. 이는 서버의 한 부분처럼 동작하는 grunt-contrib-watch 태스크에 감사할 일입니다.
<!-- You're probably used to using `grunt server`. When run from the root directory 
of your project, it watches for any changes to your source files and 
automatically refreshes the browser window. This is thanks to the 
grunt-contrib-watch task which we run as part of the server. -->

프로젝트의 기초 골조를 생성하기 위해 Yeoman을 사용할 때가 있다면 데스크탑 상에서 live-reload를 동작하는데 필요한 모든 것을 가지는 Gruntfile을 생성했을 것입니다. 크로스-디바이스에 대한 기능적인 부분을 얻기 위해 (데스트탑 상의) `hostname` 속성 하나만 수정하면 됩니다. 이는 `connect` 밑에 나열되어 있을 것입니다. 만약 `hostname`이 `localhost`로 설정하려면 0.0.0.0으로만 변경하면 됩니다. 다음으로 `grunt server`를 실행하고 평상시처럼 페이지의 미리보기를 표시할 새로운 윈도우를 열어둡니다. URL은 아마 [http://localhost:9000](http://localhost:9000)처럼 보일 것입니다. (9000은 포트 번호입니다.) 
<!-- If you happen to have used Yeoman to scaffold out your project, it will have 
created a Gruntfile with everything you need to get live-reload working on your 
desktop. To get it functioning cross-device, you just need to change one 
property, which is the `hostname` (on your desktop). It should be listed under 
`connect`. If you notice `hostname` is set to `localhost` just change it to 
0.0.0.0. Next run `grunt server` and as usual, a new window should open 
displaying a preview of your page. The URL will probably look like 
[http://localhost:9000](http://localhost:9000) (9000 is the port).  -->

새로운 탭이나 터미널을 열고 시스템의 내부 IP를 찾기 위해 `ipconfig | grep inet`를 사용합니다. `192.168.32.20`같은 것을 볼 수 있을 것입니다. 마지막 단계로 크롬같은 브라우저를 실시간 새로고침(livereloads)를 동기화하기 위한 디바이스에서 열고 이 IP 주소를 앞에서부터 포트 번호까지 타이핑합니다. 예를 들어 `192.169.32.20:9000`처럼.
<!-- Fire up a new tab or terminal and use `ipconfig | grep inet` to discover your 
system's internal IP. It may look like `192.168.32.20`. The last step is to open 
up a browser like Chrome on the device you would like to synchronize livereloads 
to and type in this IP address followed by the port number from earlier. i.e 
`192.169.32.20:9000`. -->

이게 전부입니다! Live-reload는 이제 데스크탑에서 소스 파일에 대한 편집마다 데스크탑 브라우저 *와* 모바일 디바이스의 브라우저 모두에서 새로고침을 발생할 것입니다. 훌륭합니다!
<!-- That's it! Live-reload should now cause any edits you make to source files on 
your desktop to trigger reloads in both your desktop browser *and* the browser 
on your mobile device. Awesome! -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image09.jpg">
  <figcaption>데스크탑에서 편집사항의 저장은 이제 데스크탑 브라우저뿐만이 아니라 같은 URL을 사용하는 디바이스의 모바일 브라우저에서도 실시간 새로고침(live-reload)를 발생할 것입니다.<!-- Saved edits on desktop now trigger a live-reload in your desktop browser as well as mobile browsers on devices with the same URL --></figcpation>
</figure>

<p>&nbsp;</p>

<figure>
  <img src="/static/images/screenshots/crossdevice/image15.gif">
  <figcaption>크로스 디바이스 실시간 새로고침(live-reload)의 동작. 현재 페이지의 각 편집/저장마다 반응형 디자인에 대해 훌륭한 실시간 테스팅을 제공합니다.<!-- Cross-device live-reload in action. Each edit/save gives you a real-time for of your current page, great for responsive design testing. --></figcpation>
</figure>

또한 Yeoman은 이 작업흐름을 손쉽게 설정하기 하는 것이 가능한 [Mobile generator](https://github.com/yeoman/generator-mobile)를 가지고 있습니다.
<!-- Yeoman also has a [Mobile generator](https://github.com/yeoman/generator-mobile) 
available which makes setting this workflow up a breeze. -->

<h3 id="toc-emmetlivestyle">Emmet LiveStyle</h3>

Emmet LiveStyle은 여러분의 개발 작업흐름에 실시간 CSS 편집을 제공하는 브라우저 및 편집기 플러그인입니다. 현재는 크롬, 사파리 그리고 Sublime Text에서 지원이 가능하며 양방향 편집(에디터에서 브라우저로 그리고 반대로)을 제공합니다.
<!-- Emmet LiveStyle is a browser and editor plugin that brings live CSS editing to 
your development workflow. It is currently available for Chrome, Safari and 
Sublime Text and supports bi-directional (editor to browser and vice-versa) 
editing.  -->

Emmet LiveStyle은 변경이 발생했을 때 완전한 브라우저 새로고침을 강제하지 않습니다만, 대신 개발자도구(DevTools)의 원격 디버깅 프로토콜을 통해 CSS 편집 사항을 밀어넣습니다. 이것은 데스크탑 크롬이나 안드로이드 크롬 등 연결된 어떠한 크롬 버전에서도 데스크탑 편집기에서 발생한 변경들을 확인할 수 있다는 것을 의미합니다.
<!-- Emmet LiveStyle doesn't force a complete browser refresh when you make changes, 
but instead pushes CSS edits across the DevTools remote debugging protocol. What 
this means is that you can see changes made in your desktop editor in any 
connected version of Chrome, whether it be on desktop Chrome or Chrome for 
Android. -->

LiveStyle은 윈도우들과 디바이스들 사이의 반응형 디자인 수정과 테스팅에 이상적인 "다중-뷰 모드(multi-view mode)"라고 불리는 것을 가지고 있습니다. 다중-뷰 모드(Multi-view mode)에서 모든 편집기는 개발자도구(DevTools)에서 같은 페이지에 대해 갱신하는 것과 마찬가지로 모든 윈도우에 대한 적용을 갱신합니다.
<!-- LiveStyle has what it calls "multi-view mode", which is ideal for testing and 
tweaking responsive designs across windows and devices. In multi-view mode, all 
editor updates are applied to all windows as are DevTools updates for the same 
page. -->

**LibeStyle 패키지의 설치와 함께 실시간 CSS 편집을 시작하기 위한 방법은 다음과 같습니다.**
<!-- **With the LiveStyle package installed, to get started with live CSS editing:** -->

<ol>
<li>Start up Sublime Text and open up a CSS file in a project</li>
<li>Start Chrome and go to the page with the CSS you would like to edit</li>
<li>Open DevTools and go to the LiveStyle panel. Check the "Enable LiveStyle" 
option. Note: DevTools will need to be kept open during your live editing 
session for each window in order for style updates to be applied.</li>
<li>When this has been enabled, a list of stylesheets will be displayed on the 
left and a list of your editor files on the right. Select the editor file to be 
associated with the browser. That's it! Boom.</li>
</ol>

이제 편집기 파일들의 리스트는 파일의 편집, 생성, 열기 혹은 닫기 시에 자동으로 업데이트될 것입니다.
<!-- Now the list of editor files will be automatically updated when you edit, 
create, open or close files.  -->

<figure>
  <img src="/static/images/screenshots/crossdevice/image07.gif">
  <figcaption>Sublime에서 CSS의 변경이 즉시 각기 다른 브라우저 윈도우들과 에뮬레이터에 반영되는 중.<!-- Changes to CSS in Sublime being instantly patched across different browser windows and an emulator.  --></figcpation>
</figure>


<h2 id="toc-conclusions">결론<!-- Conclusions --></h2>

크로스 디바이스 테스팅은 개발 중인 많은 도전자들로 여전히 새롭고 빠르게 움직이는 세상에 있습니다. 고맙게도 폭넓고 많은 디바이스 세트들에 대한 테스팅과 호환성을 보증하는 많은 수의 무료/유료 도구들이 이미 있습니다.
<!-- Cross-device testing is still a new and fast moving space with many new 
contenders in development. Thankfully there exist a number of free and 
commercial tools for assuring your compatibility and testing across a wide 
number of device sets.  -->

즉, 이 영역에서 여전히 개선에 대한 많은 잠재력이 있으며 디바이스들간의 테스팅을 더 많이 개선하기 위해 어떻게 도구화를 할것인지에 대해 생각해볼 수 있도록 합니다. 설치 시간을 줄이고 크로스 디바이스의 작업흐름을 개선할 수 있는 것이라면 무엇이든 좋습니다.
<!-- That said, there's still a lot of potential for improvement in this area and we 
would encourage you to think about how the tooling for testing across devices 
can be further improved. Anything that reduces setup time and improves your 
cross-device workflow is a win. -->

<h3 id="toc-issues">이슈들<!-- Issues --></h3>

이 도구들로 테스팅을 하는 동안 아마도 가장 큰 이슈들은 디바이스의 정기적인 잠자기(Sleep) 모드 진입일 것입니다. 이것은 규칙을 깨는 것(Deal-breaker)은 아니지만 잠시 뒤에는 짜증을 유발합니다. 작업을 하는 동안 디바이스들을 잠자지 않도록 설정하는 것은 좋은 아이디어입니다만 배터리를 잡아 먹을 수 있어 계속 전원을 연결해두어야 한다는 사실을 기억하시기 바랍니다.
<!-- Perhaps the largest issues I ran into during testing with these tools was 
devices regularly going to sleep. This isn't a deal-breaker, but does get 
annoying after a while. Where possible it's a good idea to set your devices to 
not sleep as a workaround, however, keep in mind that this can drain your 
battery unless you're always plugged in. -->

개인적으로 Ghostlab을 운용하는 동안 어떠한 중대한 문제도 없었습니다. 몇몇 사람은 $49가 약간 터무니없는 가격이라고 할 지 모르지만 만약 이를 자주 사용하고자 한다면 스스로를 위해 조금 더 혹은 덜 지불할 수도 있다는 것을 기억하시기 바랍니다. 설치와 관련된 가장 좋은 것들 중 한가지는 대상 디바이스마다 클라이언트의 설치와 관리에 대해 걱정할 필요가 없다는 것입니다. 같은 URL로 어디서든지 동작합니다.
<!-- I didn't personally run into any major issues with GhostLab. At $49 some may 
find the price a little steep; however, keep in mind if you're using it 
regularly it more or less pays for itself. One of the nicest things about the 
setup was not having to worry about installing and managing a client per target 
device. The same URL worked everywhere. -->

Adobe Edge Inspect의 경우 각 디바이스별로 특정한 클라이언트를 설치하고 사용해야 한다는 것이 약간 번거롭기는 합니다. 또한 연결된 디바이스 모두가 견고하게 새로고침되지 않기도 하여 크롬 익스텐션에서 이것을 직접 해야한다는 것도 확인했습니다. 또한 Creative Cloud의 구독(subscription)이 필요하며 디바이스에서 선택할 수 있는 브라우저 대신에 클라이언트에서 사이트를 로딩해야 하는 제한도 있습니다. 이것은 아마 테스트를 속도에 제한이 될 것입니다.
<!-- With Adobe Edge Inspect, I found having to install and use specific clients on 
each device a little bit tedious. I also found it didn't consistently refresh 
all of the clients connected up, meaning I had to do this myself from the Chrome 
extension. It also requires a subscription to Creative Cloud and is limited to 
loading up sites in the client rather than in a selected browser on your 
devices. This may limit your ability to accurately test. -->

Remote Preview는 광고한 것과 같은 기능을 가지고 있지만 정말로 가볍습니다. 이는 디바이스들 간에 사이트를 새로고침하는 것 이외에는 아무것도 없다는 것과 좀 더 발전된 도구화 옵션이 필요할 것이라는 뜻입니다. 동기화된 클릭이나 스크롤을 예로 들 필요도 없을 것입니다.
<!-- Remote Preview functioned as advertised, but is extremely lightweight. This 
means for anything more than refreshing your site across devices, you'll need a 
more advanced tooling option. It won't for example, synchronize clicks or 
scrolls. -->

<h2 id="toc-recommendations">추천사항들<!-- Recommendations --></h2>

만약 시작할만한 무료 크로스 플랫폼 솔루션을 찾고 있다면 Remote Preview의 사용을 권할 것입니다. 기업에서 유료 솔루션을 찾는 경우는 GhostLab이 경험상 항상 훌륭했었지만 이는 Mac에서만 가능합니다. 윈도우 사용자들에게는 Adobe Edge Inspect가 가장 훌륭한 선택이며 몇가지 이상한 점만 뺀다면 일반적으로 작업을 잘 마무리할 수 있습니다.
<!-- If you're looking for a free cross-platform solution to get you started, I 
recommend using Remote Preview. For those working in a company looking for a 
paid-for solution, GhostLab has been consistently excellent in my experience but 
is only available for the Mac. For Windows users, Adobe Edge Inspect is your 
best call and minus some quirks, does generally get the job done.  -->

grunt와 LiveStyle 또한 개발 중 증가되는 실시간 반복 작업에 훌륭합니다.
<!-- Grunt and LiveStyle are also excellent for augmenting your live iteration during 
development. -->
