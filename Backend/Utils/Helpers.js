const db = require('../db');
const multer = require('multer');

// Multer middleware a fájlok memóriában történő ideiglenes tárolásához.
const upload = multer({ storage: multer.memoryStorage() });

// Posztok tömbjének formázása a kliensoldal számára, kép URL-ek javításával.
const formatPostsForFrontend = (posts) => {
    return posts.map(post => {
        const formattedPost = { ...post };
        if (formattedPost.image_url === 'BLOB') {
            formattedPost.image_url = `http://localhost:3000/api/posts/${formattedPost.id}/image`;
        }
        delete formattedPost.image_data;
        return formattedPost;
    });
};

// Új értesítés rögzítése az adatbázisban, ha a küldő és a fogadó nem azonos.
const sendNotification = async (userId, senderId, type, targetId = null) => {
    if (userId === senderId) return;
    try { await db.query('INSERT INTO notifications (user_id, sender_id, type, target_id) VALUES (?, ?, ?, ?)', [userId, senderId, type, targetId]); } catch (err) {}
};

module.exports = { upload, formatPostsForFrontend, sendNotification };