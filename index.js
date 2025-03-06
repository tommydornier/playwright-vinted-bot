const { chromium } = require('playwright');

(async () => {
    console.log("🚀 Démarrage de Playwright...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.vinted.fr');
    console.log("✅ Playwright fonctionne !");
    await browser.close();
})();
