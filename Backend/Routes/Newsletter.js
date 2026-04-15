const express = require('express');
const router = express.Router();
const db = require('../db');
const sendEmail = require('../Utils/sendEmail');

// Új feliratkozó rögzítése vagy meglévő inaktív fiók újraaktiválása e-mail értesítéssel
router.post('/subscribe', async (req, res) => {
    const { email, userId } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Az e-mail cím kötelező.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Érvénytelen e-mail formátum.' });
    }

    let customMessage = '';
    try {
        const sql = 'INSERT INTO newsletter_subscribers (email, user_id, is_active) VALUES (?, ?, 1)';
        await db.query(sql, [email, userId || null]);

        try {
            const [contentRows] = await db.query('SELECT content FROM newsletter_content ORDER BY updated_at DESC LIMIT 1');
            if (contentRows.length > 0 && contentRows[0].content.trim() !== '') {
                customMessage = `
                    <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #3a7bd5; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #3a7bd5;">Aktuális Híreink:</h3>
                        <p style="margin-bottom: 0; white-space: pre-wrap;">${contentRows[0].content}</p>
                    </div>
                `;
            }
        } catch (e) {}

        try {
            await sendEmail({
                email: email,
                subject: 'Sikeres feliratkozás az ArtisticEye hírlevélre!',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                        <h2 style="text-align: center; color: #3a7bd5;">Üdvözlünk a közösségünkben!</h2>
                        <p>Sikeresen feliratkoztál az ArtisticEye hírlevelére a(z) <strong>${email}</strong> címmel.</p>
                        <p>Hamarosan értesítünk a legújabb funkciókról, a közösség legjobb alkotásairól és a közelgő eseményekről.</p>
                        ${customMessage}
                        <p>Addig is, fedezd fel a galériát és meríts ihletet mások munkáiból!</p>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173" style="background-color: #3a7bd5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Vissza az oldalra</a>
                        </p>
                        <p style="margin-top: 30px; font-size: 0.9em; color: #777;">Üdvözlettel,<br>Az ArtisticEye csapata</p>
                    </div>
                `
            });
        } catch (err) {}

        res.status(201).json({ message: 'Sikeresen feliratkoztál a hírlevélre.' });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            const [rows] = await db.query('SELECT is_active FROM newsletter_subscribers WHERE email = ?', [email]);
            
            if (rows.length > 0 && !rows[0].is_active) {
                await db.query('UPDATE newsletter_subscribers SET is_active = 1, subscribed_at = CURRENT_TIMESTAMP WHERE email = ?', [email]);

                try {
                    await sendEmail({
                        email: email,
                        subject: 'Újra aktiváltuk a hírlevél feliratkozásodat!',
                        html: `
                            <p>Szia! Észrevettük, hogy újra feliratkoztál hírlevelünkre. Korábbi, inaktív feliratkozásodat sikeresen újraaktiváltuk. Örülünk, hogy újra itt vagy!</p>
                            ${customMessage}
                        `
                    });
                } catch (err) {}

                return res.status(200).json({ message: 'Korábbi feliratkozásodat sikeresen újraaktiváltuk.' });
            }
            return res.status(409).json({ error: 'Ezzel az e-mail címmel már feliratkoztak.' });
        }
        
        res.status(500).json({ error: 'Szerverhiba történt a feliratkozás során.' });
    }
});

// Felhasználó hírlevél feliratkozási státuszának ellenőrzése
router.get('/status/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const [rows] = await db.query('SELECT id FROM newsletter_subscribers WHERE email = ? AND is_active = 1', [email]);
        
        res.json({ isSubscribed: rows.length > 0 });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a hírlevél státusz lekérdezésekor.' });
    }
});

module.exports = router;