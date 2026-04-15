import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function headerNavigationTeszt() {
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
        console.log("--- HEADER NAVIGACIO TESZT INDITASA ---");
        const BASE_URL = 'http://localhost:5173';
        
        // 1. Oldal betöltése
        await driver.manage().window().maximize();
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.header-container')), 5000);
        console.log("[OK] 1. Oldal es Header sikeresen betoltve.");

        // 2. Galéria
        let galleryLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Galéria')]"));
        await galleryLink.click();
        await driver.wait(until.urlContains('/gallery'), 5000);
        console.log("[OK] 2. Navigacio a Galeria oldalra sikeres.");

        // 3. Ötletbörze
        let ideasLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Ötletbörze')]"));
        await ideasLink.click();
        await driver.wait(until.urlContains('/ideas'), 5000);
        console.log("[OK] 3. Navigacio az Otletborze oldalra sikeres.");

        // 4. Rólunk
        let aboutLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Rólunk')]"));
        await aboutLink.click();
        await driver.wait(until.urlContains('/about'), 5000);
        console.log("[OK] 4. Navigacio a Rolunk oldalra sikeres.");

        // 5. Visszajelzés
        let feedbackLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Visszajelzés')]"));
        await feedbackLink.click();
        await driver.wait(until.urlContains('/feedback'), 5000);
        console.log("[OK] 5. Navigacio a Visszajelzes oldalra sikeres.");

        // 6. Belépés
        let loginLink = await driver.findElement(By.css('.login-link'));
        await loginLink.click();
        await driver.wait(until.urlContains('/login'), 5000);
        console.log("[OK] 6. Navigacio a Belepes oldalra sikeres.");

        // 7. Regisztráció
        let registerLink = await driver.findElement(By.css('.nav-cta-button'));
        await registerLink.click();
        await driver.wait(until.urlContains('/register'), 5000);
        console.log("[OK] 7. Navigacio a Regisztracio oldalra sikeres.");

        // 8. Főoldal
        let homeLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Főoldal')]"));
        await homeLink.click();
        await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
        console.log("[OK] 8. Visszateres a Fooldalra sikeres.");

        console.log("[KESZ] MINDEN NAVIGACIOS TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] HEADER NAVIGACIO TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_header_navigacio_teszt.png', image, 'base64');
        console.log("[INFO] Kepernyokep lementve: hiba_header_navigacio_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

headerNavigationTeszt();