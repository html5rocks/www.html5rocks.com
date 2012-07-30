{% include "warning.html" %}

<h2 id="toc-intro">Introduction</h2>

The web is an extremely powerful platform for text, an area where Adobe has a great deal of experience and expertise. When Adobe was looking for ways to help move the web forward, therefore, advancing the web's text capabilities even further seemed like an obvious place for us to start.
The web generally assumes a single column, vertical orientation for text. Although it's possible to flow text around graphics, and even to format text into multiple columns with CSS, it's still very difficult to achieve true magazine-like layout on the web. With [CSS Regions][css-regions-spec] and [CSS Exclusions][css-exclusions-spec], Adobe is spearheading the effort to bring the power of desktop publishing to modern browsers. For instance, in the screenshot below, CSS Exclusions is being used to flow text along the contour of the mountain:

<figure>
![Example of CSS Exclusions in action](exclusions.png "Example of CSS Exclusions in action")
<figcaption>Example of CSS Exclusions in action</figcaption>
</figure>

The document in the screenshot below also uses CSS Exclusions to allow the text to wrap around shapes in the images, as well as CSS Regions to format text into columns and around a pull quote:

<figure>
![Example of CSS Regions in action](regions.png "Example of CSS Regions in action")
<figcaption>Example of CSS Regions in action</figcaption>
</figure>

<h2 id="toc-regions">CSS Regions</h2>

Before getting into the details of [CSS Regions][css-regions-spec], I'd like to cover how regions can be enabled in Google Chrome. Once you have CSS Regions enabled, you can try out some of the samples referenced in this article, and create your own.

<h3 id="toc-enabling">Enabling CSS Regions</h3>

As of version 20 of Chrome (version 20.0.1132.57, to be exact), CSS Regions is enabled through the `chrome://flags` interface. To enable CSS Regions, follow these steps:

1. Open a new tab or window in Chrome.
2. Type `chrome://flags` in the location bar.
3. Use *find in page* (control/command + f) to find the CSS Regions section.
4. Click on the *Enable* link.
5. Click on the *Relaunch Now* button at the bottom.

Once you've relaunched your browser, you're free to start experimenting with CSS Regions.

<h3 id="toc-region-overciew">An Overview of CSS Regions</h3>

CSS Regions allows a block of semantically marked-up text to automatically flow into "boxes" (currently elements). The diagram below demonstrates the separation of text (the flow) and boxes (the regions the text flows into):

<figure>
![Content flows into defined regions](regionsoverview.png "Content flows into defined regions")
<figcaption>Content flows into defined regions</figcaption>
</figure>

Let's take a look at an actual CSS Regions use case. In addition to being a developer at Adobe, I'm also a science fiction writer. I frequently publish my work online under a Creative Commons license, and in order to allow it to work across the maximum number of devices and browsers, I frequently use an extremely simple format similar to this:

<figure>
![Unstyled Human Legacy Project Example](hlp.png "Unstyled Human Legacy Project Example")
<figcaption>Unstyled Human Legacy Project Example</figcaption>
</figure>

Using CSS Regions, I was able to create an experience that is both more visually interesting, and much more functional since it's easier to navigate and more comfortable to read:

<figure>
[![Human Legacy Project showing Regions](hlp2.png "Human Legacy Project showing Regions")](http://christiancantrell.com/adobe/hlp/callout.html)
<figcaption>Human Legacy Project with Regions. [Try it](http://christiancantrell.com/adobe/hlp/callout.html)</figcaption>
</figure>

For demonstration purposes, I added the ability to reveal CSS Regions in this prototype. The screenshot below shows how the regions are arranged such that they give the impression of being columns that wrap around a graphic and a pull-quote in the center:

<figure>
![Human Legacy Project showing Regions](hlp3.png "Human Legacy Project showing Regions")
<figcaption>Human Legacy Project showing Regions</figcaption>
</figure>

You can experiment with this prototype (as well as view the source code) [here](http://christiancantrell.com/adobe/hlp/callout.html). Use your arrow keys to navigate, and press the `Esc` key to reveal regions. Earlier prototypes are also available [here]().

<h3 id="toc-named-flow">Creating a Named Flow</h3>

The CSS required to get a block of text to flow through regions is extremely simple. The snippet below assigns a named flow called "article" to a div with the id "content," and assigns that same "article" named flow to any element with the class "region." The result is that text contained inside the "content" element will automatically flow through any element with the class "region."

    <!DOCTYPE html>
    <html>
    <head>
      <style>
        #content {
          {% mixin flow-into: article; %}
        }

        .region {
          {% mixin flow-from: article; %}
          box-sizing: border-box;
          position: absolute;
          width: 200px;
          height: 200px;
          padding: 10px;
        }

        #box-a {
          border: 1px solid red;
          top: 10px;
          left: 10px;
        }

        #box-b {
          border: 1px solid green;
          top: 210px;
          left: 210px;
        }

        #box-c {
          border: 1px solid blue;
          top: 410px;
          left: 410px;
        }
      </style>
    </head>
    <body>
      <div id="box-a" class="region"></div>
      <div id="box-b" class="region"></div>
      <div id="box-c" class="region"></div>
      <div id="content">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eleifend dapibus felis, a consectetur nisl aliquam at. Aliquam quam augue, molestie a scelerisque nec, accumsan non metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin cursus euismod nisi, a egestas sem rhoncus eget. Mauris non tortor arcu. Pellentesque in odio at leo volutpat consequat....
      </div>
    </body>
    </html>

The result looks like this:

<figure>
![Result of above code](regionexample.png "Result of above code")
<figcaption>Result of above code</figcaption>
</figure>

Note that the text inside the "content" div doesn't have any knowledge of its presentation. In other words, it can remain entirely semantically intact even as it's flowing through various regions. Additionally, since regions are just elements, they are positioned and sized using CSS just as any other element, and are therefore perfectly compatible with responsive design principles. Designating elements as part of a named flow simply means that the specified text automatically flows through them.

<h3 id="toc-cssom">The CSS Object Model</h3>

<p class="notice" style="text-align:center;">
This section doesn't show vendor prefixes, but you should write code that works across browsers!
</p>

The [CSS Object Model][cssom-spec], or CSSOM, defines JavaScript APIs for working with CSS. Below is a list of the new APIs related to CSS Regions:

- `document.webkitGetFlowByName("flow_name")`: The `webkitGetFlowByName` function returns a reference to a named flow. The argument corresponds to the name specified as the value of the `flow-into` and `from-from` CSS properties. To get a reference to the named flow specified in the code snippet above, you would pass in the string "article."
- `WebKitNamedFlow`: The `webkitGetFlowByName` function returns an instance of `WebKitNamedFlow` with the following properties and functions:
    - `contentNodes`: A reference to the nodes that flow into the named flow.
    - `overflow`: Whether or not the content is overflowing the specified region. In other words, whether or not more regions are required to contain all the content.
    - `getRegionsByContentNode(node)`: A function that returns a reference to the region containing the specified node. This is especially useful for finding regions containing things like named anchors.
- `webkitRegionLayoutUpdate` event. Elements that are part of flows can register for `webkitRegionLayoutUpdate` events. Event handlers are invoked whenever the flow changes for any reason (content is added or removed, the font size changes, the shape of the region changes, etc.).
- `Element.webkitRegionOverflow`: Elements have a `webkitRegionOverflow` property which, if they are part of a named flow, indicates whether or not content from a flow is overflowing the region. Possible values are "fit" if the content stops before the end of the region, and "overflow" if there is more content than the region can hold.

One of the primary uses for the CSSOM is listening for `webkitRegionLayoutUpdate` events and dynamically adding or removing regions in order to accommodate varying amounts of text. For instance, if the amount of text to be formatted is unpredictable (perhaps user-generated), if the browser window is resized, or if the font size changes, it might be necessary to add or remove regions to accommodate the change in the flow. Additionally, if you want to organize your content into pages, you will need a mechanism for dynamically modifying the DOM as well as your regions.

The following snippet of JavaScript code demonstrates the use of the CSSOM to dynamically add regions as necessary. Note that for the sake of simplicity, it does not handle removing regions or defining the size and positions of regions; it is for demonstration purposes only.

    function addRegion() {
      var region = document.createElement("div");
      region.classList.add("region");
      region.addEventListener("webkitRegionLayoutUpdate", onLayoutUpdate);
      document.body.appendChild(region);
    }

    function onLayoutUpdate(event) {
      var region = event.target;
      if (region.webkitRegionOverflow === "overflow") {
        addRegion();
      } else {
        regionLayoutComplete();
      }
    }

    function regionLayoutComplete() {
      // Finish up your layout.
    }

Several more CSS Regions demos are available here.

<h3 id="toc-pagetemplates">CSS Page Templates</h3>

<p class="notice" style="text-align:center;">
This section discusses future concepts not yet implemented in any browser.
</p>

Leveraging the CSSOM is probably the most powerful and flexible way of implementing things like paging and responsive layout, but Adobe has been working with text and desktop publishing tools long enough to know that designers and developers are also going to want an easier way to get relatively generic paging capabilities. Therefore we are working on a proposal called CSS Page Templates which allows paging behavior to be defined entirely declaratively.

Let's take a look at a common use case for CSS Page Templates. The code snippet below shows the use of CSS to create two named flows: "article-flow" and "timeline-flow." Additionally it defines a third selector called "combined-articles" inside of which the the two flows will be contained. The simple inclusion of the `overflow-style` property inside the "combined-articles" selector indicates that the content should automatically be paged along the x axis, or horizontally:

    <style>
      #article {
        {% mixin flow-into: article-flow; %}
      }

      #timeline {
        {% mixin flow-into: timeline-flow; %}
      }

      #combined-articles {
        overflow-style: paged-x;
      }
    </style>

Now that the flows have been defined and the desired overflow behavior has been specified, we can create the page template itself:

    @template {
      @slot left {
        width: 35%;
        float: left;
        {% mixin flow-from: article-flow; %}
      }

      @slot time {
        width: 25%;
        float: left;
        {% mixin flow-from: timeline-flow; %}
      }

      @slot right {
        width: 35%;
        float: left;
        {% mixin flow-from: article-flow; %}
      }
    }

Page templates are defined using the new "at" syntax. In the code snippet above, we define three slots, each corresponding to a column. The text from the "article-flow" will flow through the columns on the left and right, and text from the "timeline-flow" will populate the column in the middle. The result might look something like this:

<figure>
![Page templates example](pagetemplates.png "Page templates example")
<figcaption>Page templates example</figcaption>
</figure>

Note that the article text -- the text in the left- and right-hand columns -- is English, and the timeline in the center is German. Additionally, the document pages horizontally without the need for any JavaScript code. Everything was done entirely declaratively in CSS.

CSS Page Templates are still a proposal, however we have a [prototype](http://adobe.github.com/web-platform/utilities/css-pagination-template/) which uses a JavaScript "shim" (a.k.a [polyfill](http://remysharp.com/2010/10/08/what-is-a-polyfill/)) in order to allow you to experiment with them now.

To learn more about CSS Regions in general, check out the [CSS Regions page on html.adobe.com](http://html.adobe.com/webstandards/cssregions/).

<h2 id="toc-exclusions">CSS Exclusions</h2>

In order to achieve true magazine-like layout, it's not enough to be able to flow text through regions. A critical element of high-quality and visually interesting desktop publishing is the ability to make text flow either around or inside of irregular graphics and shapes. CSS Exclusions is bringing this level of production quality to the web.

The screenshot below is from a CSS Exclusions prototype, and shows text dynamically flowing around a path that matches the contour of a large rock formation:

<figure>
![Example of CSS Exclusions in action](exclusions.png "Example of CSS Exclusions in action")
<figcaption>Example of CSS Exclusions in action</figcaption>
</figure>

The inverse is illustrated in the next screenshot: text flowing inside of irregularly shaped polygons:

<figure>
![Text flowing into irregularly shaped polygons](exclusions2.png "Text flowing into irregularly shaped polygons")
<figcaption>Text flowing into irregularly shaped polygons</figcaption>
</figure>

The first step to being able to flow text around or inside of arbitrary shapes is to develop and optimize the required algorithms. Adobe is currently working on implementations which will be contributed directly to WebKit. Once these algorithms have been optimized, they will become the foundations on top of which the remainder of CSS Exclusions are built.

For more information on CSS Exclusions, see the [CSS Exclusions page on html.adobe.com](http://html.adobe.com/webstandards/cssexclusions/), and for a more detailed look at Adobe's work on the underlying technology for CSS Exclusions, see Hans Muller's blog post entitled [Horizontal Box: Polygon Intersection for CSS Exclusions](http://hansmuller-webkit.blogspot.com/2012/06/horizontal-box-polygon-intersection-for.html).

<h3 id="toc-exclusions-state">The Current State of CSS Regions and CSS Exclusions</h3>

The first time I talked about CSS Regions and CSS Exclusions publicly was at the Adobe Developer Pod at Google I/O 2011. At the time, I was showing demos in our own custom prototype browser. The reception was extremely enthusiastic, however there was a palpable sense of disappointment when onlookers discovered that none of the functionality I was showing was available in any of the major browsers yet.

I was at Google I/O again this year (2012), this time as a presenter along with my coworker [Vincent Hardy](https://twitter.com/vincent_hardy) and [Alex Danilo](https://plus.google.com/113205278198625312096/posts) from Google (you can [watch the presentation here](http://www.youtube.com/watch?v=bwOhfoewMYs)). Just one year later, about 80% of the CSS Regions specification has been implemented in WebKit, and is already in the most recent version of Google Chrome (note that CSS Regions currently has to be enabled through `chrome://flags`). Preliminary support for CSS Regions has even landed in Chrome for Android:

<figure>
![Regions on Chrome for Android](hlp_mobile.png "Regions on Chrome for Android")
<figcaption>Regions on Chrome for Android</figcaption>
</figure>

Additionally, both CSS Regions and CSS Exclusions are implemented in the Internet Explorer 10 preview, and are currently on Mozilla's 2012 roadmap for Firefox. The next major version of Safari should support the majority of the CSS Regions specification, and subsequent updates should include the remainder.

Below is a detailed timeline of the progress we've made with CSS Regions and CSS Exclusions since our initial proposal to the W3C in April of 2011:

<figure>
![Region and Exclusion Progress](diagram.png "Region and Exclusion Progress")
<figcaption>Region and Exclusion Progress</figcaption>
</figure>

<h2 id="toc-conclusion">Conclusion</h2>

Adobe has a huge amount of experience with text, fonts, and with desktop publishing in general through tools like InDesign. Although the web is already a very powerful platform for text, we want to use our knowledge and experience to push text presentation even further. CSS Regions and CSS Exclusions are allowing content to remain semantically structured while also enabling true magazine-like layout, and ultimately a much more expressive web.

[css-regions-spec]: http://dev.w3.org/csswg/css3-regions/
[css-exclusions-spec]: http://dev.w3.org/csswg/css3-exclusions/
[cssom-spec]: http://dev.w3.org/csswg/cssom/