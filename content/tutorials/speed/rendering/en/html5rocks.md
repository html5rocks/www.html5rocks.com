# Adding Front End Performance to Continuous Integration

Real web developers ship; and then start looking for the performance issues that made web pages janky :). 
It is 2014 and tools like the [Chrome DevTools timeline](https://developers.google.com/chrome-developer-tools/docs/timeline) or [Internet Explorer 11 UI Responsiveness](http://msdn.microsoft.com/en-us/library/ie/dn255009%28v=vs.85%29.aspx) have come a long way in providing great insights into how the browser spends its time painting the web page. However, most web developers come back to these tools only when the page becomes sluggish. With agile teams and short release cycles, this analysis per deploy only becomes harder. The continuous deployment and testing tools on the other hand have evolved to match the complex requirements of today. Would it not be great if these tools could also be leveraged to protect against web page performance rendering regressions? 

## Web Sites bloat over time
As more functionality is added to websites, they start to slow down over time. The additional DOM nodes, CSS rules or Javascript functions are needed for the functionality, but they also add to the work that a browser does. This perf reduction could be gradual over time, or could be instantaneous due to a CSS gradient or a onscroll javascript handler. In either case, it would be great for a developer to be aware of the rate of performance change instead of having to notice this suddenly and scamper to fix it. 

The graph below is a sample from the [topcoat](http://topcoat.io) project that measures metrics like the average time to draw a frame and [plots the graph](http://bench.topcoat.io) over commits. It is a good indicator of the impact of individual code commits to the overall performance. Some commits could introduce drastic regressions and may need to be reverted to redesigned for something that may be more acceptable. 

![Metrics Graph from http://bench.topcoat.io](http://i.imgur.com/OanJQzL.png "Rendering metrics for Topcoat.io")

The [second graph](http://axemclion.github.io/bootstrap-perf) below shows a similar metrics across the various versions of [bootstrap](https://github.com/twbs/bootstrap/). Some of the interesting identifiable include the gradual performance regression due to the addition of more components and the refactoring done for the 3.0.* releases. 

![Metrics Graph from Bootstrap](http://i.imgur.com/FDY3zr4.png "Rendering metrics for Bootstrap")

## Tools
Many tools exist today that tell you the state of a sytem at a point of time. These tools measure metrics like the number of DOM nodes, the number of network requests, etc. These metrics may not be very actionable in isolation as there is no base line to compare them against. However, if these metrics are available over time and are plotted in a graph like the ones above, they add an additional dimension to the way we look at our check-ins. 

### SiteSpeed.io and BrowserTime
The start of front end performance engineering can be attributed to a great extent to [YSlow](http://developer.yahoo.com/yslow/) and [PageSpeed](https://developers.google.com/speed/pagespeed/). Following the same rules and best practices, open source projects like [SiteSpeed.io](http://www.sitespeed.io/) and [BrowserTime](https://github.com/tobli/browsertime) can be used to measure network/navigation timing and other related metrics. The tool generates dashboards that provide a good summary and quantifies the results as scores, indicating how well as website is doing. SiteSpeed also has a section on [adding this](http://www.sitespeed.io/documentation/#continuousintegration) to continuous integration systems.

### Phantomas
[Phantomas](https://github.com/macbre/phantomas) is a modular, [PhantomJS](http://phantomjs.org/) based web performance metrics collector. It collects metrics like the number of DOMNodes, HTTP requests, etc. Though very similar to Sitespeed, the modular nature makes it possible to add more metrics like Jquery timing, redirects, etc. 
A complete list of requests is available [here](https://github.com/macbre/phantomas#metrics). A [grunt plugin](https://github.com/stefanjudis/grunt-phantomas) that runs this tool every time a site is build could be aggregated into a [dashboard](http://stefanjudis.github.io/grunt-phantomas/gruntjs/). Though the plugin generates JSON files, these files could be transferred to a database like CouchDB to be used for the graphs. 

![Grunt Phantomas Graph](http://4waisenkinder.de/images/blog/stefanjudis/grunt-phantomas.png "Grunt Phantomas Graphs")

### Chromium Telemetry 
Hidden deep inside the Chromium source is a gem called the Telemetry tool. Originally intended to test the browser with different types of web pages, it does not take the creative web developer to figure out that its purpose can be easily reversed. Some of the interesting benchmarks help you measure things like the average time a frame takes to render, or the time taken for first paint. T
