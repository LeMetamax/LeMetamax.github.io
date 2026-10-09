# Gozcorp Games

Static studio website for https://lemetamax.github.io/. No build step or runtime dependencies.

## Local Preview

From the parent `Website` directory:

```powershell
node "MetamaxWeb/tools/preview.mjs"
```

Open http://localhost:4173/. The preview server also serves the sibling Exbots repository at `/Exbots-Revolution/`, matching GitHub Pages. Production URLs and metadata remain unchanged on disk.

## Deployment

Keep this repository's existing GitHub Pages configuration. Publish the root containing `index.html`, `assets`, `robots.txt`, `sitemap.xml`, and `app-ads.txt`. Publish the Exbots repository separately at its existing project URL. No custom domain is required.

## Content and Assets

- Game names, descriptions, icons and screenshots: the six linked Google Play listings, checked October 9, 2026.
- Studio description and social links: https://www.youtube.com/@gozcorpgames/about.
- Exbots promotional art and studio branding: supplied in the sibling `Raw` folder.
- WebP files are optimized web copies; PNG files retain the source media. No generated gameplay or placeholder imagery.
- Videos link to YouTube rather than loading third-party embeds before a visitor chooses to watch.
- Google Fonts provides Barlow Condensed and DM Sans, with system fallbacks.

Edit `index.html` for content, `assets/site.css` for the visual system, and `assets/site.js` for menu and gallery interactions. Copy CSS and JS to the Exbots repository after shared updates so each deployment remains self-contained.

To regenerate optimized images, install Pillow and run `python "MetamaxWeb/tools/optimize_assets.py"` from `Website`.

Legal links are explicitly labelled as Exbots policies. Their wording and effective dates have not been rewritten or certified for compliance.

## Browser Checks

With the preview server running, install test tools outside the website and run:

```powershell
npm install --prefix "$env:TEMP/gozcorp-browser-tests" playwright @axe-core/playwright
$env:PLAYWRIGHT_BROWSERS_PATH = "$env:TEMP/gozcorp-browser-tests/browsers"
node "$env:TEMP/gozcorp-browser-tests/node_modules/playwright/cli.js" install chromium
node "MetamaxWeb/tools/test-site.mjs"
```

The checks cover all four pages at 320, 375, 700, 768, 1024, and 1440 pixels, local resources, image decoding, anchor targets, menus, gallery keyboard dismissal and focus restoration, FAQs, and automated WCAG accessibility checks. Screenshots are written to the system temporary folder. Automated checks do not replace manual accessibility testing.
