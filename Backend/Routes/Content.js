const express = require('express');
const router = express.Router();
const db = require('../db');
const sharp = require('sharp');
const { authenticateToken } = require('../Middlewares/Auth');
const { upload, formatPostsForFrontend, sendNotification } = require('../Utils/Helpers');
const fs = require('fs');
const path = require('path');

// Képek lekérése a galériába szűréssel és lapozással
router.get('/gallery', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'latest';

        let sql = `SELECT posts.*, users.username, users.avatar_url, categories.name as category_name, COUNT(likes.user_id) AS like_count FROM posts JOIN users ON posts.user_id = users.id JOIN categories ON posts.category_id = categories.id LEFT JOIN likes ON posts.id = likes.post_id WHERE posts.idea_id IS NULL`;
        const queryParams = [];

        if (search) { 
            sql += ` AND (posts.title LIKE ? OR posts.tags LIKE ?)`; 
            queryParams.push(`%${search}%`, `%${search}%`); 
        }
        
        if (category) { 
            sql += ` AND categories.name = ?`; 
            queryParams.push(category); 
        }
        
        sql += ` GROUP BY posts.id `;
        
        if (sort === 'popular') {
            sql += ` ORDER BY like_count DESC `; 
        } else if (sort === 'oldest') {
            sql += ` ORDER BY posts.created_at ASC `; 
        } else {
            sql += ` ORDER BY posts.created_at DESC `; 
        }

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(sql, queryParams);
        res.json(formatPostsForFrontend(rows)); 
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a galéria betöltésekor.' }); 
    }
});

// Egy adott poszt részletes adatainak lekérése azonosító alapján
router.get('/posts/:id', async (req, res) => {
    try {
        const sql = `SELECT posts.*, users.username, users.avatar_url, categories.name as category_name, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count FROM posts JOIN users ON posts.user_id = users.id JOIN categories ON posts.category_id = categories.id WHERE posts.id = ?`;
        const [rows] = await db.query(sql, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'A poszt nem található.' });
        }
        
        res.json(formatPostsForFrontend(rows)[0]);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a poszt lekérésekor.' }); 
    }
});

// Új poszt létrehozása és a hozzá tartozó kép feltöltése
router.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, description, category_id, idea_id, tags } = req.body;
    
    if (!title || !req.file) {
        return res.status(400).json({ error: 'Cím és kép megadása kötelező.' });
    }

    try {
        const optimizedImageBuffer = await sharp(req.file.buffer).resize(1200, 800, { fit: sharp.fit.inside, withoutEnlargement: true }).toFormat('jpeg').toBuffer();
        let finalIdeaId = (idea_id && idea_id !== 'null' && idea_id !== '') ? parseInt(idea_id) : null;

        const [result] = await db.query(`INSERT INTO posts (user_id, category_id, idea_id, title, description, tags, image_url, image_data, image_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [req.user.id, category_id || 1, finalIdeaId, title, description, tags || null, 'PENDING', null, 'image/jpeg']);
        
        const newPostId = result.insertId;
        const filename = `post-${newPostId}.jpeg`;
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        await fs.promises.writeFile(path.join(uploadsDir, filename), optimizedImageBuffer);

        await db.query('UPDATE posts SET image_url = ? WHERE id = ?', [`http://localhost:3000/api/posts/${newPostId}/image`, newPostId]);

        if (finalIdeaId) {
            const [idea] = await db.query('SELECT user_id FROM ideas WHERE id = ?', [finalIdeaId]);
            if (idea.length > 0 && idea[0].user_id !== req.user.id) {
                try { 
                    await db.query('INSERT INTO notifications (user_id, sender_id, type, target_id) VALUES (?, ?, ?, ?)', [idea[0].user_id, req.user.id, 'implementation', finalIdeaId]); 
                } catch(e) {}
            }
        }
        
        res.status(201).json({ message: 'Poszt sikeresen létrehozva.', id: newPostId });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a poszt létrehozásakor.' }); 
    }
});

// Meglévő poszt címének és leírásának módosítása
router.put('/posts/:id', authenticateToken, async (req, res) => {
    if (!req.body.title) {
        return res.status(400).json({ error: 'A cím megadása kötelező.' });
    }
    
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        
        if (post.length === 0) {
            return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez.' });
        }
        
        await db.query('UPDATE posts SET title = ?, description = ? WHERE id = ?', [req.body.title, req.body.description, req.params.id]);
        res.json({ message: 'Poszt sikeresen frissítve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a poszt frissítésekor.' }); 
    }
});

// Poszt és a hozzá tartozó helyi képfájl törlése
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        
        if (post.length === 0) {
            return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez.' });
        }
        
        const filePath = path.join(__dirname, '..', 'uploads', `post-${req.params.id}.jpeg`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poszt sikeresen törölve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a poszt törlésekor.' }); 
    }
});

// Adott poszthoz tartozó képfájl lekérése
router.get('/posts/:id/image', async (req, res) => {
    try {
        const [posts] = await db.query('SELECT image_data, image_type, image_url FROM posts WHERE id = ?', [req.params.id]);
        
        if (posts.length === 0) {
            return res.status(404).send('A kép nem található.');
        }
        
        const post = posts[0];

        if (post.image_data) {
            res.setHeader('Content-Type', post.image_type || 'image/jpeg');
            res.send(post.image_data);
        } else {
            const filePath = path.join(__dirname, '..', 'uploads', `post-${req.params.id}.jpeg`);
            if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', post.image_type || 'image/jpeg');
                res.sendFile(filePath);
            } else {
                res.status(404).send('A képfájl nem található.');
            }
        }
    } catch (err) { 
        res.status(500).send('Szerverhiba a kép lekérésekor.'); 
    }
});

// A bejelentkezett felhasználó saját posztjainak lekérése
router.get('/my-posts', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT posts.*, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a posztok lekérésekor.' }); 
    }
});

// A bejelentkezett felhasználó által kedvelt posztok lekérése
router.get('/my-liked-posts', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT posts.*, users.username, users.avatar_url, (SELECT COUNT(*) FROM likes WHERE post_id = posts.id) AS like_count FROM posts JOIN likes ON posts.id = likes.post_id JOIN users ON posts.user_id = users.id WHERE likes.user_id = ? ORDER BY likes.created_at DESC', [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a kedvelt posztok lekérésekor.' }); 
    }
});

// A legújabb posztok lekérése a főoldalra
router.get('/latest-posts', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT posts.*, users.username, users.avatar_url FROM posts JOIN users ON posts.user_id = users.id WHERE posts.idea_id IS NULL ORDER BY posts.created_at DESC LIMIT 3');
        res.json(formatPostsForFrontend(rows));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a legújabb posztok lekérésekor.' }); 
    }
});

// Egy adott poszthoz tartozó kommentek lekérése
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT comments.*, users.username, users.avatar_url FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC', [req.params.id]);
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a kommentek lekérésekor.' }); 
    }
});

// Új komment írása egy adott poszthoz
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
    if (!req.body.content || req.body.content.trim() === '') {
        return res.status(400).json({ error: 'A komment nem lehet üres.' });
    }
    
    try {
        await db.query('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.id, req.body.content]);
        const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
        
        if (post.length > 0 && post[0].user_id !== req.user.id) {
            await sendNotification(post[0].user_id, req.user.id, 'comment', req.params.id);
        }
        
        res.status(201).json({ message: 'Komment sikeresen elküldve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a komment elküldésekor.' }); 
    }
});

// A bejelentkezett felhasználó által kedvelt posztok azonosítóinak lekérése
router.get('/my-likes', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id]);
        res.json(rows.map(r => r.post_id));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a kedvelések lekérésekor.' }); 
    }
});

// Poszt kedvelése vagy a kedvelés visszavonása
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
    try {
        const [existing] = await db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
        
        if (existing.length > 0) {
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
            await db.query('DELETE FROM notifications WHERE sender_id = ? AND type = ? AND target_id = ?', [req.user.id, 'like', req.params.id]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
            res.json({ liked: true });
            
            const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
            if (post.length > 0 && post[0].user_id !== req.user.id) {
                const [notifExists] = await db.query('SELECT id FROM notifications WHERE sender_id = ? AND type = ? AND target_id = ?', [req.user.id, 'like', req.params.id]);
                if (notifExists.length === 0) {
                    await sendNotification(post[0].user_id, req.user.id, 'like', req.params.id);
                }
            }
        }
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a kedvelés módosításakor.' }); 
    }
});

// Összes ötlet lekérése kategóriákkal és felhasználói adatokkal
router.get('/ideas', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT ideas.*, users.username, users.avatar_url, categories.name as category_name FROM ideas JOIN users ON ideas.user_id = users.id JOIN categories ON ideas.category_id = categories.id ORDER BY ideas.created_at DESC');
        res.json(rows); 
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az ötletek lekérésekor.' }); 
    }
});

// Új ötlet közzététele a közösség számára
router.post('/ideas', authenticateToken, async (req, res) => {
    const { title, description, category_id } = req.body;
    
    if (!title || !description || !category_id) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező.' });
    }
    
    try {
        await db.query('INSERT INTO ideas (user_id, category_id, title, description) VALUES (?, ?, ?, ?)', [req.user.id, category_id, title, description]);
        res.status(201).json({ message: 'Ötlet sikeresen közzétéve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az ötlet közzétételekor.' }); 
    }
});

// Egy adott ötlethez tartozó megvalósítások (posztok) lekérése
router.get('/ideas/:id/implementations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT posts.*, users.username, users.avatar_url, COUNT(likes.user_id) AS like_count FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON posts.id = likes.post_id WHERE posts.idea_id = ? GROUP BY posts.id ORDER BY posts.created_at DESC', [req.params.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a megvalósítások lekérésekor.' }); 
    }
});

// Jelentés küldése egy szabálysértő tartalomról vagy felhasználóról
router.post('/reports', authenticateToken, async (req, res) => {
    const { target_type, target_id, reason } = req.body;
    
    if (!target_type || !target_id || !reason) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező.' });
    }
    
    try {
        await db.query('INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)', [req.user.id, target_type, target_id, reason]);
        res.status(201).json({ message: 'Jelentés sikeresen elküldve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a jelentés elküldésekor.' }); 
    }
});

// Visszajelzés küldése az oldal működésével kapcsolatban
router.post('/feedbacks', authenticateToken, async (req, res) => {
    const { type, message } = req.body;
    
    if (!message || !type) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező.' });
    }
    
    try {
        await db.query('INSERT INTO feedbacks (user_id, type, message) VALUES (?, ?, ?)', [req.user.id, type, message]);
        res.status(201).json({ message: 'Visszajelzés sikeresen elküldve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a visszajelzés elküldésekor.' }); 
    }
});

// A bejelentkezett felhasználó gyűjteményeinek lekérése
router.get('/collections', authenticateToken, async (req, res) => {
    try {
        const [collections] = await db.query('SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(collections);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a gyűjtemények lekérésekor.' }); 
    }
});

// Új gyűjtemény létrehozása
router.post('/collections', authenticateToken, async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ error: 'A név megadása kötelező.' });
    }
    
    try {
        const [result] = await db.query('INSERT INTO collections (user_id, name) VALUES (?, ?)', [req.user.id, req.body.name]);
        res.status(201).json({ id: result.insertId, name: req.body.name, user_id: req.user.id });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a gyűjtemény létrehozásakor.' }); 
    }
});

// Poszt hozzáadása egy meglévő gyűjteményhez
router.post('/collections/:collectionId/add', authenticateToken, async (req, res) => {
    try {
        const [exists] = await db.query('SELECT * FROM collection_items WHERE collection_id = ? AND post_id = ?', [req.params.collectionId, req.body.postId]);
        
        if (exists.length > 0) {
            return res.status(400).json({ error: 'A poszt már szerepel a gyűjteményben.' });
        }
        
        await db.query('INSERT INTO collection_items (collection_id, post_id) VALUES (?, ?)', [req.params.collectionId, req.body.postId]);
        res.json({ message: 'Poszt sikeresen hozzáadva a gyűjteményhez.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a gyűjteményhez adáskor.' }); 
    }
});

// Egy adott felhasználó nyilvános gyűjteményeinek lekérése
router.get('/users/:username/collections', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [req.params.username]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található.' });
        }

        const [collections] = await db.query(`SELECT c.*, (SELECT ci.post_id FROM collection_items ci WHERE ci.collection_id = c.id ORDER BY ci.added_at DESC LIMIT 1) as cover_post_id, (SELECT COUNT(*) FROM collection_items WHERE collection_id = c.id) as item_count FROM collections c WHERE c.user_id = ? ORDER BY c.created_at DESC`, [users[0].id]);
        res.json(collections.map(col => ({ ...col, cover_image: col.cover_post_id ? `http://localhost:3000/api/posts/${col.cover_post_id}/image` : null })));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a felhasználó gyűjteményeinek lekérésekor.' }); 
    }
});

// Egy adott gyűjteményhez tartozó posztok lekérése
router.get('/collections/:id/posts', async (req, res) => {
    try {
        const [posts] = await db.query(`SELECT p.*, u.username, u.avatar_url, c.name as category_name, (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count FROM collection_items ci JOIN posts p ON ci.post_id = p.id JOIN users u ON p.user_id = u.id JOIN categories c ON p.category_id = c.id WHERE ci.collection_id = ? ORDER BY ci.added_at DESC`, [req.params.id]);
        res.json(formatPostsForFrontend(posts));
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a gyűjtemény posztjainak lekérésekor.' }); 
    }
});

// Gyűjtemény törlése az összes benne lévő hivatkozással együtt
router.delete('/collections/:id', authenticateToken, async (req, res) => {
    try {
        const [collection] = await db.query('SELECT user_id FROM collections WHERE id = ?', [req.params.id]);
        
        if (collection.length === 0 || collection[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez.' });
        }
        
        await db.query('DELETE FROM collection_items WHERE collection_id = ?', [req.params.id]);
        await db.query('DELETE FROM collections WHERE id = ?', [req.params.id]);
        res.json({ message: 'Gyűjtemény sikeresen törölve.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a gyűjtemény törlésekor.' }); 
    }
});

// Egy poszt eltávolítása a gyűjteményből
router.delete('/collections/:collectionId/posts/:postId', authenticateToken, async (req, res) => {
    try {
        const [collection] = await db.query('SELECT user_id FROM collections WHERE id = ?', [req.params.collectionId]);
        
        if (collection.length === 0 || collection[0].user_id !== req.user.id) {
            return res.status(403).json({ error: 'Nincs jogosultságod ehhez a művelethez.' });
        }
        
        await db.query('DELETE FROM collection_items WHERE collection_id = ? AND post_id = ?', [req.params.collectionId, req.params.postId]);
        res.json({ message: 'Kép sikeresen eltávolítva a gyűjteményből.' });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a kép eltávolításakor.' }); 
    }
});

// Adott felhasználó ötleteinek lekérése a profiljához
router.get('/users/:username/ideas', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [req.params.username]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'A felhasználó nem található.' });
        }

        const [ideas] = await db.query(`
            SELECT ideas.*, users.username, users.avatar_url, categories.name as category_name 
            FROM ideas 
            JOIN users ON ideas.user_id = users.id 
            JOIN categories ON ideas.category_id = categories.id 
            WHERE ideas.user_id = ? 
            ORDER BY ideas.created_at DESC
        `, [users[0].id]);
        
        res.json(ideas);
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba az ötletek betöltésekor.' }); 
    }
});

module.exports = router;