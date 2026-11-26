# PingSolve website (pingsolveai.com)

A static site for PingSolve's apps. GitHub Pages publishes `main` to https://pingsolveai.com, so pushing to `main` puts changes live.

## Structure

- **index.html**: landing page with an icon card for each app (styles in `css/landing.css`, motion in `js/landing.js`).
- **custom.html**: the PingSolve Studio page (custom AI automations, software and coaching), linked from the landing page's "Your App" tile and the pill above the headline. Styles in `css/custom.css`, demo and contact form in `js/custom.js`; it also loads the landing page's background and icon spin.
- **<app>.html**: each app's own page, styled like the app, with its stylesheet in `css/<app>.css` and images in a folder named after the app (for example `hitline/img/`).
- **<app>-support.html**, **<app>-privacy.html**, **<app>-terms.html**: help and legal pages for apps whose legal pages live here.
- **touchbattle*.html**: forwards to the Hitline pages. TouchBattle became Hitline; keep these files so old links (including the App Store's older privacy URL) keep working.
- **sitemap.xml**, **robots.txt**: for search engines. Add a new page to `sitemap.xml` and to the landing page's structured data.

`css/main.css` is the original shared stylesheet; WaitlistPoker's page still uses it.
