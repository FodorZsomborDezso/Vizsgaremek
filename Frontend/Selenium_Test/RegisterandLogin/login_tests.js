import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' });

async function loginTeszt() {
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
        console.log("--- [INFO] BEJELENTKEZÉS (LOGIN) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.get(`${BASE_URL}/login`);
        let authCard = await driver.wait(until.elementLocated(By.css('.auth-card')), 5000);
        await driver.wait(until.elementIsVisible(authCard), 5000);
        console.log("[OK] 1. Bejelentkezés oldal sikeresen betöltve.");

        // 2. UI funkciók: Jelszó láthatóság és Emlékezz rám
        let passInput = await driver.findElement(By.css('input[name="password"]'));
        let toggleIcon = await driver.findElement(By.css('.password-toggle-icon'));
        let rememberMe = await driver.findElement(By.css('.remember-me-checkbox'));

        await passInput.sendKeys('titkosjelszo');
        await toggleIcon.click();
        let passType = await passInput.getAttribute('type');
        if (passType === 'text') {
            console.log("[OK] 2. Jelszó láthatóság (szem ikon) kapcsoló megfelelően működik.");
        }
        
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", rememberMe);
        await rememberMe.click();
        console.log("[OK] 3. 'Emlékezz rám' checkbox sikeresen bepipálva.");

        // 3. Sikertelen bejelentkezés (Rossz adatok)
        let emailInput = await driver.findElement(By.css('input[name="email"]'));
        await emailInput.sendKeys('nemletezo@example.com');
        
        let submitBtn = await driver.findElement(By.css('.auth-btn'));
        await submitBtn.click();

        let errorMsg = await driver.wait(until.elementLocated(By.css('.error-msg')), 5000);
        await driver.wait(until.elementIsVisible(errorMsg), 5000);
        console.log("[OK] 4. Sikertelen bejelentkezés: A hibaüzenet helyesen megjelent az oldalon.");

        // 4. Sikeres bejelentkezés (Közben töröljük a mezőket)
        await emailInput.clear();
        await passInput.clear();
        
        await emailInput.sendKeys(process.env.TEST_ADMIN_EMAIL);
        await passInput.sendKeys(process.env.TEST_ADMIN_PASSWORD);
        await submitBtn.click();

        await driver.wait(until.urlContains('/profile'), 5000);
        console.log("[OK] 5. Sikeres bejelentkezés: Navigáció a profil oldalra megtörtént.");

        console.log("[KÉSZ] MINDEN LOGIN TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] LOGIN TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_login_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_login_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

loginTeszt();