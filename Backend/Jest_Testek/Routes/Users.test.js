const request = require('supertest');
const express = require('express');
const userRoutes = require('../../Routes/Users');
const db = require('../../db');
const fs = require('fs');

// Függőségek mockolása
jest.mock('../../db', () => ({
    query: jest.fn()
}));

jest.mock('fs', () => ({
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    promises: {
        writeFile: jest.fn().mockResolvedValue(true)
    }
}));

jest.mock('sharp', () => {
    const sharpMock = jest.fn().mockImplementation(() => ({
        resize: jest.fn().mockReturnThis(),
        toFormat: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('fake-image-buffer'))
    }));
    sharpMock.fit = { inside: 'inside', cover: 'cover' };
    return sharpMock;
});

jest.mock('../../Middlewares/Auth', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { id: 1, username: 'testuser' }; // Bejelentkezett teszt felhasználó (ID: 1)
        next();
    }
}));

jest.mock('../../Utils/Helpers', () => ({
    upload: {
        // A Multer mockolása: ha a fejlécben kérjük, szimulál egy fájlfeltöltést
        single: () => (req, res, next) => {
            if (req.headers['x-simulate-file'] === 'true') {
                req.file = { buffer: Buffer.from('fake-image-data'), mimetype: 'image/jpeg' };
            }
            next();
        }
    },
    formatPostsForFrontend: jest.fn(posts => posts),
    sendNotification: jest.fn().mockResolvedValue(true)
}));

// Express app felépítése a teszteléshez
const app = express();
app.use(express.json());
app.use('/api', userRoutes);

describe('Users Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Tiszta lappal indulunk minden teszt előtt
    });

    describe('PUT /api/users/profile', () => {
        it('Sikeresen frissíti a profilt kép nélkül', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE siker
            db.query.mockResolvedValueOnce([[{ id: 1, full_name: 'Teszt Elek' }]]); // SELECT visszaolvasás

            const res = await request(app).put('/api/users/profile').send({ full_name: 'Teszt Elek' });
            
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Profil sikeresen frissítve.');
            expect(fs.promises.writeFile).not.toHaveBeenCalled(); // Nem volt fájlfeltöltés
        });

        it('Sikeresen frissíti a profilt és elmenti a képet, ha van feltöltve fájl', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE
            db.query.mockResolvedValueOnce([[{ id: 1, full_name: 'Teszt' }]]); // SELECT

            const res = await request(app)
                .put('/api/users/profile')
                .set('x-simulate-file', 'true') // Szimuláljuk a Multer fájlt
                .send({ full_name: 'Teszt' });

            expect(res.status).toBe(200);
            expect(fs.promises.writeFile).toHaveBeenCalled(); // Lemezre mentés megtörtént
        });

        it('500-as hibát ad adatbázis hiba esetén', async () => {
            db.query.mockRejectedValueOnce(new Error('DB hiba')); // Szimuláljuk az SQL összeomlását
            const res = await request(app).put('/api/users/profile').send({ full_name: 'Hiba' });
            expect(res.status).toBe(500);
        });
    });

    describe('Gépelési státusz (Typing)', () => {
        it('Sikeresen beállítja és lekéri a gépelési státuszt', async () => {
            // 1. lépés: A mi userünk (ID 1) gépel a 2-es usernek
            await request(app).post('/api/typing/2');
            
            // 2. lépés: Lekérdezzük, hogy az 1-es gépel-e a mi irányunkba
            // Mivel a middleware mindig az 1-est adja be req.user-ként, így magunktól kérdezzük le (ID 1 -> ID 1)
            await request(app).post('/api/typing/1'); 
            const res = await request(app).get('/api/typing/1');
            
            expect(res.status).toBe(200);
            expect(res.body.isTyping).toBe(true);
        });
    });

    describe('GET /api/users/:id/avatar', () => {
        it('Visszaadja az adatbázis BLOB képet, ha a fájl nincs a lemezen', async () => {
            const fakeBuffer = Buffer.from('kep-adatok');
            db.query.mockResolvedValueOnce([[{ avatar_data: fakeBuffer, avatar_type: 'image/png' }]]);
            fs.existsSync.mockReturnValueOnce(false); // Nincs fájl a szerveren

            const res = await request(app).get('/api/users/2/avatar');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toBe('image/png');
        });

        it('404-es hibát ad, ha nincs se fájl, se BLOB adat', async () => {
            db.query.mockResolvedValueOnce([[{ avatar_data: null }]]);
            fs.existsSync.mockReturnValueOnce(false);

            const res = await request(app).get('/api/users/2/avatar');
            expect(res.status).toBe(404);
        });

        it('404-es hibát ad, ha a felhasználó nem is létezik', async () => {
            db.query.mockResolvedValueOnce([[]]); // Üres válasz a SELECT-re
            const res = await request(app).get('/api/users/99/avatar');
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/users/:username', () => {
        it('Lekéri a felhasználót és a posztjait név alapján', async () => {
            db.query.mockResolvedValueOnce([[{ id: 2, username: 'masikuser' }]]); // Felhasználó adat
            db.query.mockResolvedValueOnce([[{ id: 10, title: 'Poszt 1' }]]); // Posztjai

            const res = await request(app).get('/api/users/masikuser');
            expect(res.status).toBe(200);
            expect(res.body.user.username).toBe('masikuser');
        });

        it('404-es hibát ad, ha nem létezik a felhasználó', async () => {
            db.query.mockResolvedValueOnce([[]]);
            const res = await request(app).get('/api/users/nincsilyen');
            expect(res.status).toBe(404);
        });
    });

    describe('Követési rendszer (Follows)', () => {
        it('GET /api/users/:id/is-following - Visszaadja a követési státuszt', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Én követem őt
            db.query.mockResolvedValueOnce([[]]); // Ő nem követ engem

            const res = await request(app).get('/api/users/2/is-following');
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ isFollowing: true, isFollowingMe: false });
        });

        it('POST /api/users/:id/follow - 400-as hiba saját magunk követésére', async () => {
            const res = await request(app).post('/api/users/1/follow'); // req.user.id == 1
            expect(res.status).toBe(400);
        });

        it('POST /api/users/:id/follow - Beköveti a felhasználót és értesítést küld', async () => {
            db.query.mockResolvedValueOnce([[]]); // Még nem követi
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT follow
            db.query.mockResolvedValueOnce([[]]); // Még nincs értesítés erről

            const res = await request(app).post('/api/users/2/follow');
            expect(res.status).toBe(200);
            expect(res.body.followed).toBe(true);
        });

        it('POST /api/users/:id/follow - Kiköveti a felhasználót (törlés)', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Már követi
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE follow
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE értesítés

            const res = await request(app).post('/api/users/2/follow');
            expect(res.status).toBe(200);
            expect(res.body.followed).toBe(false);
        });
    });

    describe('Privát üzenetek és ismerősök', () => {
        it('GET /api/friends - Lekéri az ismerősöket (kölcsönös követők)', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE last_seen
            db.query.mockResolvedValueOnce([[{ id: 2, username: 'barat1' }]]); // Barátok listája

            const res = await request(app).get('/api/friends');
            expect(res.status).toBe(200);
            expect(res.body[0].username).toBe('barat1');
        });

        it('GET /api/messages/:id - Lekéri a beszélgetést', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE is_read
            db.query.mockResolvedValueOnce([[{ content: 'Szia', sender_id: 2 }]]); // Üzenetek

            const res = await request(app).get('/api/messages/2');
            expect(res.status).toBe(200);
            expect(res.body[0].content).toBe('Szia');
        });

        it('POST /api/messages/:id - Sikeresen elküldi az üzenetet kölcsönös követés esetén', async () => {
            db.query.mockResolvedValueOnce([[{ iFollowThem: 1, theyFollowMe: 1 }]]); // Kölcsönös követés aktív
            db.query.mockResolvedValueOnce([{ insertId: 5 }]); // INSERT message

            const res = await request(app).post('/api/messages/2').send({ content: 'Új üzenet!' });
            expect(res.status).toBe(201);
            expect(res.body.messageId).toBe(5);
        });

        it('POST /api/messages/:id - 403-as hibát ad, ha nem kölcsönös a követés', async () => {
            db.query.mockResolvedValueOnce([[{ iFollowThem: 1, theyFollowMe: 0 }]]); // Csak az egyik irány aktív
            const res = await request(app).post('/api/messages/2').send({ content: 'Új üzenet!' });
            expect(res.status).toBe(403);
        });

        it('POST /api/messages/:id - 400-as hibát ad üres üzenet esetén', async () => {
            const res = await request(app).post('/api/messages/2').send({ content: '   ' });
            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Az üzenet nem lehet üres.');
        });
    });

    describe('Értesítések', () => {
        it('GET /api/notifications - Lekéri az értesítéseket', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, type: 'like' }]]);
            const res = await request(app).get('/api/notifications');
            expect(res.status).toBe(200);
        });

        it('PUT /api/notifications/read - Olvasottnak jelöli az összeset', async () => {
            db.query.mockResolvedValueOnce([{ affectedRows: 2 }]);
            const res = await request(app).put('/api/notifications/read');
            expect(res.status).toBe(200);
        });
    });

    describe('Egyéb lekérdezések (Top users, Search, User by ID)', () => {
        it('GET /api/users/id/:id - Publikus profil azonosító alapján', async () => {
            db.query.mockResolvedValueOnce([[{ id: 2, username: 'pelda' }]]);
            const res = await request(app).get('/api/users/id/2');
            expect(res.status).toBe(200);
        });

        it('GET /api/users/id/:id - 404-es hiba, ha nem található a profil', async () => {
            db.query.mockResolvedValueOnce([[]]);
            const res = await request(app).get('/api/users/id/99');
            expect(res.status).toBe(404);
        });

        it('GET /api/top-users - Legnépszerűbb felhasználók listája', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, total_likes: 100 }]]);
            const res = await request(app).get('/api/top-users');
            expect(res.status).toBe(200);
        });

        it('GET /api/search - Keresési eredményt ad vissza lekérdezés (q) esetén', async () => {
            db.query.mockResolvedValueOnce([[{ id: 2, username: 'keresett_user' }]]);
            const res = await request(app).get('/api/search?q=keres');
            expect(res.status).toBe(200);
            expect(res.body[0].username).toBe('keresett_user');
        });

        it('GET /api/search - Üres tömböt ad vissza keresési kifejezés (q) hiányában', async () => {
            const res = await request(app).get('/api/search');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([]);
        });
    });
});