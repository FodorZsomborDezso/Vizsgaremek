import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function forgotPasswordTeszt() {
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
        console.log("--- [INFO] ELFELEJTETT JELSZÓ OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.get(`${BASE_URL}/forgot-password`);
        let authCard = await driver.wait(until.elementLocated(By.css('.auth-card')), 5000);
        await driver.wait(until.elementIsVisible(authCard), 5000);
        console.log("[OK] 1. Elfelejtett jelszó oldal sikeresen betöltve.");

        // 2. Nem létező e-mail cím beküldése
        let emailInput = await driver.findElement(By.css('input[type="email"]'));
        let submitBtn = await driver.findElement(By.css('.auth-btn'));

        await emailInput.sendKeys('nem.letezik.ez.a.fiok.1234@example.com');
        await submitBtn.click();

        // Várjuk meg a backend szerver hibaüzenetét (vagy Toastot, vagy .error-msg-t)
        let errorMsg = await driver.wait(until.elementLocated(By.css('.error-msg, .Toastify__toast--error')), 5000);
        await driver.wait(until.elementIsVisible(errorMsg), 5000);
        console.log("[OK] 2. Sikertelen kódkérés: A rendszer helyesen jelzi, ha a fiók nem található.");

        // 3. Vissza a bejelentkezéshez link ellenőrzése
        let backLink = await driver.findElement(By.xpath("//a[contains(., 'Jelentkezz be!')]"));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", backLink);
        await driver.sleep(500);
        await backLink.click();

        await driver.wait(until.urlContains('/login'), 5000);
        console.log("[OK] 3. 'Jelentkezz be!' link használata sikeres, navigáció a login oldalra.");

        console.log("[KÉSZ] MINDEN ELFELEJTETT JELSZÓ TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] ELFELEJTETT JELSZÓ TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_forgot_password_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_forgot_password_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

forgotPasswordTeszt();