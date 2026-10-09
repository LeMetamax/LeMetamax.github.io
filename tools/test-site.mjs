import { createRequire } from 'node:module';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';

// Use an isolated Playwright installation; it is not a website dependency.
const require = createRequire(path.join(os.tmpdir(), 'gozcorp-browser-tests', 'package.json'));
process.env.PLAYWRIGHT_BROWSERS_PATH = path.join(os.tmpdir(), 'gozcorp-browser-tests', 'browsers');
const { chromium } = require('playwright');
const { default: AxeBuilder } = require('@axe-core/playwright');
const browser = await chromium.launch({ headless: true });
const pages = ['/', '/Exbots-Revolution/', '/Exbots-Revolution/privacy-policy/', '/Exbots-Revolution/terms-and-conditions/'];
const widths = [320, 375, 700, 768, 1024, 1440];
const errors = [];
try {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const context = await browser.newContext();
        const page = await context.newPage();
        page.on('pageerror', (error) => errors.push(error.message));
        for (let widthIndex = 0; widthIndex < widths.length; widthIndex++) {
            const width = widths[widthIndex];
            await page.setViewportSize({ width, height: 900 });
            await page.goto('http://localhost:4173' + pages[pageIndex], { waitUntil: 'networkidle' });
            await page.evaluate(async () => {
                const images = Array.from(document.images);
                for (let index = 0; index < images.length; index++) {
                    if (images[index].hasAttribute('src')) {
                        images[index].loading = 'eager';
                        await images[index].decode();
                    }
                }
                await document.fonts.ready;
            });
            const layout = await page.evaluate(() => ({
                viewport: document.documentElement.clientWidth,
                content: document.documentElement.scrollWidth,
                headings: document.querySelectorAll('h1').length,
                missingAnchors: Array.from(document.querySelectorAll('a[href^="#"]')).filter(link => !document.getElementById(link.hash.slice(1))).map(link => link.hash)
            }));
            assert.ok(layout.content <= layout.viewport + 1, `${pages[pageIndex]} overflows at ${width}: ${JSON.stringify(layout)}`);
            assert.equal(layout.headings, 1);
            assert.deepEqual(layout.missingAnchors, []);
            if (width === 1440) {
                const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
                assert.deepEqual(accessibility.violations.map(violation => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map(node => node.target) })), []);
            }
            if (pageIndex < 2 && width < 701) {
                const menu = page.locator('.menu-toggle');
                await menu.click();
                assert.equal(await menu.getAttribute('aria-expanded'), 'true');
                await page.keyboard.press('Escape');
                assert.equal(await menu.getAttribute('aria-expanded'), 'false');
                await menu.click();
                await page.locator('#navigation a').first().click();
                assert.equal(await menu.getAttribute('aria-expanded'), 'false');
            }
            if (pageIndex === 1 && (width === 375 || width === 1440)) {
                const thumbnail = page.locator('[data-gallery]').first();
                await thumbnail.click();
                assert.equal(await page.locator('dialog').evaluate(element => element.open), true);
                await page.keyboard.press('Escape');
                assert.equal(await page.locator('dialog').evaluate(element => element.open), false);
                assert.equal(await page.evaluate(() => document.activeElement === document.querySelector('[data-gallery]')), true);
                await page.locator('summary').first().click();
                assert.equal(await page.locator('details').first().getAttribute('open'), '');
            }
            const urls = await page.locator('a[href],img[src],link[rel="stylesheet"],script[src]').evaluateAll(elements => elements.map(element => element.href || element.src).filter(url => url.startsWith('http://localhost:4173')));
            for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
                const response = await page.request.get(urls[urlIndex]);
                assert.ok(response.ok(), `Missing local resource ${urls[urlIndex]}: ${response.status()}`);
            }
            if (pageIndex < 2 && (width === 375 || width === 1440)) {
                await page.locator('body').click({ position: { x: 1, y: 1 } });
                await page.evaluate(() => {
                    const expanded = document.querySelectorAll('details[open]');
                    for (let index = 0; index < expanded.length; index++) {
                        expanded[index].open = false;
                    }
                });
                await page.evaluate(() => scrollTo(0, 0));
                await page.waitForFunction(() => window.scrollY === 0);
                const name = pageIndex === 0 ? 'studio' : 'exbots';
                await page.screenshot({ path: path.join(os.tmpdir(), `${name}-${width}.png`), fullPage: true });
            }
            console.log(`PASS ${pages[pageIndex]} at ${width}px: layout, images, anchors, resources and interactions`);
        }
        await context.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: no browser JavaScript errors');
} finally {
    await browser.close();
}
