const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = '/home/easten/github/bridge-current/outbox/artifacts';
if (!fs.existsSync(OUT)) {
    fs.mkdirSync(OUT, { recursive: true });
}
const BASE = 'http://localhost:15176'; // Vite dev server port

(async () => {
    console.log('Starting puppeteer...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.setCacheEnabled(false);

    try {
        console.log('1. Capturing Hero & Homepage...');
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_hero_v9b.png'), fullPage: false });
        console.log(' -> secondhand_photo_hero_v9b.png');

        console.log('2. Capturing Item List (scrolling down)...');
        await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        await new Promise(r => setTimeout(r, 1000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_list_v9b.png'), fullPage: false });
        console.log(' -> secondhand_photo_list_v9b.png');

        console.log('3. Capturing Empty State (Search for gibberish)...');
        await page.goto(`${BASE}/items?keywords=gibberish12345`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_empty_v9b.png'), fullPage: false });
        console.log(' -> secondhand_photo_empty_v9b.png');

        console.log('4. Capturing Item Detail...');
        // Find an active item ID from DB seeded items, e.g. item 2 (furniture_04)
        await page.goto(`${BASE}/items/2`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v9b.png'), fullPage: false });
        console.log(' -> secondhand_photo_detail_v9b.png');

        console.log('5. Capturing Toggle and Cartoon Compare...');
        await page.goto(BASE, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));

        let toggled = false;
        // Find the toggle button containing Camera or Palette icon (usually Lucide icons have class lucide)
        const toggleBtn = await page.$('button svg.lucide-palette, button svg.lucide-camera');
        if (toggleBtn) {
            console.log('   Found toggle icon, clicking parent button...');
            const btn = await page.evaluateHandle(el => el.closest('button'), toggleBtn);
            await btn.click();
            toggled = true;
        }

        if (toggled) {
            console.log('   Toggled to cartoon mode...');
            await new Promise(r => setTimeout(r, 2000));
            // Save compare image
            await page.screenshot({ path: path.join(OUT, 'secondhand_cartoon_compare_v9b.png'), fullPage: false });
            console.log(' -> secondhand_cartoon_compare_v9b.png');

            // Save webp style toggle
            await page.screenshot({
                path: path.join(OUT, 'secondhand_style_toggle_v9b.webp'),
                type: 'webp',
                quality: 80,
            });
            console.log(' -> secondhand_style_toggle_v9b.webp');
        } else {
            console.log('   Could not find the toggle button! Skipping cartoon compare.');
        }

    } catch (err) {
        console.error('Error during capture:', err);
    } finally {
        await browser.close();
        console.log('Done!');
    }
})();
