# Intro
*Are we there yet?*

Fast. Secure. Responsive. Interactive. Stunningly beautiful. These are words that were not associated with the web until HTML5.

HTML5 introduces many cutting-edge features that enable developers to create apps and websites with the functionality, speed, performance, and experience of desktop applications. But unlike desktop applications, apps built on the web platform can reach a much broader audience using a wider array of devices. HTML5 accelerates the pace of your innovation and enables you to seamlessly roll out your latest work to all your users simultaneously.

HTML5 rocks for your users, too. It frees them from the hassles of having to install apps across multiple devices. They can start running a new app the instant they click a link or an icon. They don’t have to be bothered with hairy details like downloading the latest updates and making sure that they are working on the right version. Their data, work, tools, and entertainment follow them wherever they are. They are no longer bound to a specific device.

So why HTML5? With a reach of hundreds of millions of users (Google Chrome alone has more than 200 million active users)—and growing rapidly—the question is, why not HTML5?

# What is HTML5?
*Everything that makes the web sing.*

HMTL5 is not a single thing or a monolithic technology. It is a collection of features, technologies, and APIs that brings the power of the desktop and the vibrancy of multimedia experience to the web—while amplifying the web’s core strengths of interactivity and connectivity.

HTML5 includes the fifth revision of the HTML markup language, CSS3, and a series of JavaScript APIs. Together, these technologies enable you to create complex applications that previously could be created only for desktop platforms.

HTML5 does not belong to a company or a specific browser. It has been forged by a [community of people interested in evolving the web](http://wiki.whatwg.org/wiki/FAQ#What_is_the_WHATWG.3F) and a consortium of technological leaders that includes Google, Microsoft, Apple, Mozilla, Facebook, IBM, HP, Adobe, and [many others](http://www.w3.org/Consortium/Member/List).  The community and consortium continue to collaborate on universal browser standards to push web capabilities even further. The next generation of web apps can run high-performance graphics, work offline, store a large amount of data on the client, perform calculations fast, and take interactivity and collaboration to the next level.

# Multimedia and graphics
*Let's be honest, everyone likes lasers (particularly on sharks), 3D effects, and explosions.*

Since the days of the [dancing hamsters](http://www.superlaugh.com/1/hamsterdance2.gif), the web has been a visual medium, albeit a restricted one. Developers who want to create immersive games, fast animations, or sophisticated visual effects either had to turn to a different platform or use plugins.

With HTML5, the browser has become a full-fledged platform for games, animation, movies—anything graphical, really. Details like lighting and shadows, reflections, and rich textures result in realistic compositions. High-performance features like 3D CSS, vector graphics (canvas and SVG), and WebGL turbocharge web apps with amazing 3D graphics and special effects. Rich audio APIs and low-latency networking of WebSockets—together with the graphical APIs and technologies—let you create a compelling and immersive experience for your users and audience.

Of course, none of these new technologies would be useful if they weren’t capable of running fast. Thankfully, JavaScript engines have become fast enough to run these high performance  graphics and manipulate videos in real time. And hardware-accelerated rendering is being implemented across modern browsers, which means that browsers now use the Graphics Processing Unit (GPU) to speed up the computations needed to display butter-smooth transitions, transformation, and 3D rendering.

HTML5 multimedia, audio, and graphics in action:

- [All Is Not Lost](http://www.chromeexperiments.com/detail/all-is-not-lost/) - HTML5 music video

[More on Graphics &rarr;](/features/graphics)

# Offline and storage
*Offline web?! Not an oxymoron anymore.*

"Web" and "offline" are two terms many people would not associate together. But soon they will, with HTML5 APIs that let you create apps that work even when they’re not connected. Application cache, localStorage, sessionStorage, IndexedDB, File System and online and offline events enable apps to “amphibiously” work with or without online connection. Users can even download large files (greater than 1 GB) in full or in part for later offline viewing.

Going on a plane, traveling to the boondocks (anywhere without Wi-Fi or 3G!), or having intermittent and unreliable connections won’t stop users from being productive or entertained. If you can stash the assets and content locally, your app works no matter where your users go.

Aside from letting apps retain their states and hold data without a server, offline features have the bonus of improving an app’s performance by storing data in the cache or making data persistent between user sessions and page reloading.

HTML5 offline in action:

- See an enterprise-level [mail client that works offline on Chrome](https://chrome.google.com/webstore/detail/ejidjjhkpiempkbhmpbfngldlkglhimk)

[More on Offline &rarr;](/features/offline)<br>
[More on Storage &rarr;](/features/storage)

# Performance
*Faster, higher, stronger!*

HTML5 enables web apps to be more responsive, creating a user experience that rivals that of their desktop counterparts.

Offline APIs are not just for storing files locally, they can also improve performance. They enable your app to both quickly access locally stored data and minimize the number of times your app needs to make requests to the server. You can cache pages that users are likely to click and store assets needed in the next task or game level. The result is fast load times.

But even if you can’t stash assets beforehand, you can still create performant apps with new technologies like Web Workers, which lets you run multiple processes in the background.

On top of that, JavaScript engines are all grown up. They are highly optimized to run JavaScript fast. Some benchmarks even show that JavaScript on V8 engines—the open-sourced JavaScript interpreter for Google Chrome—[runs faster than Python](http://shootout.alioth.debian.org/u32/benchmark.php?test=all&lang=v8&lang2=python3).

Apart from new technologies, a [variety of techniques](http://www.html5rocks.com/en/features/performance)—such as minimizing bandwidth usage and connection times to the servers, file compression, asychronous callbacks—can add zip to apps. You can also access a wide range of performance-optimized libraries and tools.

HTML5 performance in action:

- [Let's make the web faster](http://code.google.com/speed/)

[More on Performance &rarr;](/features/performance)

# Easier development
*...Because we’d rather play games than rewrite that app for yet another device.*

First, HTML5 lets you target the largest number of devices with the least amount of development effort. Second, modern browsers and various techniques minimize fragmentation. Finally, HTML5 is more accessible to a larger body of developers.

## Code portability


Devices running different platforms are being released into the wild on a regular basis. So when you create an app, which platform should you target? Windows, Mac OS, Unix and its variants, Chrome OS, iOS, Android, BlackBerry OS, Windows Mobile, or whatever the hottest new OS is going to be tomorrow? How about optimizing for a wide array of form factors that could be as tiny as a phone to something as large as a full-featured TV? All that is fantastic for the user, but what is a poor resource-strapped developer to do?

Each of these platforms requires you to master its SDK, tools, and languages, but you have only so much time. You could choose to support only a couple of platforms running in a subset of form factors, but you’re ignoring a staggeringly large number of potential users.

Enter HTML5. It simplifies your development cycle by letting you use the same technology stack across multiple platforms and devices.

You can deploy on more devices faster and more easily by developing for web browsers than by developing native apps for a growing list of platforms.


## Single-Sourcing-ish

“But what about all those browsers?” you might cry. Well, the fact is, whether the environment is the desktop runtime or on the browser, fragmentation is an issue. But with HTML5, you can have a single technology stack that you fine-tune for different browsers. You don’t have to rewrite things from scratch, port anything, or maintain entirely separate code bases for each device you support. HTML5 is as close as you can get to single-sourcing. Yes, you still have to customize for each form factor and try to match the operating system look-and-feel, but you need to do that in any case.

Also, “fragmentation” in HTML5 is a relatively low barrier. First, in contrast to the past, browser vendors  make good effort to follow standards—which they formed collaboratively—minimizing differences between modern browsers. Second, because the web grew up dealing with browser fragmentation in the past, it has well-developed libraries, techniques, and best practices for gracefully handling differences.

You can create your app for a single browser first, then incrementally add layers of browser-specific tweaks until you expand your reach to the vast majority of devices.


## Approachability

HTML5 technologies—JavaScript, CSS, and HTML—are easier to learn for some developers. JavaScript is dynamic and adaptable, working in a large number of environments.

You don’t have to code everything from scratch because many frameworks, tools, and libraries, like [Sencha](http://www.sencha.com/), [Dojo](http://dojotoolkit.org/), and [jQuery](http://jquery.com/) can do a lot of the heavy lifting.

If JavaScript didn’t impress you the last time you tinkered with it, look again. You might be pleased to discover how much its libraries, toolkits, and frameworks have evolved and how rapidly they continue to improve.

# Broad reach
*No other platform can match the user base of HTML5.*

Connect with users wherever they are by creating HTML5 apps that can be deployed across multiple platforms and a wide range of devices. Whether you are running an enterprise, creating games, or developing personal apps, HTML5 lets your users quickly access key applications.

HTML5 is broadly supported on all modern desktop browsers and major mobile devices. No other technology can offer the same ubiquity.

Read more: [The developer’s guide to browser adoption rates](http://www.netmagazine.com/features/developers-guide-browser-adoption-rates)

# Security

*Clickjacking. XSS attacks. Phishing. No, we're not talking about another sequel to a pirate movie.*

If you suspect that something sneaky happens on the browser the moment you glance away, you’ll be happy to know that HTML5 and modern browsers that run it have introduced many features that follow modern standards of security development. Native support in browsers for multimedia and other capabilities reduces the need for plugins, some of which have introduced vulnerabilities to the browser.

## Better security design for HTML5 APIs

Many HTML5 standards made the web safer. The standardization of the [parsing algorithm](http://www.webkit.org/blog/1273/the-html5-parsing-algorithm/) eliminates browser discrepancies that not only hindered interoperability of pages with invalid HTML, but also opened XSS vulnerabilities. Some potentially harmful behaviors were locked down, such as the blocking of `javascript:` URLs under certain contexts. And a set of security enhancements have been added to the [iframe element](http://www.whatwg.org/specs/web-apps/current-work/multipage/the-iframe-element.html#the-iframe-element),  which is a vector of attacks. It now includes new attributes like `sandbox`, `seamless`, and `srcdoc`, which—when adopted by all browsers—can provide much safer ways of serving potentially untrusted content.

Many of the powerful new APIs unrelated to providing security are designed to be safer. For example, APIs for notification and geolocation require users to explicitly grant permission before an app can use them. And the various APIs for storage restrict an app to reading and writing data only within its own domain and nowhere else.

## More secure browsers

The modern browser itself is designed to be more secure. Among a long list of security features include: sandboxing, multi-process architecture, support for new HTTP headers, and  adoption of security policies.

### Sandboxing

Web apps can compute and perform tasks—but from within a sandbox in the browser. Sandboxing can keep malicious web apps from clawing their way to other apps and spreading an infestation to other parts of the computer. Web apps are restricted from writing files on hard drives. They can't even read or write data from another web app or domain. The [same-origin policy](https://developer.mozilla.org/en/Same_origin_policy_for_JavaScript) forbids that. Apps cannot directly open files or connect with networks—these operations can only be done through the browsers. In fact, apps can only respond to communication requests by the browser.

The sandbox aims to quarantine untrusted apps and data from the rest of the operating system and to isolate application processes from other apps. Thus—unlike desktop apps—web apps can’t pilfer from the user’s file system, silently access system resources, or install malware in the background.

### Multi-process architecture

Another barrier to infestation is the multi-process architecture pioneered by Chrome and adopted by many browsers. Not only does it make the browser more secure but also more stable and better at garbage collection.  Each app or tab has its own rendering engine, copy of global data structures, and isolated process that are not shared (although tabs for web pages within the same domain might share resources), except under extreme load. The separation of renderers into separate, low-privilege processes makes persistent malware that takes over the entire user account on the machine difficult to develop and less reliable.

Each app is run separately from other apps. So, in most cases, one app cannot interfere with tasks in another; and when one app goes down or is compromised, it doesn't take others with it.

### Developments in HTTP

HTTP, the networking protocol for data communication in the web, has progressed to include more security-based features like [`X-Frame-Options` HTTP header](http://tools.ietf.org/html/draft-gondrom-frame-options-01#section-1) that prevent cross-site request forgery (CSRF) and clickjacking, and Strict Transport Security that thwarts many attacks on untrusted networks.

### Security policies

To add another line of defense, browser vendors have adopted APIs and policies that protect the user, such as the Safe Browsing API, the Content Security Policy, and XSS filters.

The [Safe Browsing API](http://code.google.com/apis/safebrowsing/) used by Chrome, Firefox, and other browsers checks URLs against Google's constantly updated blacklist of suspected phishing and malware pages. This API lets browsers warn users against clicking links to suspicious apps or sites.

The [Content Security Policy](https://developer.mozilla.org/en/Introducing_Content_Security_Policy) also being adopted by many browsers lets you explicitly define the resources that your site may use. It helps prevent intruders from randomly injecting scripts into your apps.

And XSS filters used by Chrome and some browsers disable scripting on pages suspected of being a target of XSS attacks.

## Safer web apps

Even if  attackers manage to overcome a whole host of security features to gain access to one app, they are not likely to be able to use the breached app to access another. Better yet, once the user closes the tab for the breached app, the app is gone. It cannot persist to affect the computer, other tabs, or web applications.

These layers of security don’t exist in desktop apps. In fact, the unlimited access to data can open desktop apps to more vectors for infection than web apps. A web app running inside a modern browser like Chrome has far less control over the system than a regular desktop app.

Read more on [HTML5 Web Security](http://media.hacking-lab.com/hlnews/HTML5_Web_Security_v1.0.pdf)

# Lower costs and easier maintenance
*...Because we'd rather innovate than pull maintenance muckwork.*

All the features we’ve discussed—performance, offline and storage, security, and so on—let you create robust enterprise-level web applications. Web applications are cheaper to run across multiple platforms, they’re easier to maintain, and they make specific devices irrelevant. All these features not only lower costs, but also improve productivity.

## Lower overhead

While desktop apps must be installed separately on each computer, web apps are just one click away. Updating the same number of computers is also trivial with web apps. Users don’t even have to deal with nagging reminders for endless updates and the hassles of restarting at inopportune times. Once the device becomes obsolete and has to be replaced, the Sisyphean ritual of installing and upgrading desktop apps has to be repeated for the new device; with web apps, the IT team just boots up the new device, installs the latest modern browser, and moves on to more innovative tasks.

## Better user experience

From the perspective of your users, they are assured that their apps are always up to date. They don’t have to worry about backward compatibility, nor do they need to be concerned over what versions their coworkers are using to edit their files. In short, with HTML5, the concept of software versions becomes completely irrelevant. Consider, when was the last time you thought about the version number of your webmail app?

## Device agnosticism

HTML5 makes the device irrelevant. Users can just open the browser on another device and instantly access core apps and critical data. If they leave their devices somewhere, that doesn’t stop them from being productive. They can still access their work and electronic lives from other devices in another location.

Therefore, lost, stolen, or destroyed devices are not exactly catastrophic productivity sinkholes. Not only have users been liberated from the fetters of specific devices, but they have also been freed from the time-sapping chore of backing up data and the anxiety-inducing possibility of hard drive failures.

## Enterprise solution

Having one code base for multiple devices, the ease of simultaneous deployment and upgrade, simplified data migration and backup, and access to core apps from multiple devices make HTML5 an excellent platform for businesses.

HTML5 brings substantial benefits for companies that no other IT model can—in simplicity, cost, security, flexibility, mobility and pace of innovation.

# Local file access
*The internet and the local file system, together at last!*

The sandboxing of browsers keeps the user’s file system away from malicious sites, but it also keeps web apps from being able to access the file system and read and write files. This limitation kept web apps from being able to store files or manipulate them. But with the File System API, direct manipulation of binary data like music, images, and videos become possible for the web; these interactions are no longer the province of desktops. Web apps can create, read, navigate, and write to a sandboxed section of the user's local file system.

What’s the big deal, you say? Well, you can create web apps that do really cool stuff with users’ local files. You can, for example, make the user experience for file exchanges less of a chore. You can create web apps that show previews of images as they're being sent to the server and restart uploads or downloads after network interruptions or browser crashes.

You can also do a lot of client-side checking that previously had to be done on the server side. For example, your app could use client-side logic on files about to be uploaded. The app could restrict the size of an upload (which saves users from the pain of sitting through a long upload time only to discover that the task failed because the file size is too large).

The [File System API](/tutorials/file/filesystem/) goes beyond accessing the local file system. The direct interaction between the web and local files means you can create apps for photo or video editing, music mixers and player, and media visualization tools that directly access music, images, videos, and other binary files on users’ hard drives.

[More on File Access &rarr;](/features/file_access)

# Presentation
*Ooh, shiny!*

With the advent of CSS3, apps can have an elegant, expressive, and flexible design. You can create visual enhancements like rounded corners, gradients, and shadows. Your design can be as simple as a text transformation to something as rich as full-blown animations with 3D transformations.

Simplified color and image management allows for faster loading (fewer HTTP requests) and  simpler redesigns. Mathematical access to graphics means you can directly manipulate elements, rotating and zooming almost anything without swapping out images.

If you are more of a typography person and not into all that jazz, [Google Web Fonts](http://www.google.com/webfonts) and [TypeKit](https://typekit.com/) provide you with access to a large number of fonts you can use in your apps.

Presentation can all be done with only CSS3 and not a single lick of JavaScript, making maintenance easier, because developers don’t need to know both CSS and JavaScript.

HTML5 presentation in action:

- [Snowstack](http://www.satine.org/research/webkit/snowleopard/snowstack.html)
- [CSS3 Filters](http://lab.simurai.com/css/stars/#american-beauty)
- [Flux Slider Image Transitions](http://www.joelambert.co.uk/flux/transgallery.html)

[More on Presentation &rarr;](/features/presentation)

# User interaction
*Clicking is so last century.*

In the old web, the only input browsers accepted were mouse clicks and keyboard entries. Then mouse scrolling came along, and people got all excited, but that was pretty much it for a long time.

Thankfully, HTML5 is all about making the web better. So novel ways to interact with web apps have been introduced: drag and drop, geolocation, device orientation, and touch events. And more work is being done on device access, which means that not too far in the future, web apps will be able to accept input from microphones, cameras, video recorders, and USB devices.

# Collaboration (real-time communication)

The features of HTML5 fall into two categories: features that put web apps on par with their native counterparts and features that give web apps advantages over native apps. Real-time collaboration falls under the latter category, and it gives web apps a huge boost.

[WebSockets](http://websocket.org/) and [WebRTC](http://www.webrtc.org/) can really change the game in real-time communication by making development easier and the user experience better. They do away with plugins and proprietary technologies.

WebSockets provides full-duplex channels. Because it lets computers talk to each other in both directions, web apps don’t have to pester the server with repeated requests, which speeds up performance. Plus, different users can share an experience from different computers at the same time—like sharing a screen or streaming audio to another computer. WebSockets is also great for chat or any real-time data you want to send back and forth.

WebRTC enables native support for video and audio conferencing and live streaming.

[More on Connectivity &rarr;](/features/connectivity)

#HTML5 now

Google, Mozilla, Adobe, and other technological leaders agree that the web platform is being built on HTML5, and they are collaboratively pushing the boundaries of browser capabilities. With HTML5, you can deliver new kinds of experiences to your users over the web. It’s no future dream coming to a theater near you in 2015. HTML5 is here, now. Being implemented across all modern browsers.

<p style="text-align:center">
  <button onclick="location.href='/tutorials'">GET STARTED!</button>
</p>
