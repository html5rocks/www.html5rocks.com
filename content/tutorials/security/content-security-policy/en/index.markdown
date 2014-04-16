The web's security model is rooted in the [_same origin policy_](http://en.wikipedia.org/wiki/Same_origin_policy). Code from `https://mybank.com` should only have access to `https://mybank.com`'s data, and `https://evil.example.com` should certainly never be allowed access. Each origin is kept isolated from the rest of the web, giving developers a safe sandbox in which to build and play. In theory, this is perfectly brilliant. In practice, attackers have found clever ways to subvert the system. 

[Cross-site scripting (XSS)](http://en.wikipedia.org/wiki/Cross-site_scripting) attacks, for example, bypass the same origin policy by tricking a site into delivering malicious code along with the intended content. This is a huge problem, as browsers trust all of the code that shows up on a page as being legitimately part of that page's security origin. The [XSS Cheat Sheet](http://ha.ckers.org/xss.html) is an old but representative cross-section of the methods an attacker might use to violate this trust by injecting malicious code. If an attacker successfully injects _any_ code at all, it's pretty much game over: user session data is compromised and information that should be kept secret is exfiltrated to The Bad Guys™. We'd obviously like to prevent that if possible. 

This tutorial highlights one promising new defense that can significantly reduce the risk and impact of XSS attacks in modern browsers: Content Security Policy (CSP).

## Source Whitelists

The core issue exploited by XSS attacks is the browser's inability to distinguish between script that's intended to be part of your application, and script that's been maliciously injected by a third-party. For example, the Google +1 button at the top of this article loads and executes code from `https://apis.google.com/js/plusone.js` in the context of this page's origin. We trust that code, but we can't expect the browser to figure out on it's own that code from `apis.google.com` is awesome, while code from `apis.evil.example.com` probably isn't. The browser happily downloads and executes any code a page requests, regardless of source.

Instead of blindly trusting _everything_ that a server delivers, CSP defines the `Content-Security-Policy` HTTP header that allows you to create a whitelist of sources of trusted content, and instructs the browser to only execute or render resources from those sources. Even if an attacker can find a hole through which to inject script, the script won't match the whitelist, and therefore won't be executed.

Since we trust `apis.google.com` to deliver valid code, and we trust ourselves to do the same, let's define a policy that only allows script to execute when it comes from one of those two sources:

    Content-Security-Policy: script-src 'self' https://apis.google.com

Simple, right? As you probably guessed, **`script-src`** is a directive that controls a set of script-related privileges for a specific page. We've specified `'self'` as one valid source of script, and `https://apis.google.com` as another. The browser will dutifully download and execute JavaScript from `apis.google.com` over HTTPS, as well as from the current page's origin.

With this policy defined, the browser will simply throw an error instead of loading script from any other source. When a clever attacker does manage to inject code into your site, she'll run headlong into an error message, rather than the success she was expecting:

![Console error: "Refused to load the script 'http://evil.example.com/evil.js' because it violates the following Content Security Policy directive: "script-src 'self' https://apis.google.com"."](csp-error.png)

### Policy applies to a wide variety of resources

While script resources are the most obvious security risks, CSP provides a rich set of policy directives that enable fairly granular control over the resources that a page is allowed to load. You've already seen `script-src`, so the concept should be clear. Let's quickly walk through the rest of the resource directives:

* **`connect-src`** limits the origins to which you can connect (via XHR, WebSockets, and EventSource).
* **`font-src`** specifies the origins that can serve web fonts. Google's Web Fonts could be enabled via `font-src https://themes.googleusercontent.com`
* **`frame-src`** lists the origins that can be embedded as frames. For example: `frame-src https://youtube.com` would enable embedding YouTube videos, but no other origins.
* **`img-src`** defines the origins from which images can be loaded.
* **`media-src`** restricts the origins allowed to deliver video and audio.
* **`object-src`** allows control over Flash and other plugins.
* **`style-src`** is `script-src`'s counterpart for stylesheets.

By default, directives are wide open. If you don't set a specific policy for a directive, let's say `font-src`, then that directive behaves by default as though you'd specified `*` as the valid source (e.g. you could load fonts from everywhere, without restriction).

You can override this default behavior by specifying a **`default-src`** directive. This directive, as you might suspect, will define the defaults for any directive you leave unspecified. If `default-src` is set to `https://example.com`, and you fail to specify a `font-src` directive, then you can load fonts from `https://example.com`, and nowhere else. We specified only `script-src` in our earlier examples, which means that images, fonts, and so on can be loaded from any origin.

You can use as many or as few of these directives as makes sense for your specific application, simply listing each in the HTTP header, separating directives with semicolons. You'll want to make sure that you list _all_ required resources of a specific type in a _single_ directive. If wrote something like `script-src https://host1.com; script-src https://host2.com` the second directive would simply be ignored. `script-src https://host1.com https://host2.com` would correctly specify both origins as valid.

If, for example, you have an application that loads all of it's resources from a content delivery network (say, `https://cdn.example.net`), and know that you don't need framed content or any plugins at all, then your policy might look like the following:

    Content-Security-Policy: default-src https://cdn.example.net; frame-src 'none'; object-src 'none'

### Implementation Details

You will see `X-WebKit-CSP` and `X-Content-Security-Policy` headers in various tutorials on the web. Going forward, you can and should ignore these prefixed headers. Modern browsers (with the exception of IE) support the unprefixed `Content-Security-Policy` header. That's the header you should use.

Regardless of the header you use, policy is defined on a page-by-page basis: you'll need to send the HTTP header along with every response that you'd like to ensure is protected. This provides a lot of flexibility, as you can fine-tune the policy for specific pages based on their specific needs. Perhaps one set of pages in your site has a +1 button, while others don't: you could allow the button code to be loaded only when necessary.

The source list in each directive is fairly flexible. You can specify sources by scheme (`data:`, `https:`), or ranging in specificity from hostname-only (`example.com`, which matches any origin on that host: any scheme, any port) to a fully qualified URI (`https://example.com:443`, which matches only HTTPS, only `example.com`, and only port 443). Wildcards are accepted, but only as a scheme, a port, or in the leftmost position of the hostname: `*://*.example.com:*` would match all subdomains of `example.com` (but _not_ `example.com` itself), using any scheme, on any port.

Four keywords are also accepted in the source list:

* **`'none'`**, as you might expect, matches nothing.
* **`'self'`** matches the current origin, but not its subdomains.
* **`'unsafe-inline'`** allows inline JavaScript and CSS (we'll touch on this in more detail in a bit).
* **`'unsafe-eval'`** allows text-to-JavaScript mechanisms like `eval` (we'll get to this too).

These keywords require single-quotes. `script-src 'self'` authorizes the execution of JavaScript from the current host. `script-src self` allows JavaScript from a server named "`self`" (and _not_ from the current host), which probably isn't what you meant.

### Sandboxing

There's one more directive worth talking about: **`sandbox`**. It's a bit different than the others we've looked at, as is places restrictions on actions the page can take, rather than on resources that the page can load. If the `sandbox` directive is present, the page will be treated as though it was loaded inside of an `iframe` with a `sandbox` attribute. This can have a wide range of effects on the page: forcing the page into a unique origin, and preventing form submission, among others. It's a bit beyond the scope of this article, but you can find full details on valid sandboxing attributes in the ["sandboxing flag set" section of the HTML5 spec](http://www.whatwg.org/specs/web-apps/current-work/multipage/origin-0.html#sandboxing-flag-set).

## Inline Code Considered Harmful

It should be clear that CSP is based on whitelisting origins, as that's an unambiguous way of instructing the browser to treat specific sets of resources as acceptable and to reject the rest. Origin-based whitelisting doesn't, however, solve the biggest threat posed by XSS attacks: inline script injection. If an attacker can inject a script tag that directly contains some malicious payload (`<script>sendMyDataToEvilDotCom();</script>`), the browser has no mechanism by which to distinguish it from a legitimate inline script tag. CSP solves this problem by banning inline script entirely: [it's the only way to be sure](https://www.youtube.com/watch?v=aCbfMkh940Q).

This ban includes not only scripts embedded directly in `script` tags, but also inline event handlers and `javascript:` URLs. You'll need to move the content of `script` tags into an external file, and replace `javascript:` URLs and `<a ... onclick="[JAVASCRIPT]">` with appropriate `addEventListener` calls. For example, you might rewrite the following from:

    <script>
      function doAmazingThings() {
        alert('YOU AM AMAZING!');
      }
    </script>
    <button onclick='doAmazingThings();'>Am I amazing?</button>

to something more like:

    <!-- amazing.html -->
    <script src='amazing.js'></script>
    <button id='amazing'>Am I amazing?</button>
^
    // amazing.js
    function doAmazingThings() {
      alert('YOU AM AMAZING!');
    }
    document.addEventListener('DOMContentReady', function () {
      document.getElementById('amazing')
              .addEventListener('click', doAmazingThings);
    });

The rewritten code has a number of advantages above and beyond working well with CSP; it's already best practice, regardless of your use of CSP. Inline JavaScript mixes structure and behavior in exactly the way you shouldn't. External resources are easier for browsers to cache, more understandable for developers, and conducive to compilation and minification. You'll write better code if you do the work to move code into external resources. 

Inline style is treated in the same way: both the `style` attribute and `style` tags should be consolidated into external stylesheets to protect against a variety of [surprisingly clever](http://scarybeastsecurity.blogspot.com/2009/12/generic-cross-browser-cross-domain.html) data exfiltration methods that CSS enables. 

If you really, absolutely must have inline script and style, you can enable it by adding `'unsafe-inline'` as an allowed source in a `script-src` or `style-src` directive. But please don't. Banning inline script is the biggest security win CSP provides, and banning inline style likewise hardens your application. It's a little bit of effort up front to ensure that things work correctly after moving all the code out-of-line, but that's a tradeoff that's well worth making.

## Eval Too

Even when an attacker can't inject script directly, she might be able to trick your application into converting otherwise inert text into executable JavaScript and executing it on her behalf. `eval()`, `new Function()`, `setTimeout([string], ...)`, `and setInterval([string], ...)` are all vectors through which injected text might end up executing something unexpectedly malicious. CSP's default response to this risk is, unsurprisingly, to block all of these vectors completely.

This has a more than few impacts on the way you build applications:

*   Parse JSON via the built-in `JSON.parse`, rather than relying on `eval`. Native JSON operations are available in [every browser since IE8](http://caniuse.com/#feat=json), and they're completely safe.
*   Rewrite any `setTimeout` or `setInterval` calls you're currently making with inline functions rather than strings. For example:

        setTimeout("document.querySelector('a').style.display = 'none';", 10);

    would be better written as:

        setTimeout(function () {
          document.querySelector('a').style.display = 'none';
        }, 10);

*   Avoid inline templating at runtime: Many templating libraries use `new Function()` liberally to speed up template generation at runtime. It's a nifty application of dynamic programming, but comes at the risk of evaluating malicious text. Some frameworks support CSP out of the box, falling back to a robust parser in the absence of `eval`; [AngularJS's ng-csp directive](http://docs.angularjs.org/api/angular.module.ng.$compileProvider.directive.ngCsp) is a good example of this.

You're even better off, however, if your templating language of choice offers precompilation ([Handlebars does](http://handlebarsjs.com/precompilation.html), for instance). Precompiling your templates can make the user experience even faster than the fastest runtime implementation, and it's safer too. Win, win!
If eval and its text-to-JavaScript brethren are completely essential to your application, you can enable them by adding `'unsafe-eval'` as an allowed source in a `script-src` directive. But, again, please don't. Banning the ability to execute strings makes it much more difficult for an attacker to execute unauthorized code on your site. 

## Reporting

CSP's ability to block untrusted resources client-side is a huge win for your users, but it would be quite helpful indeed to get some sort of notification sent back to the server so that you can identify and squash any bugs that allow malicious injection in the first place. To this end, you can instruct the browser to `POST` JSON-formatted violation reports to a location specified in a **`report-uri`** directive.

    Content-Security-Policy: default-src 'self'; ...; report-uri /my_amazing_csp_report_parser;

Those reports will look something like the following:

    {
      "csp-report": {
        "document-uri": "http://example.org/page.html",
        "referrer": "http://evil.example.com/",
        "blocked-uri": "http://evil.example.com/evil.js",
        "violated-directive": "script-src 'self' https://apis.google.com",
        "original-policy": "script-src 'self' https://apis.google.com; report-uri http://example.org/my_amazing_csp_report_parser"
      }
    }

It contains a good chunk of information that will help you track down the specific cause of the violation, including the page on which the violation occurred (**`document-uri`**), that page's referrer (referrer, note that the key is _not_ misspelled), the resource that violated the page's policy (**`blocked-uri`**), the specific directive it violated (**`violated-directive`**), and the page's complete policy (**`original-policy`**).

### Report-Only

If you're just starting out with CSP, it makes sense to evaluate the current state of your application before rolling out a draconian policy to your users. As a stepping stone to a complete deployment, you can ask the browser to monitor a policy, reporting violations, but not enforcing the restrictions. Instead of sending a `Content-Security-Policy` header, send a `Content-Security-Policy-Report-Only` header.

    Content-Security-Policy-Report-Only: default-src 'self'; ...; report-uri /my_amazing_csp_report_parser;

The policy specified in report-only mode won't block restricted resources, but it will send violation reports to the location you specify. You can even send _both_ headers, enforcing one policy while monitoring another. This is a great way to evaluate the effect of changes to your application's CSP: turn on reporting for a new policy, monitor the violation reports and fix any bugs that turn up, then start enforcing the new policy once you're satisfied with its effect.

## Real World Usage

CSP is quite usable in Chrome 16+, Safari 6+, and Firefox 4+, and has (very) limited support in IE 10. Massive sites like Twitter and Facebook have deployed the header ([Twitter's case study](https://blog.twitter.com/2011/improving-browser-security-csp) is worth a read), and the standard is very much ready for you to start deploying on your own sites.

The first step towards crafting a policy for your application is to evaluate the resources you're actually loading. Once you think you have a handle on how things are put together in your app, set up a policy based on those requirements. Let's walk through a few common use-cases, and determine how we'd best be able to support them within the protective confines of CSP:

### Use Case #1: Social media widgets

* Google's [+1 button](http://www.google.com/intl/en/webmasters/+1/button/index.html) includes script from `https://apis.google.com`, and embeds an `iframe` from `https://plusone.google.com`. You'll need a policy that includes both these origins in order to embed the button. A minimal policy would be `script-src https://apis.google.com; frame-src https://plusone.google.com`. You'll also need to ensure that the snippet of JavaScript that Google provides is pulled out into an external JavaScript file.

* Facebook's [Like button](http://developers.facebook.com/docs/reference/plugins/like/) has a number of implementation options. I'd recommend sticking with the `iframe` version, as it's safely sandboxed from the rest of your site. That would require a `frame-src https://facebook.com` directive to function properly. Note that, by default, the `iframe` code Facebook provides loads a relative URL, `//facebook.com`. Please change that to explicitly specify HTTPS: `https://facebook.com`. There's no reason to use HTTP if you don't have to.

* Twitter's [Tweet button](https://twitter.com/about/resources/buttons) relies on access to a script and frame, both hosted at `https://platform.twitter.com` (Twitter likewise provides a relative URL by default: please edit the code to specify HTTPS when copy/pasting it locally). You'll be all set with `script-src https://platform.twitter.com; frame-src https://platform.twitter.com`, as long as you move the JavaScript snippet Twitter provides out into an external JavaScript file.

* Other platforms will have similar requirements, and can be addressed similarly. I'd suggest just setting a `default-src` of `'none'`, and watching your console to determine which resources you'll need to enable to make the widgets work.

Including multiple widgets is straightforward: simply combine the policy directives, remembering to merge all resources of a single type into a single directive. If you wanted all three, the policy would look like:

    script-src https://apis.google.com https://platform.twitter.com; frame-src https://plusone.google.com https://facebook.com https://platform.twitter.com

### Use Case #2: Lockdown

Assume for a moment that you run a banking site, and want to make very sure that only those resources you've written yourself can be loaded. In this scenario, start with a default policy that blocks absolutely everything (`default-src 'none'`), and build up from there.

Let's say the bank loads all images, style, and script from a CDN at `https://cdn.mybank.net`, and connects via XHR to `https://api.mybank.com/` to pull various bits of data down. Frames are used, but only for pages local to the site (no third-party origins). There's no Flash on the site, no fonts, no nothing. The most restrictive CSP header that we could send in this scenario is:

    Content-Security-Policy: default-src 'none'; script-src https://cdn.mybank.net; style-src https://cdn.mybank.net; img-src https://cdn.mybank.net; connect-src https://api.mybank.com; frame-src 'self'

### Use Case #3: SSL Only

A wedding-ring discussion forum admin wants to ensure that all resources are only loaded via secure channels, but doesn't really write much code; rewriting large chunks of the third-party forum software that's filled to the brim with inline script and style is beyond his abilities. The following policy would be effective:

    Content-Security-Policy: default-src https:; script-src https: 'unsafe-inline'; style-src https: 'unsafe-inline'

Even though `https:` was specified in `default-src`, the script and style directives don't automatically inherit that source. Each directive overwrites the default completely for that specific type of resource.

## The Future

Content Security Policy 1.0 is a [W3C Candidate Recommendation](http://www.w3.org/TR/CSP), and browser vendors have rapidly adopted the standard. That said, the W3C's [Web Application Security Working Group](http://www.w3.org/2011/webappsec/) isn't lounging around, patting itself on the back; work has already begun on the specification's next iteration. [Content Security Policy 1.1's Editors' Draft](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html) is under active development.

CSP 1.1 has a few interesting bits on the drawing board, a few are worth highlighting here:

* **Support for inline script and style:** Though it's best to avoid inline script and style, as discussed above, there's a distinct need for both from that CSP currently doesn't address. 1.1 will change this by allowing developers to whitelist specific blocks via either nonces or hashes. The exact syntax is still being worked out.

* **Policy injection via `meta` tags:** CSP's preferred delivery mechanism is an HTTP header. It can be very useful, however, to set a policy on a page directly in the markup, or via script. There's some healthy debate about whether or not setting policy from within the same document to which the policy should apply, but it appears to have a solid enough use-case to make it into the next iteration. The [`meta` element portion of the spec](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#html-meta-element--experimenta) is far enough along that WebKit has already implemented the feature, so you can play around with it now in Chrome: throw `<meta http-equiv="Content-Security-Policy" content="[POLICY GOES HERE]">` in the head of your document, and you're good to go.

    You can even inject a policy at runtime by adding the `meta` tag via script. A good first step towards a fully locked-down application is to inject an appropriate policy after your application has loaded all the resources it needs, and "booted up". This gives you a mostly secure site (there's still significant risk of attack during this vulnerable phase), but allows you to reap some of the advantage of CSP while migrating to the HTTP header.

* **DOM API:** If this feature makes it into the next iteration of CSP, you'll have the ability to query a page's current policy via JavaScript, which will enable you to make runtime decisions about implementations, and gracefully settle on something that will work for the environment in which your code finds itself. If `eval()` is available, for example, your code might implement some feature differently. This will be particularly useful for framework authors; the API spec is still very much in flux, and you'll find the most up-to-date iteration in the ["Script Interfaces" section of the draft spec](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#script-interfaces).

* **New directives:** A variety of new directives are being discussed, including [**`plugin-types`**](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#plugin-types--experimental), which would limit the `MIME` types of content for which plugins could be loaded; [**`form-action`**](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#form-action--experimental), which would allow form submission to only specific origins; and a few others that are [currently less completely specified](https://dvcs.w3.org/hg/content-security-policy/raw-file/tip/csp-specification.dev.html#frame-options--experimental).

If you're interested in the discussion around these upcoming features, [skim the public-webappsec@ mailing list archives](http://lists.w3.org/Archives/Public/public-webappsec/), or join in yourself.
