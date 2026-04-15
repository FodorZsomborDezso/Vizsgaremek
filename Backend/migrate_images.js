const fs = require('fs');
const path = require('path');
const db = require('./db');

const uploadsDir = path.join(__dirname, 'uploads');

// Adatbázisban tárolt BLOB képek fájlrendszerbe mozgatása és az elérési utak frissítése.
async function migrateImages() {
    console.log('Migráció indítása...');

    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    try {
        await migratePosts();
        await migrateAvatars();
        console.log('Migráció sikeresen befejeződött.');
        process.exit(0);
    } catch (err) {
        console.error('Hiba történt a migráció közben:', err);
        process.exit(1);
    }
}

// Posztokhoz tartozó BLOB képek kimentése fájlba és az adatbázis rekordok frissítése.
async function migratePosts() {
    const [posts] = await db.query('SELECT id, image_data FROM posts WHERE image_data IS NOT NULL');
    for (const post of posts) {
        const filePath = path.join(uploadsDir, `post-${post.id}.jpeg`);
        await fs.promises.writeFile(filePath, post.image_data);
        await db.query('UPDATE posts SET image_url = ?, image_data = NULL WHERE id = ?', [`http://localhost:3000/api/posts/${post.id}/image`, post.id]);
    }
}

// Felhasználói profilképek fájlba mentése és az adatbázis URL hivatkozásainak frissítése.
async function migrateAvatars() {
    const [users] = await db.query('SELECT id, avatar_data FROM users WHERE avatar_data IS NOT NULL');
    for (const user of users) {
        const filePath = path.join(uploadsDir, `avatar-${user.id}.jpeg`);
        await fs.promises.writeFile(filePath, user.avatar_data);
        await db.query('UPDATE users SET avatar_url = ?, avatar_data = NULL WHERE id = ?', [`http://localhost:3000/api/users/${user.id}/avatar`, user.id]);
    }
}

migrateImages();