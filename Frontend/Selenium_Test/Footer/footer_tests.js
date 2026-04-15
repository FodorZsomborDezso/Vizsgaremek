import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function footerTeszt() {
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
        console.log("--- [INFO] FOOTER (LÁBLÉC) TESZT INDÍTÁSA ---");
        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.manage().window().maximize();
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.footer-container')), 5000);

        // Görgetés az oldal aljára a lábléchez
        let footer = await driver.findElement(By.css('.footer-container'));
        await driver.executeScript("arguments[0].scrollIntoView(true);", footer);
        await driver.sleep(1000); // Várjuk meg a görgetés befejezését
        console.log("[OK] 1. Oldal betöltve és sikeres görgetés a lábléchez.");

        // 1/B. Footer logó megjelenésének ellenőrzése
        let footerLogo = await driver.findElement(By.css('.footer-logo-img'));
        if (await footerLogo.isDisplayed()) {
            console.log("[OK] 1/B. A Footer logó megfelelően megjelenik.");
        }

        // 2. Felfedezés linkek ellenőrzése
        let galleryLink = await driver.findElement(By.xpath("//footer//a[contains(., 'Galéria Böngészése')]"));
        let galleryHref = await galleryLink.getAttribute('href');
        if (galleryHref.includes('/gallery')) {
            console.log("[OK] 2. Felfedezés linkek (pl. Galéria Böngészése) hivatkozásai megfelelőek.");
        }

        // 3. Fejlesztői szekció (GitHub linkek) ellenőrzése
        let githubLinks = await driver.findElements(By.css('.social-links a[href*="github.com"]'));
        if (githubLinks.length === 2) {
            console.log("[OK] 3. Fejlesztői GitHub linkek (Fodor Zsombor, Gerencsér Ákos) jelen vannak.");
        }

        // 4. Hírlevél feliratkozás - Érvénytelen e-mail (Frontend validáció tesztje)
        let emailInput = await driver.findElement(By.css('.newsletter-form input[type="email"]'));
        let submitBtn = await driver.findElement(By.css('.newsletter-form button[type="submit"]'));

        // Olyan rossz emailt adunk meg, amit a HTML5 átenged, de a Regex megfog (hiányzik a .hu/.com)
        await emailInput.sendKeys('teszt@hibas');
        await submitBtn.click();
        
        // Várjuk meg a React Toastify hibaüzenetet
        let toastError = await driver.wait(until.elementLocated(By.css('.Toastify__toast')), 3000);
        await driver.wait(until.elementIsVisible(toastError), 3000); // FIX: Várjuk meg a Toast animációt
        if (await toastError.isDisplayed()) {
            console.log("[OK] 4. Hírlevél: Érvénytelen e-mail megadásakor helyesen megjelenik a hibaüzenet (Toast).");
        }
        
        // Mező törlése a következő lépéshez
        await emailInput.clear();
        await driver.sleep(500); // FIX: Kis szünet, hogy a React üríthesse a mezőt

        // 5. Hírlevél feliratkozás űrlap UI teszt (Helyes e-maillel)
        const testEmail = `teszt_footer_${Date.now()}@example.com`;
        await emailInput.sendKeys(testEmail);
        await submitBtn.click();

        // Várjuk meg a megerősítő ablakot (Modal)
        let modal = await driver.wait(until.elementLocated(By.css('.confirm-modal-overlay')), 3000);
        await driver.wait(until.elementIsVisible(modal), 3000); // FIX: Várjuk meg a Modal beúszását
        if (await modal.isDisplayed()) {
            console.log("[OK] 5. Hírlevél feliratkozás: A megerősítő ablak (Modal) sikeresen megnyílt a helyes e-mail megadása után.");
            
            // Mégse gomb megnyomása a modal bezárásához (csak az UI-t teszteljük)
            let cancelBtn = await driver.findElement(By.css('.confirm-btn-cancel'));
            await cancelBtn.click();
            await driver.sleep(1000); // FIX: Várjuk meg, amíg teljesen eltűnik
            
            let modalsAfterCancel = await driver.findElements(By.css('.confirm-modal-overlay'));
            if (modalsAfterCancel.length === 0) {
                console.log("[OK] 5/B. Hírlevél feliratkozás: A 'Mégse' gombra kattintva a Modal sikeresen bezáródott.");
            }

            // 5/C. Tényleges feliratkozás folyamatának letesztelése a backenddel
            await submitBtn.click(); // Újra megnyitjuk a modalt
            
            let newModal = await driver.wait(until.elementLocated(By.css('.confirm-modal-overlay')), 3000);
            await driver.wait(until.elementIsVisible(newModal), 3000);
            
            let confirmBtn = await driver.findElement(By.css('.confirm-btn-danger'));
            await confirmBtn.click();
            
            let successToast = await driver.wait(until.elementLocated(By.css('.Toastify__toast--success')), 8000);
            await driver.wait(until.elementIsVisible(successToast), 3000); // FIX: Várjuk meg a zöld toast animációját
            if (await successToast.isDisplayed()) {
                console.log(`[OK] 5/C. Hírlevél feliratkozás: Tényleges feliratkozás elküldve (${testEmail}), Toast üzenet megjelent.`);
            }
            
            let placeholder = await emailInput.getAttribute('placeholder');
            let isDisabled = await emailInput.getAttribute('disabled');
            if (placeholder === 'Már feliratkoztál!' && isDisabled) {
                console.log("[OK] 5/D. Hírlevél feliratkozás: A beviteli mező inaktívvá vált, ahogy elvártuk.");
            }
            
            await driver.sleep(1000); // FIX: Várjuk meg, hogy a modal biztosan eltűnjön a 6. lépés előtt
        }

        // 6. Jogi linkek (footer-bottom) ellenőrzése és navigáció
        let privacyLink = await driver.findElement(By.xpath("//footer//a[contains(., 'Adatvédelmi Tájékoztató')]"));
        if (await privacyLink.isDisplayed()) {
            console.log("[OK] 6. Jogi linkek (Adatvédelem, ÁSZF) láthatóak a lábléc alján.");
            
            // Kattintás és navigáció ellenőrzése
            await privacyLink.click();
            await driver.wait(until.urlContains('/adatvedelem'), 5000);
            console.log("[OK] 6/B. Adatvédelmi Tájékoztató linkre kattintás és navigáció sikeres.");
        }

        console.log("[KÉSZ] MINDEN FOOTER TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] FOOTER TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_footer_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_footer_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

footerTeszt();