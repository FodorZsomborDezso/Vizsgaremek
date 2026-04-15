const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sharp = require('sharp');
const { upload } = require('../Utils/Helpers');
const { JWT_SECRET } = require('../Middlewares/Auth');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../Utils/sendEmail');
require('dotenv').config();

// Elfelejtett jelszóhoz tartozó visszaállító kód kiküldése e-mailben
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: 'Nincs ilyen fiók.' });
        }

        const resetToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 jegyű kód generálása
        await db.query(
            'UPDATE users SET reset_token = ?, reset_token_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?',
            [resetToken, email]
        );
        
        await sendEmail({
            email: email,
            subject: 'ArtisticEye - Jelszó visszaállítása',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                    <h2 style="text-align: center; color: #3a7bd5;">Jelszó visszaállítása</h2>
                    <p>Kedves Felhasználó!</p>
                    <p>Kérted a jelszavad visszaállítását az ArtisticEye fiókodhoz. Kérjük, használd az alábbi 6 jegyű kódot a folytatáshoz. Ha nem te indítottad ezt a kérést, kérjük, hagyd figyelmen kívül ezt az e-mailt.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f4f4f4; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 2px dashed #3a7bd5; color: #3a7bd5;">${resetToken}</span>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #e74c3c;"><i>Ez a kód 1 órán belül lejár.</i></p>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Üdvözlettel,<br>Az ArtisticEye csapata</p>
                </div>
            `
        });

        res.json({ message: 'A 6 jegyű kódot elküldtük az e-mail címedre.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a jelszó-visszaállítás közben.' });
    }
});

// Visszaállító kód ellenőrzése
router.post('/verify-reset-code', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'E-mail és kód megadása kötelező.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND reset_token = ? AND reset_token_expires > NOW()', [email, code]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Helytelen vagy lejárt kód.' });
        }

        res.json({ message: 'Helyes kód.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a kód ellenőrzésekor.' });
    }
});

// Új jelszó beállítása a kapott visszaállító kód alapján
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'A link érvénytelen vagy lejárt.' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashedPassword, users[0].id]);

        res.json({ message: 'A jelszó sikeresen megváltozott.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a jelszó cseréje közben.' });
    }
});

// Felhasználói fiók e-mail címének megerősítése kód alapján
router.post('/auth/verify-email', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'E-mail és kód megadása kötelező.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND verification_token = ? AND verification_token_expires > NOW()', [email, code]);

        if (users.length === 0) {
            return res.status(400).json({ error: 'Helytelen vagy lejárt kód.' });
        }

        const user = users[0];
        await db.query('UPDATE users SET is_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?', [user.id]);
        res.json({ message: 'E-mail cím sikeresen megerősítve!' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a megerősítés során.' });
    }
});

// Új felhasználó regisztrációja, profilkép mentése és megerősítő e-mail küldése
router.post('/auth/register', upload.single('profileImage'), async (req, res) => {
    const { username, email, password, full_name, bio, location } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Minden kötelező mező kitöltése szükséges.' });
    }
    
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        
        if (existing.length > 0) {
            if (existing[0].is_verified === 0) {
                return res.status(409).json({ error: 'Ez az e-mail cím már regisztrálva van, de még nincs megerősítve. Kérjük, ellenőrizd a postafiókodat.' });
            }
            return res.status(400).json({ error: 'Foglalt felhasználónév vagy e-mail cím.' });
        }

        const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt(10));
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6 jegyű kód generálása
        let finalAvatar = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
        
        const sql = 'INSERT INTO users (username, email, password_hash, role, avatar_url, full_name, bio, location, is_verified, verification_token, verification_token_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))';
        const [result] = await db.query(sql, [username, email, passwordHash, 'user', finalAvatar, full_name || null, bio || null, location || null, verificationToken]);
        
        if (req.file) {
            const newUserId = result.insertId;
            const optimizedBuffer = await sharp(req.file.buffer).resize(500, 500, { fit: sharp.fit.cover }).toFormat('jpeg').toBuffer();
            const filename = `avatar-${newUserId}.jpeg`;
            const uploadsDir = path.join(__dirname, '..', 'uploads');

            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            await fs.promises.writeFile(path.join(uploadsDir, filename), optimizedBuffer);

            finalAvatar = `http://localhost:3000/api/users/${newUserId}/avatar`;
            await db.query('UPDATE users SET avatar_url = ? WHERE id = ?', [finalAvatar, newUserId]);
        }

        await sendEmail({
            email: email,
            subject: 'ArtisticEye - Regisztráció megerősítése',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                    <h2 style="text-align: center; color: #3a7bd5;">Üdvözlünk az ArtisticEye-on!</h2>
                    <p>Kedves ${username},</p>
                    <p>Már csak egy lépés van hátra a regisztrációd véglegesítéséhez. Kérjük, használd az alábbi 6 jegyű kódot az e-mail címed megerősítéséhez:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f4f4f4; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 2px dashed #3a7bd5; color: #3a7bd5;">${verificationToken}</span>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #e74c3c;"><i>Ez a link 24 órán belül lejár.</i></p>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Üdvözlettel,<br>Az ArtisticEye csapata</p>
                </div>
            `
        });

        res.status(201).json({ message: 'Sikeres regisztráció. Elküldtünk egy megerősítő linket az e-mail címedre.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a regisztráció során.' }); 
    }
});

// Megerősítő e-mail újraküldése inaktív felhasználók számára
router.post('/auth/resend-verification', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ error: 'E-mail cím megadása kötelező.' });
    }

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(200).json({ message: 'Ha a megadott e-mail cím regisztrálva van és még nincs megerősítve, újra elküldtük a linket.' });
        }

        const user = users[0];
        
        if (user.is_verified) {
            return res.status(400).json({ error: 'Ez a fiók már meg van erősítve.' });
        }

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        await db.query('UPDATE users SET verification_token = ?, verification_token_expires = DATE_ADD(NOW(), INTERVAL 24 HOUR) WHERE id = ?', [verificationToken, user.id]);

        await sendEmail({
            email: user.email,
            subject: 'ArtisticEye - Regisztráció megerősítése (Újraküldés)',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                    <h2 style="text-align: center; color: #3a7bd5;">Regisztráció megerősítése</h2>
                    <p>Kérésedre újra elküldtük a megerősítő kódot. Kérjük, használd az alábbi 6 jegyű kódot a fiókod aktiválásához:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f4f4f4; padding: 15px 30px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 2px dashed #3a7bd5; color: #3a7bd5;">${verificationToken}</span>
                    </div>
                    <p style="margin-top: 20px; font-size: 0.9em; color: #e74c3c;"><i>Ez a kód 24 órán belül lejár.</i></p>
                    <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Üdvözlettel,<br>Az ArtisticEye csapata</p>
                </div>
            `
        });

        res.status(200).json({ message: 'A megerősítő e-mailt sikeresen újra elküldtük.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba történt a megerősítő e-mail újraküldésekor.' });
    }
});

// Felhasználó bejelentkeztetése és JWT token generálása
router.post('/auth/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
    
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Hibás e-mail cím vagy jelszó.' });
        }

        if (users[0].is_verified === 0) {
            return res.status(403).json({ error: 'A fiók még nincs megerősítve. Kérjük, ellenőrizd az e-mail postafiókodat.', errorCode: 'ACCOUNT_NOT_VERIFIED' });
        }

        const isMatch = await bcrypt.compare(password, users[0].password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Hibás e-mail cím vagy jelszó.' });
        }

        const tokenExpiration = rememberMe ? '7d' : '2h';
        const token = jwt.sign({ id: users[0].id, role: users[0].role, username: users[0].username }, JWT_SECRET, { expiresIn: tokenExpiration });
        
        res.json({ token, user: { id: users[0].id, username: users[0].username, email: users[0].email, role: users[0].role, avatar_url: users[0].avatar_url } });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a belépés során.' }); 
    }
});

module.exports = router;