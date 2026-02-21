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

    // 1. Cartoon hero (default mode)
    console.log('1. Loading homepage (cartoon mode)...');
    await page.goto(BASE, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_cartoon_hero_v6.png'), fullPage: false });
    console.log('   -> secondhand_cartoon_hero_v6.png saved');

    // 2. Cartoon list - scroll down
    console.log('2. Scrolling to item list (cartoon)...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_cartoon_list_v6.png'), fullPage: false });
    console.log('   -> secondhand_cartoon_list_v6.png saved');

    // 3. Toggle to photo mode
    console.log('3. Toggling to photo mode...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 500));
    // Find and click the toggle button
    const toggleBtn = await page.$('button:has(svg.lucide-camera)');
    if (toggleBtn) {
        await toggleBtn.click();
        console.log('   -> Clicked camera toggle button');
    } else {
        // fallback: search by text
        const buttons = await page.$$('button');
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text && text.includes('照片')) {
                await btn.click();
                console.log('   -> Clicked button containing "照片"');
                break;
            }
        }
    }
    await new Promise(r => setTimeout(r, 3000));

    // 4. Photo hero
    console.log('4. Taking photo hero screenshot...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_photo_hero_v6.png'), fullPage: false });
    console.log('   -> secondhand_photo_hero_v6.png saved');

    // 5. Photo list
    console.log('5. Scrolling to item list (photo)...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_photo_list_v6.png'), fullPage: false });
    console.log('   -> secondhand_photo_list_v6.png saved');

    // 6. Photo detail - click first item
    console.log('6. Navigating to item detail...');
    await page.evaluate(() => window.scrollTo(0, 600));
    await new Promise(r => setTimeout(r, 500));
    const itemCard = await page.$('a[href^="/items/"]');
    if (itemCard) {
        await itemCard.click();
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v6.png'), fullPage: false });
        console.log('   -> secondhand_photo_detail_v6.png saved');
    } else {
        console.log('   -> WARNING: No item card found, taking current page screenshot');
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v6.png'), fullPage: false });
    }

    // 7. Empty state
    console.log('7. Navigating to items list with nonexistent keyword...');
    await page.goto(BASE + '/items?keyword=xyznonexistent123', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(OUT, 'secondhand_photo_empty_v6.png'), fullPage: false });
    console.log('   -> secondhand_photo_empty_v6.png saved');

    await browser.close();
    console.log('\nAll 7 screenshots saved to ' + OUT);
})().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
