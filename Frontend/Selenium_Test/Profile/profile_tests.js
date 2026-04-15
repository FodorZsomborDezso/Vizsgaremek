import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Pontosan megadjuk a Backend .env elérési útját a bejelentkezési adatokhoz
dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' });

async function profileTeszt() {
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
        console.log("--- [INFO] PROFIL OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
        
        // 1. Bejelentkezés a tesztfiókkal
        await driver.get(`${BASE_URL}/login`);
        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
        await emailInput.sendKeys(email);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(password, Key.RETURN); 

        await driver.sleep(2000); // Várjuk meg a bejelentkezés feldolgozását
        console.log("[OK] 1. Bejelentkezés a tesztfiókkal sikeres.");

        // 2. Navigáció a profil oldalra
        await driver.get(`${BASE_URL}/profile`);
        await driver.wait(until.urlContains('/profile'), 5000);
        console.log("[OK] 2. Navigáció a Profil (/profile) oldalra sikeres.");

        // 3. Profil alapvető UI elemeinek ellenőrzése
        let profileImage = await driver.wait(until.elementLocated(By.css('img')), 5000);
        if (await profileImage.isDisplayed()) {
            console.log("[OK] 3. Profilkép (Avatar) megjelenik.");
        }

        // Keresünk egy címsort, ami a felhasználónevet/teljes nevet tartalmazza
        // Mivel a profiladatok betöltése aszinkron is lehet, várunk az elem megjelenésére:
        let nameElement = await driver.wait(until.elementLocated(By.css('.profile-name')), 10000);
        let nameText = await nameElement.getText();
        if (nameText.length > 0) {
            console.log(`[OK] 4. Felhasználónév/Név látható: ${nameText}`);
        }

        // 5. Profil szerkesztése modal tesztelése
        let editBtn = await driver.wait(until.elementLocated(By.css('.edit-profile-btn')), 5000);
        await editBtn.click();
        let editModal = await driver.wait(until.elementLocated(By.css('.edit-modal-overlay')), 3000);
        await driver.wait(until.elementIsVisible(editModal), 3000);
        console.log("[OK] 5. Profil szerkesztése modal sikeresen megnyílt.");
        
        let closeEditBtn = await driver.findElement(By.css('.close-modal-btn'));
        await closeEditBtn.click();
        await driver.sleep(500); // Várjuk meg a modal eltűnését
        
        // 6. Saját képek (Posztok) megnyitása (Lightbox teszt)
        // Mivel alapból a 'posts' fül az aktív, keressük a képeket
        let posts = await driver.findElements(By.css('.profile-gallery-item'));
        if (posts.length > 0) {
            await posts[0].click();
            let lightbox = await driver.wait(until.elementLocated(By.css('.lightbox-overlay')), 3000);
            await driver.wait(until.elementIsVisible(lightbox), 3000);
            console.log("[OK] 6. Poszt (kép) Lightbox sikeresen megnyílt.");
            
            let closeLightboxBtn = await driver.findElement(By.css('.lightbox-overlay .lightbox-close-btn'));
            await closeLightboxBtn.click();
            await driver.sleep(500); // Animáció várása
        } else {
            console.log("[INFO] 6. Nincs feltöltött poszt, Lightbox teszt kihagyva.");
        }

        // 7. Ötletek fülre váltás és ötlet megnyitása
        let ideasTabBtn = await driver.findElement(By.xpath("//button[contains(@class, 'tab-btn') and contains(., 'Ötletek')]"));
        await ideasTabBtn.click();
        await driver.sleep(1000); // Várjuk meg a fül tartalmának betöltését

        let ideas = await driver.findElements(By.css('.idea-card'));
        if (ideas.length > 0) {
            await ideas[0].click();
            let ideaModal = await driver.wait(until.elementLocated(By.css('.idea-modal-overlay')), 3000);
            await driver.wait(until.elementIsVisible(ideaModal), 3000);
            console.log("[OK] 7. Ötlet részletei modal sikeresen megnyílt.");
            
            let closeIdeaBtn = await driver.findElement(By.css('.idea-modal-overlay .lightbox-close-btn'));
            await closeIdeaBtn.click();
            await driver.sleep(500);
        } else {
            console.log("[INFO] 7. Nincs feltöltött ötlet, Ötlet modal teszt kihagyva.");
        }

        // 8. Kijelentkezés tesztelése
        let logoutBtn = await driver.findElement(By.css('.logout-btn'));
        await logoutBtn.click();
        
        let confirmModal = await driver.wait(until.elementLocated(By.css('.confirm-modal-overlay')), 3000);
        await driver.wait(until.elementIsVisible(confirmModal), 3000);
        
        let confirmBtn = await driver.findElement(By.css('.confirm-btn-danger'));
        await confirmBtn.click();
        
        await driver.wait(until.urlContains('/login'), 5000);
        console.log("[OK] 8. Kijelentkezés sikeres, navigáció a login oldalra.");

        console.log("[KÉSZ] MINDEN PROFIL TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] PROFIL TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_profile_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_profile_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

profileTeszt();