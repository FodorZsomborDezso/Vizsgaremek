import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function ideasTeszt() {
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
        console.log("--- [INFO] ÖTLETBÖRZE (IDEAS) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.get(`${BASE_URL}/ideas`);
        await driver.wait(until.elementLocated(By.css('.ideas-main')), 5000);
        console.log("[OK] 1. Ötletbörze oldal sikeresen betöltve.");

        // Várunk, amíg a kezdeti API hívás befejeződik
        await driver.sleep(2000);

        // 2. Kereső modul tesztelése
        let searchInput = await driver.findElement(By.css('.search-bar input'));
        await searchInput.sendKeys('Design');
        await driver.sleep(1500); // Megvárjuk a debounce (500ms) és a backend válasz idejét
        console.log("[OK] 2. Keresés szimulálása ('Design') sikeres.");

        // Keresés törlése a következő lépésekhez
        for(let i = 0; i < 10; i++) {
            await searchInput.sendKeys(Key.BACK_SPACE);
        }
        await driver.sleep(1000);

        // 3. Kategória szűrő tesztelése
        let categoryBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(@class, 'category-list-item') and text()='3D Render']")), 5000);
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", categoryBtn);
        await driver.sleep(500);
        
        await categoryBtn.click();
        await driver.sleep(1500); // Várunk az API válaszra
        console.log("[OK] 3. Kategória szűrő ('3D Render') sikeresen kiválasztva.");

        // Visszaállítás "Minden kategória" állapotra
        let allCategoryBtn = await driver.findElement(By.xpath("//button[contains(@class, 'category-list-item') and text()='Minden kategória']"));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", allCategoryBtn);
        await driver.sleep(500);
        await allCategoryBtn.click();
        await driver.sleep(1500);

        // 4. Ötlet (Kártya) megnyitása és Modal teszt
        let ideaCards = await driver.findElements(By.css('.idea-card'));
        if (ideaCards.length > 0) {
            await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", ideaCards[0]);
            await driver.sleep(500);
            await ideaCards[0].click();
            
            let modal = await driver.wait(until.elementLocated(By.css('.idea-modal-content')), 3000);
            await driver.wait(until.elementIsVisible(modal), 3000);
            console.log("[OK] 4. Ötlet részletei (Modal) sikeresen megnyílt.");

            // --- ÚJ RÉSZ: Megvalósítás (kép) megnyitása az ötlet alatt ---
            await driver.sleep(1000); // Várjuk meg, amíg az API betölti a megvalósításokat
            let implementations = await driver.findElements(By.css('.impl-card'));
            if (implementations.length > 0) {
                await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", implementations[0]);
                await driver.sleep(500);
                await implementations[0].click();
                
                // Várjuk meg a Post Lightbox (képrészletek) megnyílását
                let postLightbox = await driver.wait(until.elementLocated(By.css('.lightbox-overlay.overlay-z-5000')), 3000);
                await driver.wait(until.elementIsVisible(postLightbox), 3000);
                console.log("[OK] 4/B. Ötlet alatti megvalósítás (kép) Lightbox sikeresen megnyílt.");

                // Post Lightbox bezárása
                let closePostBtn = await driver.findElement(By.css('.lightbox-overlay.overlay-z-5000 .lightbox-close-btn'));
                await closePostBtn.click();
                await driver.sleep(1000); // Animáció várása
            } else {
                console.log("[INFO] 4/B. Nincsenek megvalósítások ehhez az ötlethez, kép megnyitás teszt kihagyva.");
            }

            // Modal bezárása
            let closeBtn = await driver.findElement(By.css('.idea-modal-content .lightbox-close-btn'));
            await closeBtn.click();
            await driver.sleep(1000); // Animáció várása
        } else {
            console.log("[INFO] 4. Nincsenek ötletek az adatbázisban, Modal teszt kihagyva.");
        }

        // 5. Új Ötlet gomb jogosultság ellenőrzése (Vendégként)
        let newIdeaBtn = await driver.findElement(By.css('.new-idea-btn'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", newIdeaBtn);
        await driver.sleep(500);
        await newIdeaBtn.click();

        // Ellenőrizzük, hogy megjelenik-e a Toast és megtörténik-e az átirányítás a loginra
        let toastInfo = await driver.wait(until.elementLocated(By.css('.Toastify__toast')), 3000);
        await driver.wait(until.elementIsVisible(toastInfo), 3000);
        await driver.wait(until.urlContains('/login'), 5000);
        console.log("[OK] 5. 'Új Ötlet' gombra kattintás vendégként: Helyesen figyelmeztet és átirányít a bejelentkezéshez.");

        console.log("[KÉSZ] MINDEN ÖTLETBÖRZE TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] ÖTLETBÖRZE TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_ideas_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_ideas_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

ideasTeszt();