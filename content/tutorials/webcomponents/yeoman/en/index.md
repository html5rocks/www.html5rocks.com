{% include "warning.html" %}

<h2 id="toc-intro">Introduction</h2>

Allo’ Allo’. Anyone writing a web app knows how important it is to keep oneself productive. It's a challenge when you have to worry about tedious tasks like finding the right boilerplate, setting up a development and testing workflow and minifying and compressing all your sources. 

Fortunately modern front-end tooling can help automate much of this, leaving you to focus on writing a kick-ass app. This article will show you how to use [Yeoman](http://yeoman.io), a workflow of tools for web apps to streamline creating apps using [Polymer](http://polymer-project.org), a library of polyfills and sugar for developing apps using [Web Components](http://html5-demos.appspot.com/static/webcomponents/index.html#1).

<img src="image_0.png" class="screenshot">

<p class="notice"><b>Note:</b> If you're new to Web Components, I recommend reading the fantastic <a href="http://www.polymer-project.org/getting-started.html">docs</a> about the web platform features they provide. Guides on how to use them via Polymer are available for <a href="http://www.polymer-project.org/platform/custom-elements.html">Custom Elements</a>, <a href="http://www.polymer-project.org/platform/shadow-dom.html">Shadow DOM</a>, <a href="http://www.polymer-project.org/platform/html-imports.html">HTML Imports</a> and more.</p>

<h2 id="toc-meet-tools">Meet Yo, Grunt and Bower</h2>

Yeoman is a man in a hat with three tools for improving your productivity:

* [yo](http://yeoman.io) is a scaffolding tool that offers an ecosystem of framework-specific scaffolds, called generators that can be used to perform some of the tedious tasks I mentioned earlier. 

* [grunt](http://gruntjs.com) is used to build, preview and test your project, thanks to help from tasks curated by the Yeoman team and [grunt-contrib](https://github.com/gruntjs/grunt-contrib).

* [bower](http://bower.io) is used for dependency management, so that you no longer have to manually download and manage your scripts.

With just a command or two, Yeoman can write boilerplate code for your app (or individual pieces like Models), compile your Sass, minimize and concatenate your CSS, JS, HTML and images and fire up a simple web server in your current directory. It can also run your unit tests and more.

You can install generators from [Node Packaged Modules](http://npmjs.org) (npm) and there are over [220 generators](http://yeoman.io/community-generators.html) now available, many of which have been written by the open-source community. Popular generators include [generator-angular](https://github.com/yeoman/generator-angular), [generator-backbone](https://github.com/yeoman/generator-backbone) and [generator-ember](https://github.com/yeoman/generator-ember).

<img src="image_1.png" class="screenshot"/>

With a recent version of [Node.js](http://nodejs.org) installed, head to your nearest terminal and run:

    $ npm instal -g yo

That's it! You now have Yo, Grunt and Bower and can run them directly from the command-line. Here’s the output of running `yo`:

<img src="image_2.png" class="screenshot"/>

<p class="notice"><b>Note:</b> If you’re interested in reading more about how to use Yeoman to write a complete application using other frameworks like Backbone, you may be interested in <a href="http://net.tutsplus.com/tutorials/javascript-ajax/building-apps-with-the-yeoman-workflow/">Building Apps With The Yeoman Workflow</a>.</p>

<h2 id="toc-polymer-generator">Polymer Generator</h2>

As I mentioned earlier, Polymer is a library of polyfills and sugar which enables the use of Web Components in modern browsers. The project allows developers to build apps using the platform of tomorrow and inform the W3C of places where in-flight specifications can be further improved.

<img src="image_3.png" class="screenshot"/>

<a href="https://github.com/yeoman/generator-polymer">generator-polymer</a> is a new generator that helps you scaffold out Polymer apps using Yeoman, letting you easily create and customize Polymer (custom) elements via the command line, and import them using HTML Imports. This saves you time by writing the boilerplate code for you.

Next, install Polymer’s generator by running:

    $ npm install generator-polymer -g

That's it.  Now your app has Web Component super-powers!

Our newly installed generator has a few specific bits you’ll have access to:

* `polymer:element` is used to scaffold out new individual Polymer elements. For example: `yo polymer:element carousel`

* `polymer:app` is used to scaffold your initial index.html, a Gruntfile.js containing build-time configuration for your project as well as Grunt tasks and a folder structure recommended for the project. It will also give you the option of using Sass Bootstrap for your project’s styles.

<h2 id="toc-build-app">Let’s build a Polymer app</h2>

We're going to build a simple blog using some custom Polymer elements and our new generator.

<img src="image_4.png" class="screenshot"/>

To begin, go to the terminal, make a new directory and cd into it using `mkdir my-new-project && cd $_`. You can now kick-start your Polymer app by running: 

    $ yo polymer

<img src="image_5.png" class="screenshot"/>

This gets the latest version of Polymer from Bower and scaffolds out an index.html, directory structure and Grunt tasks for your workflow. Why not grab a coffee while we wait for the app to finish getting ready? 

Okay, so next we can run `grunt server` to preview what the app looks like:

<img src="image_6.png" class="screenshot"/>

The server supports LiveReload, meaning you can fire up a text editor, edit a custom element and the browser will reload on save. This gives you a nice real-time view of your app’s current state.

Next, let's create a new Polymer element to represent a Blog post. 

    $ yo polymer:element post

<img src="image_7.png" class="screenshot"/>

Yeoman asks us a few questions such as whether we would like to include a constructor or use an HTML Import to include the post element in `index.html`. Let's say No to the first two options for now and leave the third option blank.

<p class="notice"><b>Note:</b> If we say 'yes' to the second question, the generator imports post.html and includes it in index.html. It also declares &lt;post-element&gt; so the element renders on page load.</p>


    $ yo polymer:element post

    [?] Would you like to include constructor=''? No

    [?] Import to your index.html using HTML imports? No

    [?] Import other elements into this one? (e.g 'another_element.html' or leave blank) 

       create app/elements/post.html


This creates a new Polymer element in the `/elements` directory named post.html:

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


It contains:

* Boilerplate code for your [custom element](http://www.polymer-project.org/platform/custom-elements.html), allowing you to use a custom DOM element type in your page (e.g <post-element>)

* A [template tag](http://www.html5rocks.com/tutorials/webcomponents/template/) for ‘native’ client-side templating and sample [scoped styles](http://www.html5rocks.com/en/tutorials/webcomponents/shadowdom-201/) for encapsulating the styles of your element

* Element [registration](http://www.polymer-project.org/polymer.html#element-declaration) boilerplate and [lifecycle events](http://www.polymer-project.org/polymer.html#lifecyclemethods). 

<h3 id="toc-data">Working with a real source of data</h3>

Our blog will need a place to write and read new posts. To demonstrate working with a real data service, we’re going to use the [Google Apps Spreadsheets API](https://developers.google.com/google-apps/spreadsheets/). This allows us to easily read in the content of any spreadsheet created using Google Docs. 

Let’s get this set up:

1. In your browser (for these steps, Chrome is recommended) open up [this](https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0) Google Docs Spreadsheet. It contains sample post data under the following fields: <ul class="inline-list">
  <li>ID</li>
  <li>Title</li>
  <li>Author</li>
  <li>Content</li>
  <li>Date</li>
  <li>Keywords</li>
  <li>E-mail (of the author)</li>
  <li>Slug (for your post’s slug URL)</li>
</ul>

2. Go to the **File** menu and select **Make a copy** to create your own copy of the spreadsheet. You are free to edit the content at your leisure, adding or removing posts.

3. Go to the **File** menu once again and select **Publish to the web**.

4. Click **start publishing**

5. Under **Get a link to the published data**, from the last text box, copy the **key** portion of the URL provided. It looks like this: <a href="https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0">https://docs.google.com/spreadsheet/ccc?key=0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc#gid=0</a>

6. Paste the **key** into the following URL where it says **your-key-goes-here**: **[https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=](https://spreadsheets.google.com/feeds/list/your-key-goes-here/od6/public/values?alt=json-in-script&callback=)**. An example using the key above might look like [https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script](https://spreadsheets.google.com/feeds/list/0AhcraNy3sgspdDhuQ2pvN21JVW9NeVA0M1h4eGo3RGc/od6/public/values?alt=json-in-script).


7. You can paste the URL into your browser and navigate to it to view the JSON version of your blog content. Take note of the URL then spend a little time reviewing the format of this data as you will need to iterate over it in order to display it on screen later.

The JSON output in your browser may look a little daunting, but don’t worry!. We’re really only interested in the data for your posts. 

The Google Spreadsheets API outputs each of the fields in your blog spreadsheet with a special prefix <code>post.gsx$</code>. For example: <code>post.gsx$title.$t</code>, <code>post.gsx$author.$t</code>, <code>post.gsx$content.$t</code> and so on. When we iterate over each “row” in our JSON output, we’ll reference these fields to get back the relevant values for each post.

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

