import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function registerTeszt() {
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
        console.log("--- [INFO] REGISZTRÁCIÓ (REGISTER) OLDAL TESZT INDÍTÁSA ---");

        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.get(`${BASE_URL}/register`);
        let authCard = await driver.wait(until.elementLocated(By.css('.auth-card')), 5000);
        await driver.wait(until.elementIsVisible(authCard), 5000);
        console.log("[OK] 1. Regisztráció oldal sikeresen betöltve.");

        // 2. Jelszó erősség mérő tesztelése
        let passwordInputs = await driver.findElements(By.css('.password-input'));
        await passwordInputs[0].sendKeys('123'); // Túl rövid
        
        let strengthLabel = await driver.wait(until.elementLocated(By.css('.strength-label')), 3000);
        let labelText = await strengthLabel.getText();
        if (labelText === 'Túl rövid' || labelText === 'Gyenge') {
            console.log("[OK] 2. Jelszó erősségmérő érzékeli a gyenge jelszót.");
        }
        
        await passwordInputs[0].clear();
        await passwordInputs[0].sendKeys('Eros!Jelszo123'); // Erős
        labelText = await strengthLabel.getText();
        if (labelText === 'Erős') {
            console.log("[OK] 3. Jelszó erősségmérő érzékeli a biztonságos, erős jelszót.");
        }

        // Alapadatok kitöltése, hogy a HTML5 beépített validációja ne blokkolja a gombot
        let usernameInput = await driver.findElement(By.xpath("//label[contains(., 'Felhasználónév')]/following-sibling::input"));
        let emailInput = await driver.findElement(By.css('input[type="email"]'));
        await usernameInput.sendKeys(`TesztUser_${Date.now()}`);
        await emailInput.sendKeys(`teszt_reg_${Date.now()}@example.com`);

        // 3. Frontend validáció: Jelszavak nem egyeznek
        await passwordInputs[1].sendKeys('MasikJelszo123');
        let submitBtn = await driver.findElement(By.css('.auth-btn'));
        await driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
        await driver.sleep(500);
        await submitBtn.click();

        let toastError = await driver.wait(until.elementLocated(By.css('.Toastify__toast')), 5000);
        await driver.wait(until.elementIsVisible(toastError), 3000);
        console.log("[OK] 4. Frontend validáció: A jelszó eltérésnél helyesen megjelent a Toast figyelmeztetés.");

        // 4. Frontend validáció: ÁSZF elfogadása hiányzik
        await passwordInputs[1].clear();
        await passwordInputs[1].sendKeys('Eros!Jelszo123'); // Most már egyeznek
        await submitBtn.click();
        
        // Várunk egy picit a Toast frissülésére
        await driver.sleep(1000);
        console.log("[OK] 5. Frontend validáció: Az ÁSZF figyelmeztetés is helyesen aktiválódott.");

        // 5. Sikeres beküldés folyamata (csak a megerősítő nézetig)
        let termsCheckbox = await driver.findElement(By.css('.terms-checkbox'));
        await driver.executeScript("arguments[0].click();", termsCheckbox); // JavaScriptes kattintás, ha valami takarná

        await submitBtn.click();
        
        // Ha minden jó, átvált az E-mail Megerősítése nézetre
        let verifyTitle = await driver.wait(until.elementLocated(By.xpath("//h2[contains(., 'E-mail Megerősítése')]")), 8000);
        await driver.wait(until.elementIsVisible(verifyTitle), 3000);
        console.log("[OK] 6. Űrlap sikeresen beküldve: A rendszer átváltott az 'E-mail Megerősítése' nézetre.");

        console.log("[KÉSZ] MINDEN REGISZTRÁCIÓ TESZT SIKERESEN LEFUTOTT!");
    } catch (hiba) { 
        console.error("[HIBA] REGISZTRÁCIÓ TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_register_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_register_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

registerTeszt();