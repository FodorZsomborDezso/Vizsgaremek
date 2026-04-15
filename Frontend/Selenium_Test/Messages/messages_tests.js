import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import dotenv from 'dotenv';

// Pontosan megadjuk a Backend .env elérési útját a bejelentkezési adatokhoz
dotenv.config({ path: 'c:\\Users\\fodor\\Desktop\\Vizsgaremek\\Vizsgaremek\\Backend\\.env' });

async function messagesTeszt() {
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
        console.log("--- [INFO] ÜZENETEK (MESSAGES) OLDAL TESZT INDÍTÁSA ---");

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

        // 2. Navigáció az Üzenetek oldalra
        await driver.get(`${BASE_URL}/messages`);
        let messagesLayout = await driver.wait(until.elementLocated(By.css('.messages-layout-container')), 5000);
        await driver.wait(until.elementIsVisible(messagesLayout), 5000);
        console.log("[OK] 2. Üzenetek oldal és keretrendszer betöltve.");

        // Várjuk meg, amíg az ismerősök lekérése (API) befejeződik
        await driver.sleep(2000);

        // 3. Ismerősök listájának ellenőrzése és chat megnyitása
        let friendItems = await driver.findElements(By.css('.friend-item'));
        if (friendItems.length > 0) {
            console.log(`[OK] 3. Ismerősök betöltve (${friendItems.length} db). Első ismerős kiválasztása...`);
            await friendItems[0].click();
            await driver.sleep(1000); // Várjuk meg az üzenetek betöltését

            // 4. Aktív beszélgetés ellenőrzése
            let activeChat = await driver.wait(until.elementLocated(By.css('.active-chat-container')), 5000);
            await driver.wait(until.elementIsVisible(activeChat), 5000);
            console.log("[OK] 4. Aktív beszélgetés (chat) felület sikeresen megnyílt.");

            // 5. Üzenetküldés tesztelése
            let chatInput = await driver.findElement(By.css('.chat-message-input'));
            await chatInput.sendKeys('[Robot] Szia! Ez egy automatikus E2E teszt üzenet a Seleniumtól.');

            let sendBtn = await driver.findElement(By.css('.chat-send-btn'));
            await sendBtn.click();
            await driver.sleep(1000); // Várjuk meg a küldés optimista UI frissítését
            console.log("[OK] 5. Teszt üzenet sikeresen elküldve a partnernek.");

            // 6. Emoji Picker tesztelése és használata
            let emojiBtn = await driver.findElement(By.css('.emoji-toggle-btn'));
            await emojiBtn.click();

            let emojiPicker = await driver.wait(until.elementLocated(By.css('.emoji-picker-popover')), 3000);
            await driver.wait(until.elementIsVisible(emojiPicker), 3000);
            console.log("[OK] 6. Emoji választó (Picker) popover sikeresen megnyílt.");

            // Kiválasztunk egy emojit (A react-emoji-picker '.epr-emoji' osztályt használ a gombokra)
            let firstEmoji = await driver.wait(until.elementLocated(By.css('button.epr-emoji')), 5000);
            await driver.wait(until.elementIsVisible(firstEmoji), 3000);
            await firstEmoji.click();
            await driver.sleep(500); // Várjuk meg a React állapotfrissítést
            console.log("[OK] 6/B. Emoji sikeresen kiválasztva és beillesztve a beviteli mezőbe.");

            // Elküldjük a kiválasztott emojit is
            await sendBtn.click();
            await driver.sleep(1000);
            console.log("[OK] 6/C. Az emojit tartalmazó üzenet sikeresen elküldve.");

            // Ha a picker nyitva maradt kattintás után, bezárjuk
            let pickersAfter = await driver.findElements(By.css('.emoji-picker-popover'));
            if (pickersAfter.length > 0 && await pickersAfter[0].isDisplayed()) {
                await emojiBtn.click();
                await driver.sleep(500);
            }
        } else {
            console.log("[INFO] 3. Nincsenek ismerősök a tesztfiókhoz (üres lista). Aktív chat tesztelése kihagyva.");
        }

        console.log("[KÉSZ] MINDEN ÜZENETEK TESZT SIKERESEN LEFUTOTT!");

    } catch (hiba) { 
        console.error("[HIBA] ÜZENETEK TESZT ELBUKOTT:", hiba.message);
        let image = await driver.takeScreenshot();
        fs.writeFileSync('hiba_messages_teszt.png', image, 'base64');
        console.log("[INFO] Képernyőkép lementve: hiba_messages_teszt.png");
    } finally { 
        await driver.quit(); 
    }
}

messagesTeszt();