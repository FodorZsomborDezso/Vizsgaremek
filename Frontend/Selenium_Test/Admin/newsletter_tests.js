import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function hirlevelTeszt() {
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
        console.log("--- [INFO] HÍRLEVÉL KÜLDÉS TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        await driver.get(BASE_URL);
        
        // 1. Bejelentkezés admin fiókkal
        await driver.wait(until.elementLocated(By.css('.login-link')), 5000).click();
        await driver.sleep(1000); 
        let emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
        await driver.wait(until.elementIsVisible(emailInput), 5000);
        await emailInput.sendKeys('fodorzsombi0606@gmail.com'); 
        await driver.findElement(By.css('input[type="password"]')).sendKeys('Valami_!69', Key.RETURN); 
        await driver.sleep(2000);
        console.log("[OK] 1. Bejelentkezés: OK");

        // 2. Navigáció az Admin oldalra és a Hírlevél fülre
        await driver.get(`${BASE_URL}/admin`);
        await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Hírlevél')]")), 5000).click();
        await driver.sleep(1000);
        console.log("[OK] 2. Hírlevél fül megnyitása: OK");

        // 3. Hírlevél űrlap kitöltése
        // Megkeressük a Tárgy és Tartalom mezőket a placeholder szövegük alapján
        let subjectInput = await driver.findElement(By.css('input[placeholder*="Hírlevél tárgya"]'));
        let contentTextarea = await driver.findElement(By.css('textarea[placeholder*="részletes tartalmát"]'));

        await subjectInput.sendKeys('[Robot] Automatikus Teszt Hírlevél');
        await contentTextarea.sendKeys('Kedves Felhasználó!\n\nEz egy Selenium által generált automatikus teszt üzenet, ami azt vizsgálja, hogy a Hírlevél funkció megfelelően működik-e a rendszerben.\n\nÜdvözlettel:\nArtisticEye Teszt Robot');
        console.log("[OK] 3. Hírlevél tárgy és tartalom kitöltése: OK");

        // 4. Küldés gomb lenyomása
        await driver.findElement(By.xpath("//button[contains(., 'Küldés Mindenkinek')]")).click();
        await driver.sleep(1000); // Várjuk meg a modal megjelenését
        console.log("[OK] 4. Küldés gomb megnyomva, Modal megjelent: OK");

        // 5. Megerősítés a felugró ablakban (Modal)
        await driver.findElement(By.css('.admin-confirm-danger')).click(); // 'Igen, folytatom' gomb
        console.log("[VÁRAKOZÁS] 5. Megerősítve. Várakozás a szerver válaszára...");

        // 6. Validáció: Ha sikeres a küldés, a React kód kiüríti a 'bulkSubject' értékét
        // Addig várunk (maximum 10 másodpercet), amíg a Tárgy mező tartalma újra üres nem lesz
        await driver.wait(async () => {
            let currentValue = await subjectInput.getAttribute('value');
            return currentValue === '';
        }, 10000, "A hírlevél elküldése túl sokáig tartott, vagy hibára futott a backend!");
        
        console.log("[OK] 6. Validáció sikeres: Hírlevél kiküldve, az űrlap kiürült!");
        console.log("[KÉSZ] MINDEN TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] HÍRLEVÉL TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_hirlevel_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_hirlevel_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

hirlevelTeszt();