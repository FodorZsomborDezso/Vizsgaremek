const request = require('supertest');
const express = require('express');
const authRoutes = require('../../Routes/Auth');
const db = require('../../db');
const sendEmail = require('../../Utils/sendEmail');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Függőségek mockolása
jest.mock('../../db', () => ({
    query: jest.fn()
}));
jest.mock('../../Utils/sendEmail');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('dotenv', () => ({ config: jest.fn() }));

// Fájlrendszer és képméretező (Sharp) mockolása
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

// A Multer (Helpers.upload) middleware mockolása, hogy a JSON kérések átmenjenek rajta hiba nélkül
jest.mock('../../Utils/Helpers', () => ({
    upload: {
        single: () => (req, res, next) => next()
    }
}));

// Express app felépítése a teszteléshez
const app = express();
app.use(express.json());
app.use('/api', authRoutes); // Az útvonalakat /api alá fűzzük be

describe('Auth Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Minden teszt előtt tiszta lappal indulunk
    });

    describe('POST /api/forgot-password', () => {
        it('Sikeresen el kell küldenie a visszaállító kódot', async () => {
            db.query
                .mockResolvedValueOnce([[{ id: 1, email: 'test@test.com' }]]) // SELECT eredménye
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE eredménye
            sendEmail.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/forgot-password')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'A 6 jegyű kódot elküldtük az e-mail címedre.' });
            expect(sendEmail).toHaveBeenCalled();
        });

        it('404 hibát kell adnia, ha nem létezik a megadott e-mail cím', async () => {
            db.query.mockResolvedValueOnce([[]]); // Nem talál felhasználót

            const res = await request(app)
                .post('/api/forgot-password')
                .send({ email: 'notfound@test.com' });

            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Nincs ilyen fiók.' });
            expect(sendEmail).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/verify-reset-code', () => {
        it('200-as státuszt kell adnia helyes e-mail és kód esetén', async () => {
            db.query.mockResolvedValue([[{ id: 1, email: 'test@test.com' }]]);

            const res = await request(app)
                .post('/api/verify-reset-code')
                .send({ email: 'test@test.com', code: '123456' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Helyes kód.' });
        });

        it('400-as hibát kell adnia helytelen vagy lejárt kód esetén', async () => {
            db.query.mockResolvedValue([[]]); // Üres eredmény (nincs találat)

            const res = await request(app)
                .post('/api/verify-reset-code')
                .send({ email: 'test@test.com', code: 'rosszkód' });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Helytelen vagy lejárt kód.' });
        });
    });

    describe('POST /api/reset-password', () => {
        it('Sikeresen meg kell változtatnia a jelszót', async () => {
            db.query
                .mockResolvedValueOnce([[{ id: 1 }]]) // Keresés eredménye
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // Frissítés eredménye
            bcrypt.hash.mockResolvedValue('uj_titkositott_jelszo');

            const res = await request(app)
                .post('/api/reset-password')
                .send({ token: '123456', newPassword: 'NewPassword123' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'A jelszó sikeresen megváltozott.' });
            expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123', 10);
        });
    });

    describe('POST /api/auth/register', () => {
        it('Sikeresen regisztrálnia kell az új felhasználót', async () => {
            db.query
                .mockResolvedValueOnce([[]]) // Nincs még ilyen felhasználó
                .mockResolvedValueOnce([{ insertId: 99 }]); // INSERT sikeres
            bcrypt.hash.mockResolvedValue('titkositott_jelszo');
            bcrypt.genSalt.mockResolvedValue('so_ertek');
            sendEmail.mockResolvedValue(true);

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'password123'
                });

            expect(res.status).toBe(201);
            expect(res.body).toEqual({ message: 'Sikeres regisztráció. Elküldtünk egy megerősítő linket az e-mail címedre.' });
            expect(db.query).toHaveBeenCalledTimes(2);
            expect(sendEmail).toHaveBeenCalled();
        });

        it('400-as hibát kell dobnia, ha hiányoznak a kötelező mezők', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser' }); // Hiányzik az email és jelszó

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Minden kötelező mező kitöltése szükséges.' });
            expect(db.query).not.toHaveBeenCalled();
        });

        it('409-es hibát kell dobnia, ha az e-mail cím már regisztrált, de nincs megerősítve', async () => {
            db.query.mockResolvedValue([[{ id: 1, is_verified: 0 }]]); // Létező, nem megerősített fiók

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', email: 'letezo@test.com', password: 'pwd' });

            expect(res.status).toBe(409);
            expect(res.body.error).toContain('már regisztrálva van, de még nincs megerősítve');
        });
    });

    describe('POST /api/auth/login', () => {
        it('Sikeres belépés esetén JWT tokent és user adatokat kell visszaadnia', async () => {
            const mockUser = { id: 1, username: 'testuser', email: 't@t.com', role: 'user', is_verified: 1, password_hash: 'hashed_pw', avatar_url: 'url' };
            
            db.query.mockResolvedValue([[mockUser]]);
            bcrypt.compare.mockResolvedValue(true); // Jelszó egyezik
            jwt.sign.mockReturnValue('teszt_jwt_token_123'); // Token generálva

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 't@t.com', password: 'jo_jelszo' });

            expect(res.status).toBe(200);
            expect(res.body.token).toBe('teszt_jwt_token_123');
            expect(res.body.user.username).toBe('testuser');
            expect(jwt.sign).toHaveBeenCalled();
        });

        it('403-as hibát kell adnia, ha a felhasználó e-mail címe nincs megerősítve', async () => {
            db.query.mockResolvedValue([[{ id: 1, is_verified: 0 }]]); // is_verified = 0

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nem_megerositett@test.com', password: 'pwd' });

            expect(res.status).toBe(403);
            expect(res.body.errorCode).toBe('ACCOUNT_NOT_VERIFIED');
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('400-as hibát kell adnia rossz jelszó esetén', async () => {
            db.query.mockResolvedValue([[{ id: 1, is_verified: 1, password_hash: 'hashed_pw' }]]);
            bcrypt.compare.mockResolvedValue(false); // Hibás jelszó szimulálása

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 't@t.com', password: 'rossz_jelszo' });

            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Hibás e-mail cím vagy jelszó.' });
        });
    });

    describe('POST /api/auth/resend-verification', () => {
        it('Sikeresen újra kell küldenie a megerősítő e-mailt', async () => {
            db.query.mockResolvedValueOnce([[{ id: 1, is_verified: 0, email: 't@t.com' }]]);
            sendEmail.mockResolvedValue(true);

            const res = await request(app).post('/api/auth/resend-verification').send({ email: 't@t.com' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'A megerősítő e-mailt sikeresen újra elküldtük.' });
            expect(sendEmail).toHaveBeenCalled();
        });
    });
});