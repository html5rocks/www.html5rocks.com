# Adding Front End Performance to Continuous Integration

Real web developers ship; and then start looking for the performance issues that make a web page janky :). 
Tools like the [Chrome DevTools timeline](https://developers.google.com/chrome-developer-tools/docs/timeline) or [Internet Explorer 11 UI Responsiveness](http://msdn.microsoft.com/en-us/library/ie/dn255009%28v=vs.85%29.aspx) have come a long way in providing great insights into how a browser spends its time painting a web page. However, most web developers come back to these tools only when a web page becomes sluggish. With agile teams and short release cycles, analyzing performance for every release is just not practical.
On the other hand, continuous deployment and testing tools have continued to evolve to match the complex requirements of today. Would it not be great if these tools could be leveraged to protect against web page performance rendering regressions? 

## Web Sites bloat over time
As functionality gets added to websites over time, they start to become heavy and slow down. The extra DOM nodes, CSS rules or Javascript functions may be needed for the functionality, but they also add to the work that a browser does. This could cause a gradual regression in the performance of a website over time. At other times, the regression may be evident immediatly and could be caused due to a CSS gradient or an onscroll javascript handler.
Measuring this change over time gives the developer, a good handle over the performance of the website. This data could be used to identify offending commits or help with refactoring code. 

## Metrics
Since you cannot improve what you cannot measure, collecting performance metrics is the first step. Some of the types of metrics that could be useful are

### Navigation and Timing
The start of front end performance engineering can be attributed to a great extent to [YSlow](http://developer.yahoo.com/yslow/) and [PageSpeed](https://developers.google.com/speed/pagespeed/). Measuring network characteristics and the number of HTTP requests is the simple and can be fixed easily. With time tested rules, collection and analysis of these metrics can be automated. 
The web timing API covered in an [earlier article](http://www.html5rocks.com/en/tutorials/webperformance/basics/) is also a great way to get information about the page load events. 

Tools like [SiteSpeed.io](http://www.sitespeed.io/) and [BrowserTime](https://github.com/tobli/browsertime) can be used to measure network/navigation timing and other related metrics. SiteSpeed even generates dashboards that provide a good summary and quantifies the results as scores. It also has a section on [adding this](http://www.sitespeed.io/documentation/#continuousintegration) to continuous integration systems.

### DOM characteristics
In addition to navigation, another great indicator of browser rendering performance is the DOM, CSS and Javascript. Tools like [Phantomas](https://github.com/macbre/phantomas) measure metrics like number of DOM nodes, asset sizes, cookies or [CSS complexities](https://github.com/macbre/analyze-css). Since Phantomas is modular, adding other types of metrics is also very simple. Phantomas uses PhantomJS and also has a good choice of 'reporters'. Running it on a continuous integration system and piping all the results to a service like [Graphite](http://graphite.readthedocs.org/en/latest/overview.html) makes the data much more managable. 
For the project using Grunt as the build system, the [grunt plugin](https://github.com/stefanjudis/grunt-phantomas) can be used to generate the JSON files. The graphs generated look like the following 

![Grunt Phantomas Graph](http://4waisenkinder.de/images/blog/stefanjudis/grunt-phantomas.png "Grunt Phantomas Graphs")

### Timeline and Tracing metrics
Looking deeper into how the browser actually calculates the layout and paints a page can revel some more interesting data. 
Hidden deep inside the Chromium source is a gem called the Telemetry tool. Originally intended to test the browser with different types of web pages, it does not take the creative web developer to figure out that its purpose can be easily reversed to test a web page.
When run on a web page, interesting benchmarks like the average time a frame takes to render, or the time taken for first paint can be measured.
[Browser-perf](http://github.com/axemclion/browser-perf), is a NodeJS port of Chromium telemetry smoothness and loading benchmarks. The [topcoat](http://topcoat.io) project uses Telemetry to generates [graphs](http://bench.topcoat.io) like the following for each component

![Topcoat sample graph](https://github-camo.global.ssl.fastly.net/a17859272a97a48b068548a645441aa3da54010b/687474703a2f2f692e696d6775722e636f6d2f4f616e4a517a4c2e706e67)

This graph can be a good indicator of the impact of individual code commits to the overall performance. Some commits could introduce drastic regressions and may need to be reverted to redesigned for something that may be more acceptable. Another example would be the [graph](http://axemclion.github.io/bootstrap-perf) showing rendering statistics across the various versions of [bootstrap](https://github.com/twbs/bootstrap/). Some of the interesting patterns include the gradual performance regression due to the addition of more components and the refactoring done for the 3.0.* releases. 

![Metrics Graph from Bootstrap](http://i.imgur.com/FDY3zr4.png "Rendering metrics for Bootstrap")

Though Browser-perf needs to run on real browsers, cloudified browsers like [Saucelabs](http://saucelabs.com) can be used for continuous integration scenarios.   

## Reporting
The final step would be collecting this data. Since the data is not usually a lot, it is simpler to store it as CSV files and import them into a spreadsheet program to analyze the graph. This process can also be automated by submitting the data to a Google Spreadsheet forms and plotting the graph in the spreadsheet.  
For the developers who prefer dashboards, projects like Graphite offer a great solution. Graphite can digest data in many formats using libraries and setting it up is relatively easy. 
Another alternative would be to use a project like [perfjankie](http://github.com/axemclion/perfjankie) and store all the data in a CouchDB database. Perfjankie also stores the visualization logic and web pages as a CouchApp and database has everything needed to get the system working. Hosted CouchDB providers make setting up this system even simpler. 

## Conclusion
Numerous studies have show a direct correlation between the speed of a web page and the impact on revenue. It may be hard to look at performance during every release cycle, but using automated tools like the ones described above, you can always ensure that the performance regressions do not impact your website. Integrating the tools with a continuous integration process is usually a simple. Such an integration may help in the long run the web site evolves and more functionality is added.