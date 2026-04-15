import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function homeTeszt() {
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
        await driver.manage().window().maximize();
        console.log("--- [INFO] FŐOLDAL (HOME) TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Főoldal betöltése
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.home-container')), 5000);
        console.log("[OK] 1. Főoldal sikeresen betöltve.");

        // 2. Hero szekció és főcím ellenőrzése
        let heroTitle = await driver.findElement(By.css('.hero-title'));
        let titleText = await heroTitle.getText();
        if (titleText.includes('Oszd meg a vizuális világod.')) {
            console.log("[OK] 2. Hero szekció és a megfelelő főcím megjelenik.");
        }

        // 3. Jellemzők kártyák ellenőrzése
        let featureCards = await driver.findElements(By.css('.feature-card'));
        if (featureCards.length === 3) {
            console.log("[OK] 3. Jellemző (Features) kártyák (3 db) megfelelően megjelennek.");
        }

        // 4. Ranglista (Leaderboard) betöltésének megvárása és ellenőrzése
        // Az API betöltés miatt hagyunk neki egy kis időt
        await driver.sleep(1500);
        let leaderboardGrid = await driver.findElement(By.css('.leaderboard-grid'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", leaderboardGrid);
        
        let leaderboardCards = await driver.findElements(By.css('.leaderboard-card'));
        let emptyMessage = await driver.findElements(By.css('.empty-leaderboard'));
        
        if (leaderboardCards.length > 0) {
            console.log(`[OK] 4. Ranglista (Top 10) betöltött: ${leaderboardCards.length} alkotó jelenik meg.`);
        } else if (emptyMessage.length > 0) {
            console.log("[OK] 4. Ranglista betöltött: Jelenleg nincs elég adat a megjelenítéshez (üres állapot).");
        }

        // 5. Hero kereső tesztelése
        let searchInput = await driver.findElement(By.css('.hero-search-input'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", searchInput);
        await searchInput.sendKeys('Festmény');
        
        let searchBtn = await driver.findElement(By.css('.hero-search-btn'));
        await searchBtn.click();
        
        // Ellenőrizzük a navigációt és az URL paramétert
        await driver.wait(until.urlContains('/gallery?search=Festm%C3%A9ny'), 5000);
        console.log("[OK] 5. Hero kereső működik, navigáció a Galériába (keresési paraméterrel) sikeres.");

        // 6. Felfedezés gomb tesztelése (visszatérünk és megkattintjuk)
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.home-container')), 5000);
        
        let exploreBtn = await driver.findElement(By.css('.btn-primary'));
        await exploreBtn.click();
        await driver.wait(until.urlContains('/gallery'), 5000);
        console.log("[OK] 6. 'Felfedezés' (CTA) gombra kattintás és navigáció sikeres.");

        console.log("[KÉSZ] MINDEN FŐOLDAL TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] FŐOLDAL TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_home_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_home_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

homeTeszt();