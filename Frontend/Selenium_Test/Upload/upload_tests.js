import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Pontosan megadjuk a Backend .env elérési útját a bejelentkezési adatokhoz
dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' });

// Létrehozunk egy apró, 1x1 pixeles teszt képet (PNG), amit majd fel fogunk tölteni
const TEST_IMAGE_PATH = path.resolve('selenium_test_image.png');
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
fs.writeFileSync(TEST_IMAGE_PATH, Buffer.from(base64Png, 'base64'));

async function uploadTeszt() {
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
        console.log("--- [INFO] FELTÖLTÉS (UPLOAD) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
        
        // 1. Bejelentkezés a tesztfiókkal
        await driver.get(`${BASE_URL}/login`);
        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
        await emailInput.sendKeys(email);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(password, Key.RETURN); 
        await driver.sleep(2000);
        console.log("[OK] 1. Bejelentkezés a tesztfiókkal sikeres.");

        // 2. Navigáció az Upload oldalra
        await driver.get(`${BASE_URL}/upload`);
        let uploadContainer = await driver.wait(until.elementLocated(By.css('.upload-page-container')), 5000);
        await driver.wait(until.elementIsVisible(uploadContainer), 5000);
        console.log("[OK] 2. Feltöltés oldal betöltve.");

        // 3. Fájl "kiválasztása" (Rejtett input mezőbe küldjük a fájl útvonalát)
        let fileInput = await driver.findElement(By.css('input[type="file"]'));
        await fileInput.sendKeys(TEST_IMAGE_PATH);
        
        // Megvárjuk a kép előnézetének megjelenését
        let previewItem = await driver.wait(until.elementLocated(By.css('.preview-item')), 5000);
        await driver.wait(until.elementIsVisible(previewItem), 3000);
        console.log("[OK] 3. Teszt kép sikeresen kiválasztva, előnézet megjelent.");

        // 4. Űrlap kitöltése
        // Kategória váltás (pl. 4 = Digitális Art)
        let categorySelect = await driver.findElement(By.css('.select-input'));
        await categorySelect.sendKeys('Digitális Art');

        // Cím megadása
        let titleInput = await driver.findElement(By.css('input[placeholder*="Adj egy találó nevet"]'));
        const testTitle = `Selenium E2E Teszt Poszt - ${Date.now()}`;
        await titleInput.sendKeys(testTitle);

        // Leírás megadása
        let descInput = await driver.findElement(By.css('textarea[placeholder*="Meséld el"]'));
        await descInput.sendKeys('Ezt az alkotást a Selenium WebDriver töltötte fel automatikusan a tesztelés során.');

        // Címkék megadása
        let tagInput = await driver.findElement(By.css('.tag-input-field'));
        await tagInput.sendKeys('e2eteszt', Key.ENTER);
        await driver.sleep(500); // Várjuk meg a tag bekerülését a listába
        await tagInput.sendKeys('selenium', Key.ENTER);

        console.log("[OK] 4. Kategória, Cím, Leírás és Címkék sikeresen kitöltve.");

        // 5. Posztolás (Beküldés a szerverre)
        let submitBtn = await driver.findElement(By.css('.submit-upload-btn'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
        await submitBtn.click();
        console.log("[VÁRAKOZÁS] 5. Adatok beküldése folyamatban...");

        // Várjuk meg a sikeres feltöltést jelző Toast üzenetet
        let successToast = await driver.wait(until.elementLocated(By.css('.Toastify__toast--success')), 15000);
        await driver.wait(until.elementIsVisible(successToast), 5000);
        console.log("[OK] 6. Feltöltés sikeres, a visszaigazoló (Toast) üzenet megjelent.");

        // Ellenőrizzük az átirányítást a Profil oldalra
        await driver.wait(until.urlContains('/profile'), 5000);
        console.log("[OK] 7. Sikeres átirányítás a Profil oldalra.");

        console.log("[KÉSZ] MINDEN FELTÖLTÉS TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] FELTÖLTÉS TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_upload_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_upload_teszt.png");
    } finally { 
        // Letöröljük a generált tesztképet a futás végén
        if (fs.existsSync(TEST_IMAGE_PATH)) {
            fs.unlinkSync(TEST_IMAGE_PATH);
        }
        await driver.quit(); 
    }
}

uploadTeszt();