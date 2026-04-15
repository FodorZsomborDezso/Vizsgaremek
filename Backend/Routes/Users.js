const express = require('express');
const router = express.Router();
const db = require('../db');
const sharp = require('sharp');
const { authenticateToken } = require('../Middlewares/Auth');
const { upload, formatPostsForFrontend, sendNotification } = require('../Utils/Helpers');
const fs = require('fs');
const path = require('path');

// Memória tároló a gépelés státuszának átmeneti tárolására
const typingStatus = new Map();

// Felhasználói profil adatainak és profilképének frissítése
router.put('/users/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { full_name, bio, location } = req.body;

    try {
        if (req.file) {
            const optimizedBuffer = await sharp(req.file.buffer).resize(500, 500, { fit: sharp.fit.cover }).toFormat('jpeg').toBuffer();
            const filename = `avatar-${req.user.id}.jpeg`;
            const uploadsDir = path.join(__dirname, '..', 'uploads');

            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            await fs.promises.writeFile(path.join(uploadsDir, filename), optimizedBuffer);

            const avatarUrl = `http://localhost:3000/api/users/${req.user.id}/avatar`;
            
            await db.query(
                'UPDATE users SET full_name = ?, bio = ?, location = ?, avatar_url = ?, avatar_data = NULL WHERE id = ?', 
                [full_name, bio, location, avatarUrl, req.user.id]
            );
        } else {
            await db.query('UPDATE users SET full_name = ?, bio = ?, location = ? WHERE id = ?', [full_name, bio, location, req.user.id]);
        }
        
        const [updatedUser] = await db.query('SELECT id, username, email, role, avatar_url, full_name, bio, location FROM users WHERE id = ?', [req.user.id]);
        res.json({ message: 'Profil sikeresen frissítve.', user: updatedUser[0] });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a profil frissítésekor.' }); 
    }
});

// Gépelési státusz beállítása az adott chat partner felé
router.post('/typing/:receiverId', authenticateToken, (req, res) => {
    const key = `${req.user.id}-${req.params.receiverId}`;
    typingStatus.set(key, Date.now());
    res.sendStatus(200);
});

// Gépelési státusz lekérése a kommunikációs partnertől
router.get('/typing/:senderId', authenticateToken, (req, res) => {
    const key = `${req.params.senderId}-${req.user.id}`;
    const lastTyped = typingStatus.get(key);
    const isTyping = lastTyped && (Date.now() - lastTyped < 2000);
    res.json({ isTyping });
});

// Adott felhasználó profilképének lekérése azonosító alapján
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const [users] = await db.query('SELECT avatar_data, avatar_type FROM users WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).send('A felhasználó nem található.');
        }
        
        const filename = `avatar-${req.params.id}.jpeg`;
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        if (fs.existsSync(filePath)) {
            res.setHeader('Content-Type', 'image/jpeg');
            res.sendFile(filePath);
        } else if (users[0].avatar_data) {
            res.setHeader('Content-Type', users[0].avatar_type || 'image/jpeg');
            res.send(users[0].avatar_data);
        } else {
            res.status(404).send('A profilkép nem található.');
        }
    } catch (err) { 
        res.status(500).send('Szerverhiba a profilkép lekérésekor.'); 
    }
});

// Felhasználó adatainak és saját posztjainak lekérése felhasználónév alapján
router.get('/users/:username', async (req, res) => {
    try {
        const [users] = await db.query(`SELECT id, username, full_name, bio, avatar_url, location, created_at, (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count, (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) AS following_count FROM users WHERE username = ?`, [req.params.username]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található.' });
        }
        
        const [posts] = await db.query('SELECT posts.*, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count FROM posts WHERE user_id = ? ORDER BY created_at DESC', [users[0].id]);
        
        res.json({ user: users[0], posts: formatPostsForFrontend(posts) });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az adatok lekérésekor.' }); 
    }
});

// Követési státusz ellenőrzése a bejelentkezett és egy másik felhasználó között
router.get('/users/:id/is-following', authenticateToken, async (req, res) => {
    try {
        const [iFollowThem] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
        const [theyFollowMe] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.params.id, req.user.id]);
        res.json({ isFollowing: iFollowThem.length > 0, isFollowingMe: theyFollowMe.length > 0 });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a követési státusz ellenőrzésekor.' }); 
    }
});

// Másik felhasználó követése vagy a követés visszavonása
router.post('/users/:id/follow', authenticateToken, async (req, res) => {
    if (req.user.id == req.params.id) {
        return res.status(400).json({ error: 'Saját magadat nem követheted.' });
    }
    
    try {
        const [existing] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
        
        if (existing.length > 0) {
            await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
            await db.query('DELETE FROM notifications WHERE sender_id = ? AND type = ? AND user_id = ?', [req.user.id, 'follow', req.params.id]);
            res.json({ followed: false });
        } else {
            await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, req.params.id]);
            res.json({ followed: true });
            
            const [notifExists] = await db.query('SELECT id FROM notifications WHERE sender_id = ? AND type = ? AND user_id = ?', [req.user.id, 'follow', req.params.id]);
            if (notifExists.length === 0) {
                await sendNotification(req.params.id, req.user.id, 'follow');
            }
        }
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a követési művelet során.' }); 
    }
});

// A bejelentkezett felhasználó kölcsönös követőinek és olvasatlan üzeneteinek lekérése
router.get('/friends', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE users SET last_seen = NOW() WHERE id = ?', [req.user.id]);

        const sql = `
            SELECT u.id, u.username, u.avatar_url, u.full_name, u.last_seen,
            (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) AS unread_count
            FROM users u 
            JOIN follows f1 ON f1.following_id = u.id AND f1.follower_id = ? 
            JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ?`;
        const [friends] = await db.query(sql, [req.user.id, req.user.id, req.user.id]);
        
        res.json(friends);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az ismerősök betöltésekor.' }); 
    }
});

// Két felhasználó közötti privát üzenetváltások lekérése és olvasottnak jelölése
router.get('/messages/:otherUserId', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ?', [req.params.otherUserId, req.user.id]);

        const sql = `SELECT m.*, u.avatar_url as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?) ORDER BY m.created_at ASC`;
        const [messages] = await db.query(sql, [req.user.id, req.params.otherUserId, req.params.otherUserId, req.user.id]);
        
        res.json(messages);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az üzenetek lekérésekor.' }); 
    }
});

// Új privát üzenet küldése egy kölcsönösen követett felhasználónak
router.post('/messages/:otherUserId', authenticateToken, async (req, res) => {
    if (!req.body.content || req.body.content.trim() === '') {
        return res.status(400).json({ error: 'Az üzenet nem lehet üres.' });
    }
    
    try {
        const [mutual] = await db.query(`SELECT (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?) as iFollowThem, (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?) as theyFollowMe`, [req.user.id, req.params.otherUserId, req.params.otherUserId, req.user.id]);
        
        if (Number(mutual[0].iFollowThem) === 0 || Number(mutual[0].theyFollowMe) === 0) {
            return res.status(403).json({ error: 'Csak kölcsönös követők küldhetnek egymásnak üzenetet.' });
        }

        const [result] = await db.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.otherUserId, req.body.content]);
        await sendNotification(req.params.otherUserId, req.user.id, 'message');
        
        res.status(201).json({ message: 'Üzenet sikeresen elküldve.', messageId: result.insertId });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az üzenet küldésekor.' }); 
    }
});

// A bejelentkezett felhasználó legutóbbi értesítéseinek lekérése
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const [notifications] = await db.query('SELECT n.*, u.username, u.avatar_url, u.full_name FROM notifications n JOIN users u ON n.sender_id = u.id WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 20', [req.user.id]);
        res.json(notifications);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az értesítések lekérésekor.' }); 
    }
});

// A felhasználó összes értesítésének olvasottnak jelölése
router.put('/notifications/read', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Értesítések sikeresen olvasottnak jelölve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az értesítések frissítésekor.' }); 
    }
});

// Felhasználó nyilvános adatainak lekérése azonosító alapján
router.get('/users/id/:id', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, full_name, bio, avatar_url FROM users WHERE id = ?', [req.params.id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található.' });
        }
        
        res.json({ user: users[0] });
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a profil lekérésekor.' });
    }
});

// A legtöbb kedveléssel rendelkező tíz felhasználó ranglistájának lekérése
router.get('/top-users', async (req, res) => {
    try {
        const sql = `
            SELECT u.id, u.username, u.full_name, u.avatar_url, COUNT(l.post_id) as total_likes
            FROM users u
            LEFT JOIN posts p ON u.id = p.user_id
            LEFT JOIN likes l ON p.id = l.post_id
            GROUP BY u.id
            ORDER BY total_likes DESC
            LIMIT 10
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a ranglista betöltésekor.' }); 
    }
});

// Felhasználók keresése név vagy felhasználónév alapján
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q;
        
        if (!searchQuery) {
            return res.json([]);
        }

        const sql = `
            SELECT id, username, full_name, avatar_url 
            FROM users 
            WHERE username LIKE ? OR full_name LIKE ?
            LIMIT 5
        `;
        
        const searchTerm = `%${searchQuery}%`;
        const [users] = await db.query(sql, [searchTerm, searchTerm]);
        
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba a keresés során.' });
    }
});

module.exports = router;