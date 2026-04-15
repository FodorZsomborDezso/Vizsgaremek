const request = require('supertest');
const express = require('express');
const newsletterRoutes = require('../../Routes/Newsletter');
const db = require('../../db');
const sendEmail = require('../../Utils/sendEmail');

// Függőségek mockolása
jest.mock('../../db', () => ({
    query: jest.fn()
}));
jest.mock('../../Utils/sendEmail');

// Express app felépítése a teszteléshez
const app = express();
app.use(express.json());
app.use('/api/newsletter', newsletterRoutes); // Csatoljuk be a hírlevél útvonalakat

describe('Newsletter Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Minden teszt előtt tiszta lappal indulunk
    });

    describe('POST /api/newsletter/subscribe', () => {
        it('400-as hibát kell adnia, ha hiányzik az e-mail', async () => {
            const res = await request(app).post('/api/newsletter/subscribe').send({});
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Az e-mail cím kötelező.' });
            expect(db.query).not.toHaveBeenCalled();
        });

        it('400-as hibát kell adnia érvénytelen e-mail formátum esetén', async () => {
            const res = await request(app).post('/api/newsletter/subscribe').send({ email: 'rossz_email_formatum' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Érvénytelen e-mail formátum.' });
        });

        it('Sikeresen fel kell iratkoztatnia egy új e-mail címet (201)', async () => {
            db.query.mockResolvedValueOnce([{ insertId: 1 }]); // INSERT a feliratkozókba
            db.query.mockResolvedValueOnce([[{ content: 'Legújabb Hírlevél Tartalom' }]]); // SELECT az extra tartalomhoz
            sendEmail.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/newsletter/subscribe')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'Sikeresen feliratkoztál a hírlevélre.' });
            expect(sendEmail).toHaveBeenCalled(); // Megnézzük, hogy az e-mail küldő függvény lefutott-e
        });

        it('Újra kell aktiválnia a fiókot, ha korábban leiratkozott, de újra próbálkozik (200)', async () => {
            const duplicateError = new Error('Duplicate entry');
            duplicateError.code = 'ER_DUP_ENTRY';
            
            db.query.mockRejectedValueOnce(duplicateError); // Szimuláljuk, hogy már létezik ez az email az adatbázisban
            db.query.mockResolvedValueOnce([[{ is_active: 0 }]]); // SELECT is_active -> jelenleg 0 (inaktív)
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE is_active = 1
            sendEmail.mockResolvedValue(true);

            const res = await request(app).post('/api/newsletter/subscribe').send({ email: 'visszatero@test.com' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Korábbi feliratkozásodat sikeresen újraaktiváltuk.' });
            expect(sendEmail).toHaveBeenCalled();
        });

        it('409-es hibát kell adnia, ha már létezik és aktív a feliratkozás', async () => {
            const duplicateError = new Error('Duplicate entry');
            duplicateError.code = 'ER_DUP_ENTRY';
            
            db.query.mockRejectedValueOnce(duplicateError); // INSERT elhasal a duplikáció miatt
            db.query.mockResolvedValueOnce([[{ is_active: 1 }]]); // A lekérdezés alapján aktív a fiók

            const res = await request(app).post('/api/newsletter/subscribe').send({ email: 'aktiv@test.com' });

            expect(res.status).toBe(409);
            expect(res.body).toEqual({ error: 'Ezzel az e-mail címmel már feliratkoztak.' });
            expect(sendEmail).not.toHaveBeenCalled(); // Nincs email küldés
        });
    });

    describe('GET /api/newsletter/status/:email', () => {
        it('Helyesen kell visszaadnia a feliratkozási státuszt (true / false)', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Első lekérés: van találat
            const res1 = await request(app).get('/api/newsletter/status/letezo@test.com');
            expect(res1.body).toEqual({ isSubscribed: true });

            db.query.mockResolvedValueOnce([[]]); // Második lekérés: üres találat
            const res2 = await request(app).get('/api/newsletter/status/nincs_feliratkozva@test.com');
            expect(res2.body).toEqual({ isSubscribed: false });
        });
    });
});