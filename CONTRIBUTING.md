A step-by-step guide for third-party developers to contribute to html5rocks.com. Before you draft the article, read our [writing tips](https://github.com/html5rocks/www.html5rocks.com/wiki/Writing-Tips). 

# Before you start

HTML5Rocks runs on Google App Engine (Python). Before you check out the code, download
the [App Engine Python SDK](http://code.google.com/appengine/downloads.html#Google_App_Engine_SDK_for_Python). The SDK is not required, but highly recommended. You'll want to run a local development server and preview your changes before submitting a tutorial, sample, or patch.

**If you're interested in writing an article, please [file an issue](https://github.com/html5rocks/www.html5rocks.com/issues/new) and wait to hear from us before writing the content!**

# Getting the code

The entirety of HTML5Rocks ([www](http://www.html5rocks.com/), [slides](http://slides.html5rocks.com/), [playground](http://playground.html5rocks.com/), [updates](http://updates.html5rocks.com/)) is located on Github.

Each sub-domain points to a separate [Google App Engine](http://code.google.com/appengine/downloads.html) (Python) application with a corresponding [repository](https://github.com/html5rocks/).

* [www.html5rocks.com](http://html5rocks.appspot.com): Source at [www.html5rocks.com](https://github.com/html5rocks/www.html5rocks.com)
* [slides.html5rocks.com](http://html5slides.appspot.com): Source at [slides.html5rocks.com](https://github.com/html5rocks/slides.html5rocks.com)
* [playground.html5rocks.com](http://playground.html5rocks.com): Source at [playground.html5rocks.com](https://github.com/html5rocks/playground.html5rocks.com)
* [updates.html5rocks.com](http://updates.html5rocks.com): Source at [updates.html5rocks.com](https://github.com/html5rocks/updates.html5rocks.com)

To checkout the corresponding source, fork us an run the following command:

    git clone git://github.com/html5rocks/www.html5rocks.com.git

# Development environment  quickstart
1. Install the [App Engine SDK](https://developers.google.com/appengine/downloads#Google_App_Engine_SDK_for_Python) using either the Google App Engine launcher or by manually downloading the SDK (for advanced users working with multiple versions of the SDK for different projects) and making sure it's on your path.
2. Open the project folder in a terminal, and start the server with `devappserver2.py .`
3. Import data by navigating to [http://localhost:8080/database/load_all](http://localhost:8080/database/load_all).
4. You'll find your local version of html5rocks.com being served on [http://localhost:8080](http://localhost:8080)

# Contributing: submitting patches and tutorials

## Submitting a code patch, studio/playground sample

### Contributor License Agreements

This section only applies if you are submitting a patch for us. The CLA mentioned below does not apply if you are giving us a brand new article or tutorial.

We'd love to accept your code patches! However, before we can take them, we have to jump a couple of legal hurdles.

Please fill out either the individual or corporate Contributor License Agreement.

  * If you are an individual writing original source code and you're sure you own the intellectual property, then you'll need to sign an [individual CLA](http://code.google.com/legal/individual-cla-v1.0.html).
  * If you work for a company that wants to allow you to contribute your work to HTML5Rocks.com, then you'll need to sign a [corporate CLA](http://code.google.com/legal/corporate-cla-v1.0.html).

Follow either of the two links above to access the appropriate CLA and instructions for how to sign and return it. Once we receive it, we'll add you to the official list of contributors and be able to accept your patches.

1. Sign the contributors license agreement above.
2. Decide which code you want to submit. A submission should be a set of changes that addresses one issue in the [issue tracker](https://github.com/html5rocks/www.html5rocks.com/issues). Please don't mix more than one logical change per submittal, because it makes the history hard to follow. If you want to make a change (e.g. add a sample or feature) that doesn't have a corresponding issue in the issue tracker, please create one.
3. **Submitting**: When you are ready to submit, send us a Pull Request!

## Writing Code ##

If your contribution contains code, please make sure that it follows [the style guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml), otherwise we will have to ask you to make changes, and that's no fun for anyone. 

## Formatting HTML ##

To simplify PR reviews, please word-wrap HTML files at 80 characters or less. 

## Writing a tutorial / case study ##

* Our articles and case studies are licensed under Creative Commons Attribution 3.0 License. Be sure you are OK with that.
* If one doesn't already exist, [Create a new issue](https://github.com/html5rocks/www.html5rocks.com/issues/new) so others can follow/comment on the progress of your work. **Wait to hear from us before you start writing!**

###Authoring process###

1. If you are a new author, add yourself to `www.html5rocks.com/database/profiles.yaml`. We'll also need a `.png` photo of you for the [profiles page](http://html5rocks.com/profiles).
2. You'll be adding your tutorial/case study under `/content/tutorials/<api_topic>`. If an appropriate directory doesn't already exist, you'll need to create a new one. Our convention is `/content/tutorials/<api_topic>/<tutorial_name>/<lang>/index.html`. These directories map to the live site at `http://www.html5rocks.com/<lang>/tutorials/<api_topic>/<tutorial_name>`, so please use good judgement when naming your new directory/tutorial.  HTML files will automatically be parsed by the templating system, which is Django based. See [Django template tags and filters](http://docs.djangoproject.com/en/1.0/ref/templates/builtins/) for more information.
3. If you're writing a case study, add your article under `/content/tutorials/casestudies/` instead.
4. Copy `www.html5rocks.com/content/tutorials/tutorial.html.template` to your directory and replace its holder blocks (all optional) like `{% block iscompatible %}` with your own feature detect and `{% block share_image %}{% endblock %}` with the image that will get shared in social widgets. If you need styles or code in the `<head>`, override the head block. Also remove the comments at the top, otherwise you'll get parsing errors.
5. Finally, add your article to the [/database/tutorials.yaml](https://github.com/html5rocks/www.html5rocks.com/blob/master/database/tutorials.yaml) file. This file is used for backing up our database. Modify a previous entry to match the details of your tutorial. When possible, try to use existent tags. If you're writing a case study, be sure to tag the article with the `type:casestudy` tag. 

**Submitting**: When you are ready to send us your masterpiece, send us a Pull Request.

## Writing/Augmenting a feature page ##

1. A URL like `http://www.html5rocks.com/features/offline` uses a file in [content/features/offline.html](https://github.com/html5rocks/www.html5rocks.com/tree/master/content/features/offline.html)
2.  New files should be created using what's in `feature_empty.html` of that same directory. It has a useful markup skeleton that'll save you time.

**Submitting**: When you are ready to send us your masterpiece, send us a Pull Request.

## i18n ##

A few things to note about internationalization:

1. All templates need to include the `i18n` library by adding `{% include 'i18n' %}` as early as possible.
2. UI strings must be wrapped with `{% blocktrans %}` or `{% trans ... %}` tags.  These are well explained in http://docs.djangoproject.com/en/1.2/topics/i18n/.
3.  Articles live one subdirectory deeper to encode their locale. For example: https://github.com/html5rocks/www.html5rocks.com/tree/master/content/tutorials//3d/css/en/index.html for example.
4.  Similarly, all case studies live in https://github.com/html5rocks/www.html5rocks.com/tree/master/content/tutorials/casestudies
