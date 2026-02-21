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
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_hero_v9c_strict.png'), fullPage: false });
        console.log(' -> secondhand_photo_hero_v9c_strict.png');

        console.log('2. Capturing Item List (scrolling down)...');
        await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_list_v9c_strict.png'), fullPage: false });
        console.log(' -> secondhand_photo_list_v9c_strict.png');

        // DOM PROOF: Extract img.src for list card images
        const imgSrcs = await page.evaluate(() =>
            Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.includes('demo-assets'))
        );
        console.log('   === DevTools DOM IMG SRC PROOF (3 list cards) ===');
        imgSrcs.slice(0, 3).forEach((src, i) => console.log(`   Card ${i + 1} img.src: ${src}`));
        console.log('   === END DOM PROOF ===');

        console.log('3. Capturing Empty State (Search for gibberish)...');
        await page.goto(`${BASE}/items?keywords=gibberish12345`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_empty_v9c_strict.png'), fullPage: false });
        console.log(' -> secondhand_photo_empty_v9c_strict.png');

        console.log('4. Capturing Item Detail...');
        await page.goto(`${BASE}/items/66`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v9c_strict.png'), fullPage: false });
        console.log(' -> secondhand_photo_detail_v9c_strict.png');

        console.log('5. Capturing Toggle and Cartoon Compare...');
        await page.goto(BASE, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));

        let toggled = false;
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
            await page.screenshot({ path: path.join(OUT, 'secondhand_cartoon_compare_v9c_strict.png'), fullPage: false });
            console.log(' -> secondhand_cartoon_compare_v9c_strict.png');
            await page.screenshot({
                path: path.join(OUT, 'secondhand_style_toggle_v9c_strict.webp'),
                type: 'webp',
                quality: 80,
            });
            console.log(' -> secondhand_style_toggle_v9c_strict.webp');
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
