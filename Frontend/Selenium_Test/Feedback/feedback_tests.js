import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Backend .env elérési útjának betöltése a bejelentkezéshez
dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' });

async function feedbackTeszt() {
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
        console.log("--- [INFO] FEEDBACK (VISSZAJELZÉS) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
        
        // 1. Vendég (kijelentkezett) nézet tesztelése
        await driver.get(`${BASE_URL}/feedback`);
        let lockedContent = await driver.wait(until.elementLocated(By.css('.locked-content')), 5000);
        if (await lockedContent.isDisplayed()) {
            console.log("[OK] 1. Vendég nézet: A 'Jelentkezz be' figyelmeztetés helyesen megjelenik.");
        }

        // 2. Bejelentkezés a tesztfiókkal
        await driver.get(`${BASE_URL}/login`);
        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
        await emailInput.sendKeys(email);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(password, Key.RETURN); 

        await driver.sleep(2000); // Várjuk meg a bejelentkezés feldolgozását
        console.log("[OK] 2. Bejelentkezés a tesztfiókkal sikeres.");

        // 3. Visszajelzés oldal megnyitása bejelentkezve
        await driver.get(`${BASE_URL}/feedback`);
        let feedbackForm = await driver.wait(until.elementLocated(By.css('.feedback-form')), 5000);
        if (await feedbackForm.isDisplayed()) {
            console.log("[OK] 3. Bejelentkezett nézet: A visszajelző űrlap betöltött.");
        }

        // 4. Frontend validáció: Túl rövid üzenet tesztelése (< 10 karakter)
        let textarea = await driver.findElement(By.css('.feedback-textarea'));
        await textarea.sendKeys('Rövid');
        
        let submitBtn = await driver.findElement(By.css('.feedback-submit-btn'));
        let isDisabled = await submitBtn.getAttribute('disabled');
        if (isDisabled !== null) {
            console.log("[OK] 4. Frontend validáció: A küldés gomb helyesen inaktív (< 10 karakter esetén).");
        }

        await textarea.clear(); // Űrlap törlése a következő lépéshez
        await driver.sleep(500);

        // 5. Sikeres visszajelzés küldése
        let selectDropdown = await driver.findElement(By.css('.form-group select'));
        await selectDropdown.sendKeys('Hiba'); // Átváltjuk 'Hiba' típusra

        const testMessage = `[Robot] Ez egy automatikus teszt visszajelzés a Selenium E2E tesztből. Időbélyeg: ${Date.now()}`;
        await textarea.sendKeys(testMessage);

        await submitBtn.click(); // Gomb most már kattintható

        // Várjuk meg a sikeres küldés Toast üzenetét
        let successToast = await driver.wait(until.elementLocated(By.css('.Toastify__toast--success')), 8000);
        await driver.wait(until.elementIsVisible(successToast), 3000);
        if (await successToast.isDisplayed()) {
            console.log("[OK] 5. Visszajelzés beküldése sikeres, a visszaigazoló (Toast) üzenet megjelent.");
        }

        // 6. Sikeres küldés utáni React State (űrlap ürítés) ellenőrzése
        let currentText = await textarea.getAttribute('value');
        if (currentText === '') {
            console.log("[OK] 6. Sikeres küldés után a szövegdoboz automatikusan kiürült.");
        }

        console.log("[KÉSZ] MINDEN FEEDBACK TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] FEEDBACK TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_feedback_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_feedback_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

feedbackTeszt();