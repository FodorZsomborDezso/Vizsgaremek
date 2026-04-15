const request = require('supertest');
const express = require('express');
const contentRoutes = require('../../Routes/Content');
const db = require('../../db');
const fs = require('fs');

// Függőségek mockolása
jest.mock('../../db', () => ({
    query: jest.fn()
}));

// Fájlrendszer mockolása
jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    unlinkSync: jest.fn(),
    promises: {
        writeFile: jest.fn().mockResolvedValue(true)
    }
}));

// Sharp (képméretező) mockolása
jest.mock('sharp', () => {
    const sharpMock = jest.fn().mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-buffer'))
    }));
    // Mockoljuk a sharp beépített .fit enumerációját is
    sharpMock.fit = { inside: 'inside', cover: 'cover' };
    return sharpMock;
});

// Hitelesítési middleware mockolása (hogy "bejelentkezve" legyünk a védett végpontokon)
jest.mock('../../Middlewares/Auth', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { id: 1, username: 'testuser' }; // Beépített teszt felhasználó
        next();
    }
}));

// Segédfüggvények (Multer, formázó, értesítések) mockolása
jest.mock('../../Utils/Helpers', () => ({
    upload: {
        // A multer file feltöltését szimuláljuk, beleteszünk egy kamu fájlt a kérésbe
        single: () => (req, res, next) => {
            req.file = { buffer: Buffer.from('fake-file-data'), mimetype: 'image/jpeg' };
            next();
        }
    },
    formatPostsForFrontend: jest.fn(posts => posts), // Egyszerűen visszaadja amit kapott
    sendNotification: jest.fn().mockResolvedValue(true)
}));

// Express app felépítése a teszteléshez
const app = express();
app.use(express.json());
app.use('/api', contentRoutes);

describe('Content Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Tiszta lappal indul minden teszt
    });

    describe('GET /api/gallery', () => {
        it('Sikeresen le kell kérnie a galéria posztjait', async () => {
            const mockPosts = [{ id: 1, title: 'Első poszt' }, { id: 2, title: 'Második poszt' }];
            db.query.mockResolvedValue([mockPosts]); // db válasz beállítása

            const res = await request(app).get('/api/gallery');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT posts.*'), expect.any(Array));
        });
    });

    describe('GET /api/posts/:id', () => {
        it('Sikeresen le kell kérnie egy adott poszt részleteit', async () => {
            const mockPost = { id: 10, title: 'Részletes poszt' };
            db.query.mockResolvedValue([[mockPost]]); // db.query mindig egy [rows, fields] formát ad vissza a valóságban, mi a rowst adjuk

            const res = await request(app).get('/api/posts/10');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPost);
        });

        it('404-es hibát kell dobnia, ha a poszt nem létezik', async () => {
            db.query.mockResolvedValue([[]]); // Üres eredményhalmaz

            const res = await request(app).get('/api/posts/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'A poszt nem található.' });
        });
    });

    describe('POST /api/posts', () => {
        it('Sikeresen létre kell hoznia egy új posztot', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 42 }]); // INSERT posztba
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE image_url

            const res = await request(app)
                .post('/api/posts')
                .send({ title: 'Új alkotás', description: 'Nagyon szép kép' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'Poszt sikeresen létrehozva.', id: 42 });
            expect(fs.promises.writeFile).toHaveBeenCalled(); // Ellenőrizzük, hogy mentette-e a fájlt
        });

        it('400-as hibát kell adnia, ha hiányzik a cím', async () => {
            const res = await request(app)
                .post('/api/posts')
                .send({ description: 'Cím nélküli próbálkozás' }); // Direkt nem küldünk címet (title)

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Cím és kép megadása kötelező.' });
            expect(db.query).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/posts/:id', () => {
        it('Sikeresen törölnie kell a saját posztot és a képfájlt', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, user_id: 1 }]]); // SELECT: a poszt a miénk (user_id: 1)
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE utasítás sikeres
            fs.existsSync.mockReturnValueOnce(true); // Fájl létezik a lemezen

            const res = await request(app).delete('/api/posts/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Poszt sikeresen törölve.' });
            expect(fs.unlinkSync).toHaveBeenCalled(); // Törölte a fájlt
        });

        it('403-as hibát kell dobnia, ha a poszt nem a miénk', async () => {
            db.query.mockResolvedValueOnce([[]]); // A SELECT nem talál a mi ID-nkal posztot

            const res = await request(app).delete('/api/posts/2');

            expect(res.status).toBe(403);
            expect(res.body).toEqual({ error: 'Nincs jogosultságod ehhez a művelethez.' });
        });
    });

    describe('POST /api/posts/:id/comments', () => {
        it('Sikeresen hozzá kell adnia egy kommentet', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); // INSERT komment
            db.query.mockResolvedValueOnce([[{ user_id: 2 }]]); // Értesítéshez lekéri a poszt tulaját

            const res = await request(app)
                .post('/api/posts/1/comments')
                .send({ content: 'Nagyon jó kép, gratulálok!' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'Komment sikeresen elküldve.' });
        });

        it('400-as hibát kell adnia üres komment esetén', async () => {
            const res = await request(app).post('/api/posts/1/comments').send({ content: '   ' });
            
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'A komment nem lehet üres.' });
        });
    });

    describe('POST /api/posts/:id/like', () => {
        it('Sikeresen kedvelnie kell egy posztot (és értesítést küldeni)', async () => {
            db.query.mockResolvedValueOnce([[]]); // Nincs még kedvelve (existing.length === 0)
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); // INSERT a likes táblába
            db.query.mockResolvedValueOnce([[{ user_id: 2 }]]); // Poszt tulajdonosának lekérése az értesítéshez
            db.query.mockResolvedValueOnce([[]]); // Nincs még korábbi értesítés

            const res = await request(app).post('/api/posts/1/like');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ liked: true });
        });

        it('Vissza kell vonnia a kedvelést, ha már kedvelte a posztot', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1 }]]); // A SELECT talál meglévő kedvelést
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE a likes táblából
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE a notifications táblából

            const res = await request(app).post('/api/posts/1/like');

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ liked: false });
        });
    });

    describe('PUT /api/posts/:id', () => {
        it('Sikeresen frissítenie kell a saját posztot', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, user_id: 1 }]]); // A poszt a miénk
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE siker

            const res = await request(app).put('/api/posts/1').send({ title: 'Új cím', description: 'Új leírás' });
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Poszt sikeresen frissítve.' });
        });

        it('400-as hibát kell adnia, ha hiányzik a cím', async () => {
            const res = await request(app).put('/api/posts/1').send({ description: 'Cím nélkül' });
            expect(res.status).toBe(400);
        });

        it('403-as hibát kell dobnia, ha a poszt nem a miénk vagy nem létezik', async () => {
            db.query.mockResolvedValueOnce([[]]); // Nem találta a mi ID-nkal
            const res = await request(app).put('/api/posts/1').send({ title: 'Cím' });
            expect(res.status).toBe(403);
        });
    });

    describe('GET /api/posts/:id/image', () => {
        it('Sikeresen vissza kell adnia a képet buffer (adatbázis) formájában, ha van image_data', async () => {
            const fakeBuffer = Buffer.from('kép-adatok');
            db.query.mockResolvedValueOnce([[{ image_data: fakeBuffer, image_type: 'image/png' }]]);

            const res = await request(app).get('/api/posts/1/image');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('image/png');
        });

        it('404-es hibát kell adnia, ha egyáltalán nincs ilyen poszt', async () => {
            db.query.mockResolvedValueOnce([[]]);
            const res = await request(app).get('/api/posts/999/image');
            expect(res.status).toBe(404);
        });

        it('404-es hibát kell adnia, ha a fájl nincs az adatbázisban és a lemezen sem', async () => {
            db.query.mockResolvedValueOnce([[{ image_data: null, image_type: 'image/jpeg' }]]);
            fs.existsSync.mockReturnValueOnce(false); // A fájl nem található a lemezen
            
            const res = await request(app).get('/api/posts/1/image');
            expect(res.status).toBe(404);
        });
    });

    describe('Lekérdező végpontok (GET listák)', () => {
        it('GET /api/my-posts - Saját posztok lekérése', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, title: 'Saját' }]]);
            const res = await request(app).get('/api/my-posts');
            expect(res.status).toBe(200);
        });

        it('GET /api/my-liked-posts - Kedvelt posztok', async () => {
            db.query.mockResolvedValueOnce([[{ id: 2, title: 'Kedvelt' }]]);
            const res = await request(app).get('/api/my-liked-posts');
            expect(res.status).toBe(200);
        });

        it('GET /api/latest-posts - Legújabb posztok', async () => {
            db.query.mockResolvedValueOnce([[{ id: 3, title: 'Új' }]]);
            const res = await request(app).get('/api/latest-posts');
            expect(res.status).toBe(200);
        });

        it('GET /api/my-likes - Saját kedvelések (ID-k)', async () => {
            db.query.mockResolvedValueOnce([[{ post_id: 10 }, { post_id: 20 }]]);
            const res = await request(app).get('/api/my-likes');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([10, 20]);
        });
    });

    describe('Bejelentések és visszajelzések', () => {
        it('POST /api/reports - Sikeres bejelentés', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 1 }]);
            const res = await request(app).post('/api/reports').send({ target_type: 'post', target_id: 1, reason: 'Spam' });
            expect(res.status).toBe(201);
        });

        it('POST /api/reports - Hiányzó mezők (400)', async () => {
            const res = await request(app).post('/api/reports').send({ reason: 'Spam' });
            expect(res.status).toBe(400);
        });

        it('POST /api/feedbacks - Sikeres visszajelzés', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 1 }]);
            const res = await request(app).post('/api/feedbacks').send({ type: 'bug', message: 'Hiba' });
            expect(res.status).toBe(201);
        });
    });

    describe('Collections (Gyűjtemények)', () => {
        it('POST /api/collections - Sikeresen létre kell hoznia egy új gyűjteményt', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 5 }]); // INSERT result
            const res = await request(app).post('/api/collections').send({ name: 'Kedvenc Festmények' });
            expect(res.status).toBe(201);
            expect(res.body).toEqual({ id: 5, name: 'Kedvenc Festmények', user_id: 1 });
        });

        it('GET /api/collections - Saját gyűjtemények lekérése', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, name: 'Gyűjtemény1' }]]);
            const res = await request(app).get('/api/collections');
            expect(res.status).toBe(200);
        });

        it('POST /api/collections/:collectionId/add - Poszt hozzáadása', async () => {
            db.query.mockResolvedValueOnce([[]]); // Nem létezik még a poszt a gyűjteményben
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Sikeres hozzáadás
            const res = await request(app).post('/api/collections/1/add').send({ postId: 10 });
            expect(res.status).toBe(200);
        });

        it('DELETE /api/collections/:id - Gyűjtemény törlése', async () => {
            db.query.mockResolvedValueOnce([[{ user_id: 1 }]]); // A gyűjtemény a mienk
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Tételek törlése
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Gyűjtemény törlése
            const res = await request(app).delete('/api/collections/1');
            expect(res.status).toBe(200);
        });
    });

    describe('Ideas (Ötletek)', () => {
        it('POST /api/ideas - Sikeresen közzé kell tennie egy új ötletet', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 10 }]); // INSERT result
            const res = await request(app).post('/api/ideas').send({ title: 'Ötlet', description: 'Leírás', category_id: 2 });
            expect(res.status).toBe(201);
        });

        it('GET /api/ideas - Összes ötlet lekérése', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, title: 'Ötlet' }]]);
            const res = await request(app).get('/api/ideas');
            expect(res.status).toBe(200);
        });
    });
});