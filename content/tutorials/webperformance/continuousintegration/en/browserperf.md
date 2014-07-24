# Measuring and Automating Web End Rendering Performance

Web page performance has a strong impact on user engagement and revenue. 
Tools like the [Chrome DevTools timeline](https://developers.google.com/chrome-developer-tools/docs/timeline) or [Internet Explorer 11 UI Responsiveness](http://msdn.microsoft.com/en-us/library/ie/dn255009%28v=vs.85%29.aspx) have come a long way in providing great insights into how a browser spends its time painting a web page. 
However, returning to these tools to check for performance regressions after every commit or deployment can be hard. Most web developers today look at the performance panels in the tools only when the site get visibly slow. The gradual degradation of performance often goes unnoticed.
Apart from delivering content as quickly as possible, the page should also feel smooth, responsive and snappy for an ideal experience. A [previous article](http://updates.html5rocks.com/2014/06/Automating-Web-Performance-Measurement) covered how performance measurement can be automated and added to the build process. This article adds measuring rendering performance to the setup. 

## Runtime Performance Metrics
While tools like Page Speed Insights cover metrics like response times, or size of resources, metrics like time spent for layouts or recalculating styles, mean frame time etc. are collected manually from the dev tools profilers. 
![Chrome dev tools profiler](http://i.imgur.com/zR2f1.gif)
Investigating runtime rendering performance usually involves opening the Profiler, hitting the record button, performining a series of tasks and then looking at the timeline to understand the time taken by each operation like paint, layout, styles, etc. 

## Introducing browser-perf
[browser-perf](http://npmjs.org/package/browser-perf) is a tool that automates the collection of rendering metrics for a web page. It is based on [Chromium telementry](http://www.chromium.org/developers/telemetry) and basically automates the process described above. It uses [Selenium](http://docs.seleniumhq.org/) to run the series of actions and collects the data from sources like the Chrome timeline, about:tracing or [WPA](http://blogs.msdn.com/b/ie/archive/2010/06/21/measuring-browser-performance-with-the-windows-performance-tools.aspx) in case of IE. 

Using the tools is very simple. Ensure that you have a selenium server running, and install the node module globally using `npm install -g browser-perf`. Then run the tool against a web page that you would like to collect the metrics for. 

```
browser-perf http://www.html5rocks.com/en/features/performance --selenium=http://localhost:4444/wd
```

![browser-perf command line example](http://i.imgur.com/4gDXea0.png)

browser-perf can also be run on services like [Sauce Labs](https://saucelabs.com/) that provide Selenium on the cloud. More information about the various command line options, instructions for setting up selenium, etc can be found on the project's [wiki pages](https://github.com/axemclion/browser-perf/wiki/_pages). 

## Saving for later - perfjankie
browser-perf gives you a lot of data to analyze. Some of this information becomes more useful when analysed over time. Plotting this information in a graph can help you identify trends on how adding functionality may have made a page heavy, or how a single commit slowed the page down. 
For example, the [graph](http://bench.topcoat.io) generated for [topcoat](http://topcoat.io) shows has a single commit had a spike in load time just because license text was added to all files. Another example is the evolution of [bootstrap](http://getbootstrap.com/) and the change in performance over the years described in [this graph](http://nparashuram.com/bootstrap-perf/). 

[perfjankie](http://npmjs.org/packages/perfjankie) is a node module built on top of browser-perf that runs performance tests and then saves the metrics to a CouchDB database. It also adds the code to view the results as a graph into CouchDB. 

## Adding to build process
[perfjankie](http://github.com/axemclion/perfjankie) also has a grunt task that can be added to your build process to run the performance tests for every commit or deploy. 

```
perfjankie: {
    options: {
        suite: 'Runtime Performance Analysis',
        urls: ['http://localhost:8080']
    },
    local: {
        options: {
            selenium: 'http://localhost:4444/wd/hub',
            browsers: 'chrome',
            couch: {
                server: 'http://localhost:5984',
                database: 'html5rocks'
            }
        }
    }
}
```

More details about the various options supported by perfjankie can be found in the [repository](http://github.com/axemclion/perfjankie). 


## Putting it all together
[Here](http://github.com/axemclion/perfslides) is a sample repository that shows how perfjankie was run and problems with runtime performance identified. The [top 5 commits](https://github.com/axemclion/perfslides/commits/perf) have code snippets from real world projects and show some performance anti-patterns like expensive scroll handlers and how they were fixed using CSS transforms and requestAnimationFrames. The [graph](http://nparashuram.com/perfslides/perfjankie) from these 5 commits show how the metrics metrics like mean frame time are high when the scroll handler is expensive. 

To conclude, adding performance measurement as a part of build or continuous integration process can be useful in identifying performance bottlenecks. 

As the author of the tools above, I would love to hear what you think, and how these tools could help you make you websites jankfree. 