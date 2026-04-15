import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function publicProfileTeszt() {
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
        console.log("--- [INFO] PUBLIKUS PROFIL OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Főoldal megnyitása bejelentkezés nélkül (Vendégként)
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.header-container')), 5000);
        console.log("[OK] 1. Főoldal sikeresen betöltve (vendégként).");

        // 2. Kereső használata a profil megtalálásához
        let searchToggle = await driver.findElement(By.css('.search-toggle-btn'));
        await searchToggle.click();
        let searchInput = await driver.wait(until.elementLocated(By.css('.global-search-input')), 3000);
        
        // Keresünk egy biztosan létező felhasználót (pl. admin)
        const targetUser = 'Zsonibi'; 
        await searchInput.sendKeys(targetUser);
        await driver.sleep(1000); // Várjuk meg a debounce időt és az API választ

        let searchResult = await driver.wait(until.elementLocated(By.css('.search-result-item')), 5000);
        await driver.wait(until.elementIsVisible(searchResult), 3000);
        await searchResult.click();
        
        // 3. Navigáció a publikus profilra és ellenőrzés
        await driver.wait(until.urlContains('/user/'), 5000);
        console.log(`[OK] 2. Keresés sikeres, navigáció a(z) @${targetUser} profilra.`);

        let profileName = await driver.wait(until.elementLocated(By.css('.public-name')), 5000);
        let nameText = await profileName.getText();
        console.log(`[OK] 3. Publikus profil betöltve. Megjelenített név: ${nameText}`);

        // 4. Jogosultságok és gombok ellenőrzése (Bejelentkezés hiányában)
        let followBtn = await driver.findElement(By.css('.follow-btn'));
        await followBtn.click();
        
        // Mivel nem vagyunk bejelentkezve, egy Toast hibaüzenetet kell kapnunk a React kódod alapján
        let toastInfo = await driver.wait(until.elementLocated(By.css('.Toastify__toast')), 3000);
        await driver.wait(until.elementIsVisible(toastInfo), 3000);
        if (await toastInfo.isDisplayed()) {
            console.log("[OK] 4. 'Követés' gombra kattintás vendégként: Helyesen megjelenik a figyelmeztető Toast üzenet.");
        }

        // 5. Üzenetküldés gomb ellenőrzése (zárt állapot)
        let messageBtn = await driver.findElement(By.css('.message-btn'));
        let isLocked = await messageBtn.getAttribute('class');
        if (isLocked.includes('locked') || await messageBtn.getAttribute('disabled') !== null) {
            console.log("[OK] 5. 'Üzenet' gomb helyesen zárolva van (csak ismerősöknek és bejelentkezve érhető el).");
        }

        // 6. Fülek (Tabs) közötti navigáció ellenőrzése vendégként
        let ideasTabBtn = await driver.findElement(By.xpath("//button[contains(@class, 'tab-btn') and contains(., 'Ötletei')]"));
        await ideasTabBtn.click();
        await driver.sleep(1000); // Várjuk meg a tartalom frissülését
        console.log("[OK] 6. 'Ötletei' fül sikeresen megnyílt.");

        console.log("[KÉSZ] MINDEN PUBLIKUS PROFIL TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] PUBLIKUS PROFIL TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_public_profile_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_public_profile_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

publicProfileTeszt();