HTML5Rocks was a content site run by Google.
Its content lives on at [Web Fundamentals] and [web.dev].
Chrome-specific content can be found at [Chrome Developers].

## Deploy

HTML5Rocks is _not_ deployed automatically.
If you make a change, you'll need to deploy it.
You can just run `gcloud` from this folder (there's no build step):

```bash
$ gcloud app deploy --project html5rocks-hrd --no-promote ./app.yaml
```

This will deploy to a unique version and hostname but not take over serving yet.
Check it works with your browser, then migrate all traffic to the new version from the [Cloud Console].

If you need access to do this, ask in team chat or ping a lead.

## Redirects

If you're removing content and want to add a redirect, add it to the "_redirects.yaml" file.
Changes to this file need the site to be redeployed as described above.

[Web Fundamentals]: https://developers.google.com/web
[web.dev]: https://web.dev
[Chrome Developers]: https://developer.chrome.com
[Cloud Console]: https://console.cloud.google.com/appengine/versions?project=html5rocks-hrd
