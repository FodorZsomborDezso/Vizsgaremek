# Backend Felépítés és Logika

Az **ArtisticEye** backendje egy robusztus, skálázható és biztonságos RESTful API-ra épül, amelynek alapját a **Node.js** és az **Express.js** keretrendszer adja. A perzisztens adattárolásért egy relációs **MySQL** adatbázis felel, amellyel paraméterezett lekérdezéseken keresztül kommunikálunk.

## Tartalomjegyzék
- [Architekturális Alapelvek](#architekturális-alapelvek)
- [Kódrészletek és Funkciók](#kódrészletek-és-funkciók)

---

## Architekturális Alapelvek

A szerveroldali logika kialakításakor a modularitást és a biztonságot tartottuk szem előtt:

1. **Biztonság (Security):** 
   - A felhasználók hitelesítése **JSON Web Token (JWT)** segítségével történik. A védett végpontokat egy dedikált `authenticateToken` middleware védi.
   - Az adatbázis-műveletek során minden felhasználói bemenetet **paraméterezett lekérdezésekkel** (prepared statements) adunk át, ezzel teljes védelmet nyújtva az SQL Injection támadások ellen.
   - A jelszavakat egyirányú titkosítással, **Bcrypt.js** használatával tároljuk.

2. **Intelligens Képfeldolgozás:**
   - A fájlfeltöltést a `multer` könyvtár kezeli, amely a képeket első körben a memóriába (buffer) tölti.
   - A szerver a `sharp` könyvtár segítségével azonnal átméretezi, optimalizálja és egységesíti (pl. `.jpeg` formátumra) a képeket, mielőtt azok a fájlrendszerbe vagy az adatbázisba kerülnének. Ez nagyságrendekkel csökkenti a hálózati forgalmat és a betöltési időt.

3. **Moduláris Útválasztás (Routing):**
   - A végpontok logikailag szét vannak választva különböző router fájlokba (pl. `Content.js` a posztokhoz és galériához, `Users.js` a profilokhoz és interakciókhoz), ezzel biztosítva a kód átláthatóságát.

4. **Hatékony Állapotkezelés (In-Memory State):**
   - A gyors, átmeneti adatok kezelésére (mint például a privát chatnél a "gépelés jelzése") a backend egy szerveroldali memóriatárhelyet (`Map`) használ az adatbázis felesleges terhelésének elkerülése érdekében.
5. **Értesítési Rendszer:**
   - Az interakciók (követés, kedvelés, kommentelés) során a backend regisztrálja a rendszerértesítéseket egy központosított `sendNotification` segédfüggvény meghívásával.

---

## Kódrészletek és Funkciók

### 1. Képfeldolgozás és Poszt Létrehozása
Az alábbi kódrészlet azt mutatja be, hogyan történik egy új poszt létrehozása. A `multer` memóriába tölti a képet (`req.file.buffer`), amit a `sharp` azonnal átméretez, és csak a már optimalizált verziót mentjük el.

```javascript
// Részlet a Content.js fájlból
router.post('/posts', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, description, category_id } = req.body;
    
    if (!title || !req.file) {
        return res.status(400).json({ error: 'Cím és kép megadása kötelező.' });
    }

    try {
        // Kép optimalizálása Sharp segítségével
        const optimizedImageBuffer = await sharp(req.file.buffer)
            .resize(1200, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg')
            .toBuffer();

        // Adatbázis rekord létrehozása paraméterezett query-vel
        const [result] = await db.query(
            `INSERT INTO posts (user_id, category_id, title, description, image_url, image_type) VALUES (?, ?, ?, ?, ?, ?)`, 
            [req.user.id, category_id || 1, title, description, 'PENDING', 'image/jpeg']
        );
        
        // Fájl mentése a szerver fájlrendszerébe
        const newPostId = result.insertId;
        const filename = `post-${newPostId}.jpeg`;
        await fs.promises.writeFile(path.join(uploadsDir, filename), optimizedImageBuffer);
        
        res.status(201).json({ message: 'Poszt sikeresen létrehozva.', id: newPostId });
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a poszt létrehozásakor.' }); 
    }
});
```

### 2. Összetett Lekérdezések és Lapozás (Pagination)
A galéria lekérésekor fontos szempont a teljesítmény. Az SQL lekérdezés lapozást (`LIMIT`, `OFFSET`) használ, és egyetlen query-ben kapcsolja össze (JOIN) a posztokat a felhasználók és kategóriák adataival, valamint összesíti (COUNT) a like-okat.

```javascript
// Részlet a Content.js galéria végpontjából
router.get('/gallery', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;

        // SQL query összeállítása JOIN-okkal és összesítéssel
        let sql = `SELECT posts.*, users.username, users.avatar_url, categories.name as category_name, COUNT(likes.user_id) AS like_count FROM posts JOIN users ON posts.user_id = users.id JOIN categories ON posts.category_id = categories.id LEFT JOIN likes ON posts.id = likes.post_id WHERE posts.idea_id IS NULL GROUP BY posts.id ORDER BY posts.created_at DESC LIMIT ? OFFSET ?`;
        
        const [rows] = await db.query(sql, [limit, offset]);
        res.json(formatPostsForFrontend(rows)); 
    } catch (err) { 
        res.status(500).json({ error: 'Szerverhiba a galéria betöltésekor.' }); 
    }
});
```