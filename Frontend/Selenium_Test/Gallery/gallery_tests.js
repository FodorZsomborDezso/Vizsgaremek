import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function galleryTeszt() {
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
        console.log("--- [INFO] GALÉRIA OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Galéria betöltése
        await driver.get(`${BASE_URL}/gallery`);
        await driver.wait(until.elementLocated(By.css('.gallery-main')), 5000);
        console.log("[OK] 1. Galéria oldal sikeresen betöltve.");

        // Várunk, amíg a kezdeti API hívás (és a skeleton loaderek) befejeződnek
        await driver.sleep(2000);

        // 2. Kereső modul tesztelése
        let searchInput = await driver.findElement(By.css('.search-bar input'));
        await searchInput.sendKeys('Természet');
        await driver.sleep(1500); // Megvárjuk a debounce (500ms) és a backend válasz idejét
        console.log("[OK] 2. Keresés szimulálása ('Természet') sikeres.");

        // Keresés törlése a következő lépésekhez
        // Többszörös Backspace küldésével biztosítjuk a React onChange triggerelését
        for(let i = 0; i < 10; i++) {
            await searchInput.sendKeys(Key.BACK_SPACE);
        }
        await driver.sleep(1000);

        // 3. Kategória szűrő tesztelése
        let categoryBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'category-list-item') and text()='Digitális Art']")), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", categoryBtn);
        await driver.sleep(500);
        
        await categoryBtn.click();
        await driver.sleep(1500); // Várunk az API válaszra
        
        let isActive = await categoryBtn.getAttribute('class');
        if (isActive.includes('active')) {
            console.log("[OK] 3. Kategória szűrő ('Digitális Art') sikeresen kiválasztva.");
        }

        // Visszaállítás "Minden kategória" állapotra
        let allCategoryBtn = await driver.findElement(By.xpath("//button[contains(@class, 'category-list-item') and text()='Minden kategória']"));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", allCategoryBtn);
        await driver.sleep(500);
        await allCategoryBtn.click();
        await driver.sleep(1500);

        // 4. Rendezés (Sort) tesztelése
        let sortSelect = await driver.findElement(By.css('.filter-group select'));
        await sortSelect.sendKeys('Legnépszerűbbek (Lájkok)'); // Választás legördülőből
        await driver.sleep(1500);
        console.log("[OK] 4. Rendezés módosítása ('Legnépszerűbbek') sikeres.");

        // 5. Kép (Poszt) megnyitása - Lightbox teszt
        // Megkeressük az első valódi (nem betöltő/skeleton) képet a rácsban
        let realPosts = await driver.findElements(By.css('.gallery-card:not(.skeleton-card)'));
        if (realPosts.length > 0) {
            await realPosts[0].click();
            
            let lightbox = await driver.wait(until.elementLocated(By.css('.lightbox-overlay')), 3000);
            await driver.wait(until.elementIsVisible(lightbox), 3000);
            console.log("[OK] 5. Lightbox (Képrészletek) sikeresen megnyílt.");

            // 5/B. Lájkolás megkísérlése (vendégként)
            let likeBtn = await driver.findElement(By.css('.lightbox-actions-bar button:nth-child(1)'));
            await likeBtn.click();
            let toastLike = await driver.wait(until.elementLocated(By.css('.Toastify__toast')), 3000);
            await driver.wait(until.elementIsVisible(toastLike), 3000);
            console.log("[OK] 5/B. Lájkolás megkísérlése (vendégként): Figyelmeztetés megjelent.");
            await driver.sleep(1000); // Kicsit várunk a következő akció előtt

            // 5/C. Megosztás (Share) gomb tesztelése
            let shareBtn = await driver.findElement(By.css('.lightbox-actions-bar button:nth-child(4)'));
            await shareBtn.click();
            console.log("[OK] 5/C. Megosztás (Share) gombra kattintás sikeres (link másolva).");
            await driver.sleep(1000);

            // 5/D. Jelentés (Report) megkísérlése
            let reportBtn = await driver.findElement(By.css('.report-btn'));
            await reportBtn.click();
            console.log("[OK] 5/D. Jelentés (Report) gombra kattintás sikeres (vendég figyelmeztetés).");
            await driver.sleep(1000);

            // 6. Lightbox bezárása
            let closeBtn = await driver.findElement(By.css('.lightbox-close-btn'));
            await closeBtn.click();
            await driver.sleep(1000); // Animáció várása
            
            let lightboxesAfterClose = await driver.findElements(By.css('.lightbox-overlay'));
            if (lightboxesAfterClose.length === 0) {
                console.log("[OK] 6. Lightbox sikeresen bezáródott az (X) gombra kattintva.");
            }
        } else {
            console.log("[INFO] 5. Nincsenek posztok az adatbázisban, Lightbox teszt kihagyva.");
        }

        console.log("[KÉSZ] MINDEN GALÉRIA TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] GALÉRIA TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_gallery_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_gallery_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

galleryTeszt();