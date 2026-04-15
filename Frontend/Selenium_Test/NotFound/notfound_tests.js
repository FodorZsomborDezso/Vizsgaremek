import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function notFoundTeszt() {
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
        console.log("--- [INFO] 404 NOT FOUND OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Navigálás egy szándékosan nem létező oldalra
        await driver.get(`${BASE_URL}/ez-egy-nem-letezo-oldal-url-12345`);
        let notFoundContainer = await driver.wait(until.elementLocated(By.css('.notfound-container')), 5000);
        await driver.wait(until.elementIsVisible(notFoundContainer), 5000);
        console.log("[OK] 1. Nem létező URL megnyitása: A 404-es oldal sikeresen betöltött.");

        // 2. Címsorok (404 és alcím) ellenőrzése
        let title = await driver.findElement(By.css('.notfound-title')).getText();
        let subtitle = await driver.findElement(By.css('.notfound-subtitle')).getText();

        if (title.includes('404') && subtitle.includes('Hoppá! Eltévedtél a galériában?')) {
            console.log("[OK] 2. A 404-es hibakód és az alcím helyesen megjelenik.");
        }

        // 3. Vissza a főoldalra gomb tesztelése
        let backHomeBtn = await driver.findElement(By.css('.notfound-btn'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", backHomeBtn);
        await driver.sleep(500); 
        await backHomeBtn.click();

        // 4. Navigáció ellenőrzése
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log("[OK] 3. 'Vissza a biztonságba' gombra kattintás és navigáció a főoldalra sikeres.");

        console.log("[KÉSZ] MINDEN NOT FOUND TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] NOT FOUND TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_notfound_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_notfound_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

notFoundTeszt();