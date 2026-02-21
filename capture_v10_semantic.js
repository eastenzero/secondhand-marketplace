const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT = '/home/easten/github/bridge-current/outbox/artifacts';
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:15176';

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
        // Hero
        console.log('1. Hero...');
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await new Promise(r => setTimeout(r, 3000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_hero_v10_semantic.png'), fullPage: false });

        // List
        console.log('2. List...');
        await page.evaluate(() => window.scrollBy(0, window.innerHeight / 2));
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_list_v10_semantic.png'), fullPage: false });

        // QA: extract image data
        const qaData = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('img'))
                .map(img => img.src)
                .filter(src => src.includes('demo-assets'));
        });
        console.log('QA IMG SRCS:', JSON.stringify(qaData, null, 2));

        // Write QA CSV
        const csvLines = ['img_index,src_url'];
        qaData.forEach((src, i) => csvLines.push(`${i + 1},${src}`));
        fs.writeFileSync(path.join(OUT, 'secondhand_semantic_qa_table_v10.csv'), csvLines.join('\n'));
        console.log(' -> QA CSV written');

        // Empty
        console.log('3. Empty...');
        await page.goto(`${BASE}/items?keywords=gibberish12345`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_empty_v10_semantic.png'), fullPage: false });

        // Detail
        console.log('4. Detail...');
        await page.goto(`${BASE}/items/66`, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 2000));
        await page.screenshot({ path: path.join(OUT, 'secondhand_photo_detail_v10_semantic.png'), fullPage: false });

        // Toggle
        console.log('5. Toggle...');
        await page.goto(BASE, { waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 1500));
        const toggleBtn = await page.$('button svg.lucide-palette, button svg.lucide-camera');
        if (toggleBtn) {
            const btn = await page.evaluateHandle(el => el.closest('button'), toggleBtn);
            await btn.click();
            await new Promise(r => setTimeout(r, 2000));
            await page.screenshot({
                path: path.join(OUT, 'secondhand_style_toggle_v10_semantic.webp'),
                type: 'webp', quality: 80,
            });
            console.log(' -> toggle captured');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
        console.log('Done!');
    }
})();
