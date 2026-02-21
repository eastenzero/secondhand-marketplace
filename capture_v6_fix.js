const puppeteer = require('puppeteer');
const path = require('path');

const OUT = '/home/easten/github/bridge-current/outbox/artifacts';
const BASE = 'http://localhost:15176';

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Switch to photo mode first
    console.log('Switching to photo mode...');
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    const buttons = await page.$$('button');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text && text.includes('照片')) {
            await btn.click();
            console.log('   Toggled to photo mode');
            break;
        }
    }
    await new Promise(r => setTimeout(r, 3000));

    // Navigate to an item detail
    console.log('Going to item detail...');
    await page.goto(BASE + '/items/10', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v6.png'), fullPage: false });
    console.log('   -> secondhand_photo_detail_v6.png saved');

    // Create toggle recording as webp (take a screenshot in webp format showing the toggle)
    console.log('Creating toggle recording screenshot...');
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({
        path: path.join(OUT, 'secondhand_style_toggle_v6.webp'),
        type: 'webp',
        quality: 80,
    });
    console.log('   -> secondhand_style_toggle_v6.webp saved');

    await browser.close();
    console.log('Done!');
})().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
