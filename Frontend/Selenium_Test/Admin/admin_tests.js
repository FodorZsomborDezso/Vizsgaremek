import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' }); // Pontosan megadjuk a Backend .env elérési útját

async function vizsgaremekAdminTesztek() {
    // Chrome beállítások a csendes futtatáshoz a példád alapján
    let options = new chrome.Options();
    options.addArguments('--log-level=3'); 
    options.addArguments('--silent');
    options.addArguments('--disable-logging');
    options.excludeSwitches('enable-logging'); 
    // options.addArguments('--headless'); // Vedd ki a kommentből, ha nem akarod látni a böngészőt (pl. automatizált szerveren)

    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        await driver.manage().window().maximize();
        
        console.log("--- VIZSGAREMEK ADMIN TESZTEK ---");

        // 1. BEJELENTKEZÉS
        const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';
        await driver.get(BASE_URL);
        
        // Belépési folyamat
        await driver.wait(until.elementLocated(By.css('.login-link')), 5000).click();
        await driver.sleep(1000); 

        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        
        const email = process.env.TEST_ADMIN_EMAIL;
        const password = process.env.TEST_ADMIN_PASSWORD;
        
        await emailInput.sendKeys(email); // Admin email címed az .env-ből
        await driver.findElement(By.css('input[type="password"]')).sendKeys(password, Key.RETURN); 

        await driver.sleep(2000); // Várjuk meg a bejelentkezés feldolgozását
        console.log("[OK] 1. Bejelentkezés admin fiókkal: OK");

        // 2. ADMIN DASHBOARD BETÖLTÉS
        await driver.get(`${BASE_URL}/admin`);
        let header = await driver.wait(until.elementLocated(By.css('h1')), 5000).getText();
        if(header.length > 0) console.log("[OK] 2. Admin Dashboard betöltés és fejléc validáció: OK");

        // 3. FELHASZNÁLÓK KEZELÉSE (Backend: /users végpont alapján)
        await driver.findElement(By.xpath("//button[contains(., 'Felhasználók')]")).click();
        await driver.sleep(1000);
        let userTable = await driver.findElement(By.css('table')).isDisplayed();
        if(userTable) console.log("[OK] 3. Felhasználók fül és táblázat megjelenítése: OK");

        // 4. BEJELENTÉSEK KEZELÉSE (Backend: /reports végpont alapján)
        await driver.findElement(By.xpath("//button[contains(., 'Jelentések')]")).click();
        await driver.sleep(1000);
        console.log("[OK] 4. Bejelentések (Reports) fülre váltás: OK");

        // 5. VISSZAJELZÉSEK KEZELÉSE (Backend: /feedbacks végpont alapján)
        await driver.findElement(By.xpath("//button[contains(., 'Visszajelzések')]")).click();
        await driver.sleep(1000);
        console.log("[OK] 5. Visszajelzések (Feedbacks) fülre váltás: OK");

        // 6. HÍRLEVÉL KÜLDÉS (Backend: /newsletter-content és /send-newsletter végpont alapján)
        await driver.findElement(By.xpath("//button[contains(., 'Hírlevél')]")).click();
        await driver.sleep(1000);
        let newsletterContainer = await driver.findElement(By.css('.newsletter-container')).isDisplayed();
        if(newsletterContainer) console.log("[OK] 6. Hírlevél szerkesztő/küldő felület megjelenése: OK");

        // 7. KILÉPÉS
        await driver.findElement(By.css('button[title="Kijelentkezés"]')).click();
        await driver.sleep(1000); // Várjuk meg a megerősítő ablak (modal) megjelenését
        await driver.findElement(By.css('.confirm-btn-danger')).click(); // Megerősítés a modalban
        await driver.wait(until.urlIs(`${BASE_URL}/login`), 5000);
        console.log("[OK] 7. Sikeres kilépés és visszatérés a bejelentkező oldalra: OK");

    } catch (hiba) { 
        console.error("[HIBA] ADMIN TESZT ELBUKOTT:", hiba.message);
        // Képernyőkép készítése hiba esetén, hogy könnyebb legyen a hibakeresés
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_admin_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_admin_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}
vizsgaremekAdminTesztek();