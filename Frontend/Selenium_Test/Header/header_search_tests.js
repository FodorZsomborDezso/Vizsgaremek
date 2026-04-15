import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function headerSearchTeszt() {
    let options = new chrome.Options();
    options.addArguments('--log-level=3'); 
    options.addArguments('--silent');
    options.addArguments('--disable-logging');
    options.excludeSwitches('enable-logging'); 

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log("--- [INFO] HEADER KERESŐ TESZT INDÍTÁSA ---");
        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.manage().window().maximize();
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.header-container')), 5000);
        console.log("[OK] 1. Oldal és Header sikeresen betöltve.");

        // 2. Kereső megnyitása
        let searchToggle = await driver.findElement(By.css('.search-toggle-btn'));
        await searchToggle.click();
        let searchInput = await driver.wait(until.elementLocated(By.css('.global-search-input')), 3000);
        console.log("[OK] 2. Kereső beviteli mező sikeresen megnyílt.");

        // 3. Keresés egy valós felhasználóra (pl. 'admin')
        await searchInput.sendKeys('Zsonibi');
        await driver.sleep(1000); // Várjuk meg a debounce (300ms) időt és a Backend választ

        let searchResult = await driver.wait(until.elementLocated(By.css('.search-result-item')), 5000);
        let resultText = await searchResult.getText();
        console.log(`[OK] 3. Keresési találat megjelent: ${resultText.replace(/\n/g, ' - ')}`);

        // 4. Kattintás a találatra és navigáció ellenőrzése
        await searchResult.click();
        await driver.wait(until.urlContains('/user/'), 5000);
        console.log("[OK] 4. Navigáció a felhasználó profiljára sikeres.");
        await driver.sleep(500); // Kis szünet az oldal betöltéséhez

        // 5. Nincs találat forgatókönyv tesztelése
        // Újra megnyitjuk a keresőt (A React kódod alapján az isSearchOpen átváltásakor ürül a mező)
        searchToggle = await driver.findElement(By.css('.search-toggle-btn'));
        await searchToggle.click();
        searchInput = await driver.wait(until.elementLocated(By.css('.global-search-input')), 3000);
        
        await searchInput.sendKeys('nemletezofelhasznalo123');
        await driver.sleep(1000); // Várunk az API hívásra

        let noResult = await driver.wait(until.elementLocated(By.css('.search-no-results')), 5000);
        let noResultText = await noResult.getText();
        if (noResultText.includes('Nincs találat')) {
            console.log("[OK] 5. 'Nincs találat' hibaüzenet helyesen megjelent az érvénytelen keresésre.");
        }

        console.log("[KÉSZ] MINDEN KERESŐ TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] HEADER KERESŐ TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_header_search_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_header_search_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

headerSearchTeszt();