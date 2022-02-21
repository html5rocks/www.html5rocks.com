Help us make HTML5Rocks more accessible to an international audience! We'd appreciate at least three kinds of help:

* **Proofreading existing translations**: We're not experts in many languages beyond English (and, honestly, our mastery even there is debatable). If you can help us ensure that the translations on the site make good sense, and sound stylistically reasonable, we'd appreciate it. Likewise, if we've missed some strings in the site's UI, we'd like to know about it.
* **Translating whole articles**: We've got a workflow running internally to get batches of articles translated, but it's going to take a while to get caught up. If you'd like to help out, we'd love you forever.
* **Support for additional languages**: We've settled on English, German, Spanish, Japanese, Portugese, Russian, Korean and Chinese as the languages we're officially supporting. We might revisit that in the future based on demand, but that's where we're at right now. If you'd like to help us expand into languages beyond those 7, we'll happily accept article translations for any language at all. :)

For all of these, we're pretty open to accepting contributions. If you see something that we really should rephrase, [please open a new bug](https://github.com/html5rocks/www.html5rocks.com/issues), and we'll make the fix. If you'd like to fork the project and make the fix yourself, we'd be happy to pull in your changes. Likewise, if you'd like to translate an article, simply send us a Pull Request!

# Technical Details
## UI Strings

Most of the static text you see on the site (text that's not directly related to an article) has been localized via the stock [Django internationalization mechanisms](https://docs.djangoproject.com/en/dev/topics/i18n/). There's not really much to add to that documentation, so let's just call out a few relevant details:

* Strings inside all the page templates should be wrapped in `{% trans "[STRING]"}` or `{% blocktrans %}[LONGER, MULTILINE STRING]{% endblocktrans %}` as appropriate. See [/templates/tutorial.html](../master/templates/tutorial.html) for examples.
* Strings inside Python code should be wrapped in `_("[STRING]")`. See [main.py](../master/main.py) for examples.
* Strings inside JavaScript are, at the moment, not localized. Avoid content inside JavaScript in favor of content inside HTML.

These strings are gathered up, and packaged into so-called "message files" by running `make messages` the base repo directory. One message file is written out per supported locale, and each lives at `conf/locale/[LOCALE]/LC_MESSAGES/django.po`. The English message file, for instance, is [conf/locale/en/LC_MESSAGES/django.po](../master/conf/locale/en/LC_MESSAGES/django.po). You can edit these files by hand, or you can use any of a number of programs specially designed for editing PO files. [Poedit](http://www.poedit.net/), for example, is free, and widely used.

After changing PO files, you have to recompile them into the corresponding MO binary files: call `make compile` in the main repo directory. The Makefile makes assumptions about where your Google AppEngine/Django is installed - if it doesn't work, open Makefile and check the `DJANGO_ROOT` variable.

## Articles

Each article on the site lives in its own directory under `/content` that matches the slug in the URL. For instance, the URL [http://www.html5rocks.com/en/mobile/touch/](http://www.html5rocks.com/en/mobile/touch/) maps to `content/mobile/touch/` in the repository. Each localization of the article (including the original English version) lives inside a subdirectory, named for the locale. The Japanese version of that article is accessible on the web at [http://www.html5rocks.com/ja/mobile/touch/](http://www.html5rocks.com/ja/mobile/touch/), which maps to `www.html5rocks.com/content/mobile/touch/ja/index.html` on the filesystem.

Localizing an article, then, is simply a matter of copying the English version of an article into a properly named subdirectory, and editing the text directly in that new file. Nothing special needs to be done to ensure that the system picks up on the new localization: if it's on the filesystem, it's available on the site.

### Article Metadata

For historical reasons, article metadata (title, description, and so on) are not contained with the articles themselves, but live in the site's database. The information from the database is replicated into [database/tutorials.yaml](../master/database/tutorials.yaml) for backup purposes. This file must be kept up to date as new articles are added to the site.

As part of the message file generation process, article titles and descriptions are extracted from this YAML file, and placed into the message files for translation. They can be edited in the same way as UI strings.
