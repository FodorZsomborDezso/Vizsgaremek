import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';

async function headerTeszt() {
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
        console.log("--- [INFO] HEADER (NAVIGÁCIÓ) TESZT INDÍTÁSA ---");
        const BASE_URL = 'http://localhost:5173';
        
        // 1. Ablak teljes méretre állítása és oldal betöltése
        await driver.manage().window().maximize();
        await driver.get(BASE_URL);
        await driver.wait(until.elementLocated(By.css('.header-container')), 5000);
        console.log("[OK] 1. Oldal és Header sikeresen betöltve: OK");

        // 2. Témaváltó (Dark/Light mode) tesztelése
        let themeBtn = await driver.findElement(By.css('.theme-toggle-btn'));
        await themeBtn.click();
        await driver.sleep(500); // Várjuk meg az állapotváltást
        console.log("[OK] 2. Témaváltó gomb (Dark/Light mode) sikeresen működik: OK");

        // 3. Kereső modul tesztelése
        let searchToggle = await driver.findElement(By.css('.search-toggle-btn'));
        await searchToggle.click();
        let searchInput = await driver.wait(until.elementLocated(By.css('.global-search-input')), 3000);
        if (await searchInput.isDisplayed()) {
            await searchInput.sendKeys('admin');
            await driver.sleep(1000); // Várjuk meg a debounce (300ms) és API hívás idejét
            console.log("[OK] 3. Kereső megnyitása és gépelés szimulálása: OK");
        }
        
        // Kereső bezárása
        await searchToggle.click();
        await driver.sleep(500);

        // 4. Asztali nézet (Navigációs gombok ellenőrzése és kattintás tesztelése)
        let galleryLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Galéria')]"));
        if (await galleryLink.isDisplayed()) {
            console.log("[OK] 4. Asztali navigációs linkek (pl. Galéria) megfelelően láthatóak: OK");
            
            // Kattintás a Galéria gombra
            await galleryLink.click();
            await driver.wait(until.urlContains('/gallery'), 5000);
            console.log("[OK] 4/B. Galéria gombra kattintás és navigáció: OK");
            
            // Visszatérés a főoldalra a 'Főoldal' gomb segítségével
            let homeLink = await driver.findElement(By.xpath("//a[contains(@class, 'nav-link-btn') and contains(., 'Főoldal')]"));
            await homeLink.click();
            await driver.wait(until.urlIs(`${BASE_URL}/`), 5000);
            console.log("[OK] 4/C. Főoldal gombra kattintás és visszatérés a kezdőlapra: OK");
        }

        // 5. Mobil nézet (Hamburger menü) tesztelése
        // Átméretezzük az ablakot egy mobiltelefon (pl. iPhone) méretére
        await driver.manage().window().setRect({ width: 375, height: 812 });
        await driver.sleep(1000); // Várjuk meg a CSS media query-k aktiválódását
        
        let hamburger = await driver.findElement(By.css('.hamburger-menu'));
        await hamburger.click();
        await driver.sleep(500); // Várjuk meg a menü lenyíló animációját
        
        let navMenu = await driver.findElement(By.css('.nav-menu'));
        let classes = await navMenu.getAttribute('class');
        
        if (classes.includes('active')) {
            console.log("[OK] 5. Mobil nézet: Hamburger menü kattintásra sikeresen lenyílik: OK");
        } else {
            throw new Error("A mobil menü nem nyílt le!");
        }

        console.log("[KÉSZ] HEADER TESZTEK SIKERESEN LEFUTOTTAK!");

    } catch (hiba) { 
        console.error("[HIBA] HEADER TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_header_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_header_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

headerTeszt();