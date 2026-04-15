const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, isAdmin } = require('../Middlewares/Auth');
const fs = require('fs');
const path = require('path');
const sendEmail = require('../Utils/sendEmail');

// Összes regisztrált felhasználó lekérése dátum szerint csökkenő sorrendben
router.get('/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a felhasználók lekérésekor.' });
    }
});

// Felhasználó és a hozzá tartozó helyi profilkép törlése
router.delete('/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', `avatar-${req.params.id}.jpeg`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Felhasználó sikeresen törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a felhasználó törlésekor.' });
    }
});

// Összes poszt lekérése az admin felület számára (lapozás nélkül vagy magas limittel)
router.get('/posts', authenticateToken, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.username, COUNT(likes.user_id) AS like_count 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            LEFT JOIN likes ON posts.id = likes.post_id 
            GROUP BY posts.id 
            ORDER BY posts.created_at DESC
        `;
        const [posts] = await db.query(sql);
        
        const formattedPosts = posts.map(p => {
            if (p.image_url === 'BLOB') p.image_url = `http://localhost:3000/api/posts/${p.id}/image`;
            return p;
        });
        
        res.json(formattedPosts);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a posztok lekérésekor.' });
    }
});

// Poszt és a hozzá tartozó helyi képfájl törlése
router.delete('/posts/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'uploads', `post-${req.params.id}.jpeg`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poszt sikeresen törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a poszt törlésekor.' });
    }
});

// Összes ötlet lekérése az admin felület számára
router.get('/ideas', authenticateToken, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT ideas.*, users.username, categories.name as category_name 
            FROM ideas 
            JOIN users ON ideas.user_id = users.id 
            JOIN categories ON ideas.category_id = categories.id 
            ORDER BY ideas.created_at DESC
        `;
        const [ideas] = await db.query(sql);
        res.json(ideas);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba az ötletek lekérésekor.' });
    }
});

// Ötlet törlése
router.delete('/ideas/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM ideas WHERE id = ?', [req.params.id]);
        res.json({ message: 'Ötlet sikeresen törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba az ötlet törlésekor.' });
    }
});

// Bejelentések lekérése a kapcsolódó poszt és komment adatokkal együtt
router.get('/reports', authenticateToken, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT reports.*, users.username AS reporter_name, posts.title AS post_title, posts.image_url AS post_image, comments.content AS comment_text, ideas.title AS idea_title, ideas.description AS idea_description 
            FROM reports 
            JOIN users ON reports.reporter_id = users.id 
            LEFT JOIN posts ON reports.target_type = 'post' AND reports.target_id = posts.id 
            LEFT JOIN comments ON reports.target_type = 'comment' AND reports.target_id = comments.id 
            LEFT JOIN ideas ON reports.target_type = 'idea' AND reports.target_id = ideas.id 
            ORDER BY reports.created_at DESC
        `;
        const [reports] = await db.query(sql);
        
        const formattedReports = reports.map(r => {
            if (r.post_image === 'BLOB') r.post_image = `http://localhost:3000/api/posts/${r.target_id}/image`;
            return r;
        });
        
        res.json(formattedReports);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a bejelentések lekérésekor.' });
    }
});

// Bejelentés törlése és lezárása
router.delete('/reports/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        res.json({ message: 'Bejelentés lezárva és törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a bejelentés törlésekor.' });
    }
});

// Komment eltávolítása az adatbázisból
router.delete('/comments/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Komment sikeresen törölve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a komment törlésekor.' });
    }
});

// Kijelölt felhasználó jogosultsági szintjének módosítása
router.put('/users/:id/role', authenticateToken, async (req, res) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez.' });
    }

    try {
        const { role } = req.body;
        if (role !== 'admin') {
            return res.status(400).json({ error: 'Érvénytelen szerepkör.' });
        }
        
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'Jogosultság sikeresen módosítva.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerver hiba történt a módosításkor.' });
    }
});

// Visszajelzések lekérése a beküldő felhasználónevével kiegészítve
router.get('/feedbacks', authenticateToken, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT f.*, u.username 
            FROM feedbacks f 
            LEFT JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC
        `;
        const [feedbacks] = await db.query(sql);
        res.json(feedbacks);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a visszajelzések lekérésekor.' }); 
    }
});

// Feldolgozott visszajelzés törlése
router.delete('/feedbacks/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM feedbacks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Visszajelzés sikeresen törölve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a visszajelzés törlésekor.' }); 
    }
});

// A legutóbbi aktuális hírlevél tartalmának lekérése
router.get('/newsletter-content', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT content FROM newsletter_content ORDER BY updated_at DESC LIMIT 1');
        res.json({ content: rows.length > 0 ? rows[0].content : '' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a hírlevél tartalom lekérésekor.' });
    }
});

// Új hírlevél tartalom mentése új sorként a történetiség megőrzése érdekében
router.post('/newsletter-content', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { content } = req.body;
        await db.query('INSERT INTO newsletter_content (content) VALUES (?)', [content]);
        res.json({ message: 'Hírlevél tartalom sikeresen frissítve.' });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a hírlevél mentésekor.' });
    }
});

// Tömeges hírlevél kiküldése az összes aktív feliratkozónak
router.post('/send-newsletter', authenticateToken, isAdmin, async (req, res) => {
    const { subject, content } = req.body;
    if (!subject || !content) {
        return res.status(400).json({ error: 'A tárgy és a tartalom megadása kötelező.' });
    }

    try {
        const [subscribers] = await db.query('SELECT email FROM newsletter_subscribers WHERE is_active = 1');
        
        if (subscribers.length === 0) {
            return res.status(404).json({ error: 'Nincsenek aktív feliratkozók.' });
        }

        const emailPromises = subscribers.map(sub => {
            return sendEmail({
                email: sub.email,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
                        <h2 style="text-align: center; color: #3a7bd5;">${subject}</h2>
                        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #3a7bd5; white-space: pre-wrap;">${content}</div>
                        <p style="text-align: center; margin-top: 30px;">
                            <a href="http://localhost:5173" style="background-color: #3a7bd5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ugrás az ArtisticEye-ra</a>
                        </p>
                    </div>
                `
            }).catch(err => console.error(`Hiba a levél küldésekor (${sub.email}):`, err));
        });

        await Promise.all(emailPromises);
        res.json({ message: `Hírlevél sikeresen elküldve ${subscribers.length} feliratkozónak.` });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a hírlevél kiküldésekor.' });
    }
});

module.exports = router;