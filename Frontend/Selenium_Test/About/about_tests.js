import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function aboutPageTeszt() {
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
        console.log("--- [INFO] ABOUT (RÓLUNK) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Navigáció az About oldalra
        await driver.get(`${BASE_URL}/about`);
        console.log("[OK] 1. About oldal megnyitása: OK");

        // 2. Főcím (Hero szekció) ellenőrzése
        let heroTitle = await driver.wait(until.elementLocated(By.css('.about-hero h1')), 5000).getText();
        if (heroTitle.includes('Rólunk')) {
            console.log("[OK] 2. Hero szekció főcíme megjelenik: OK");
        }

        // 3. Küldetéseket bemutató kártyák (3 db) ellenőrzése
        let missionCards = await driver.findElements(By.css('.mission-card'));
        if (missionCards.length === 3) {
            console.log("[OK] 3. Küldetés kártyák (Inspiráció, Megvalósítás, Közösség) megjelennek: OK");
        } else {
            throw new Error(`Hibás kártyaszám: várt 3, kapott ${missionCards.length}`);
        }

        // 3/B. Kártyák szövegének ellenőrzése
        let cardTitles = await driver.findElements(By.css('.mission-card h3'));
        let titleTexts = await Promise.all(cardTitles.map(title => title.getText()));
        if (titleTexts.includes('Inspiráció') && titleTexts.includes('Megvalósítás') && titleTexts.includes('Közösség')) {
            console.log("[OK] 3/B. Küldetés kártyák szövegei helyesek: OK");
        }

        // 4. Készítők adatainak betöltése (Várakozás az API hívásra)
        // Az API hívás időbe telhet, így akár 10 másodpercet is várunk a fejlesztői profilokra.
        let devProfiles = await driver.wait(until.elementsLocated(By.css('.dev-profile')), 10000);
        if (devProfiles.length > 0) {
            console.log(`[OK] 4. Fejlesztői profilok sikeresen betöltődtek az API-ból (${devProfiles.length} db): OK`);
        }

        // 4/B. Fejlesztői profilok hivatkozásainak ellenőrzése
        let devLinks = await driver.findElements(By.css('.dev-name-link'));
        let firstLinkHref = await devLinks[0].getAttribute('href');
        if (firstLinkHref.includes('/user/')) {
            console.log("[OK] 4/B. Fejlesztői profil linkek helyesen a /user/ útvonalra mutatnak: OK");
        }

        // 5. Dokumentáció gomb jelenlétének ellenőrzése
        let docButton = await driver.findElement(By.css('.documentation-btn'));
        let docHref = await docButton.getAttribute('href');
        if (docHref.includes('localhost:3001')) {
            console.log("[OK] 5. Dokumentációs link megfelelő és jelen van: OK");
        }

        // 5/B. Dokumentáció gomb biztonsági és működési attribútumai
        let targetAttr = await docButton.getAttribute('target');
        if (targetAttr === '_blank') {
            console.log("[OK] 5/B. Dokumentációs link biztonságosan, új lapon nyílik meg (target='_blank'): OK");
        }

        // 6. Dokumentáció gomb kattintás és új lap kezelésének tesztelése
        let originalWindow = await driver.getWindowHandle();
        await docButton.click();
        await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 5000);
        
        let windows = await driver.getAllWindowHandles();
        for (let handle of windows) {
            if (handle !== originalWindow) {
                await driver.switchTo().window(handle);
            }
        }
        console.log("[OK] 6. Dokumentáció gomb kattintásra új lapon megnyílt: OK");
        await driver.close(); // Új lap bezárása
        await driver.switchTo().window(originalWindow); // Visszatérés az eredeti lapra

        // 7. Fejlesztői profil link (gomb) kattintásának tesztelése
        let profileLink = await driver.findElement(By.css('.dev-name-link'));
        await profileLink.click();
        await driver.wait(until.urlContains('/user/'), 5000);
        console.log("[OK] 7. Fejlesztői profil linkre kattintás és sikeres navigáció a profilra: OK");

        console.log("[KÉSZ] ABOUT OLDAL TESZTEK SIKERESEN LEFUTOTTAK!");
    } catch (hiba) { 
        console.error("[HIBA] ABOUT TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_about_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_about_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

aboutPageTeszt();