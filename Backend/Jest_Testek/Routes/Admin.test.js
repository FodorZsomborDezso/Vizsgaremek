const request = require('supertest');
const express = require('express');
const adminRoutes = require('../../Routes/Admin');
const db = require('../../db');
const fs = require('fs');
const sendEmail = require('../../Utils/sendEmail');

// Függőségek mockolása
jest.mock('../../db', () => ({
    query: jest.fn()
}));
jest.mock('fs');
jest.mock('../../Utils/sendEmail');
jest.mock('../../Middlewares/Auth', () => ({
    authenticateToken: (req, res, next) => {
        req.user = { id: 1, role: 'admin', username: 'adminTest' };
        next();
    },
    isAdmin: (req, res, next) => next(),
}));

// Express app felépítése a teszteléshez
const app = express();
app.use(express.json());
app.use('/api/admin', adminRoutes);

describe('Admin Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Minden teszt előtt töröljük a mockok előzményeit
    });

    describe('GET /api/admin/users', () => {
        it('Sikeresen le kell kérnie az összes felhasználót', async () => {
            const mockUsers = [
                { id: 1, username: 'user1', email: 'user1@test.com', role: 'user', created_at: '2024-01-01' },
                { id: 2, username: 'admin1', email: 'admin1@test.com', role: 'admin', created_at: '2024-01-02' }
            ];
            db.query.mockResolvedValue([mockUsers]);

            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUsers);
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, username, email, role, created_at FROM users'));
        });

        it('500-as hibát kell dobnia adatbázis hiba esetén', async () => {
            db.query.mockRejectedValue(new Error('DB hiba'));

            const response = await request(app).get('/api/admin/users');

            expect(response.status).toBe(500);
            expect(response.body).toEqual({ error: 'Szerverhiba a felhasználók lekérésekor.' });
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        it('Sikeresen törölnie kell a felhasználót és a hozzá tartozó avatart (ha létezik)', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockReturnValue(true);
            db.query.mockResolvedValue([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/admin/users/123');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Felhasználó sikeresen törölve.' });
            
            // Ellenőrizzük, hogy meghívta-e a fájl törlő metódust és a jó DB lekérdezést
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(db.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['123']);
        });
    });

    describe('PUT /api/admin/users/:id/role', () => {
        it('Sikeresen módosítania kell a felhasználó jogosultságát adminra', async () => {
            db.query.mockResolvedValue([{ affectedRows: 1 }]);

            const response = await request(app)
                .put('/api/admin/users/123/role')
                .send({ role: 'admin' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Jogosultság sikeresen módosítva.' });
            expect(db.query).toHaveBeenCalledWith('UPDATE users SET role = ? WHERE id = ?', ['admin', '123']);
        });

        it('400-as hibát kell adnia érvénytelen szerepkör esetén', async () => {
            const response = await request(app)
                .put('/api/admin/users/123/role')
                .send({ role: 'user' }); // A kódban csak az 'admin' a valid

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'Érvénytelen szerepkör.' });
            expect(db.query).not.toHaveBeenCalled();
        });
    });

    describe('POST /api/admin/send-newsletter', () => {
        it('Sikeresen ki kell küldenie a hírlevelet az aktív feliratkozóknak', async () => {
            const mockSubscribers = [{ email: 'sub1@test.com' }, { email: 'sub2@test.com' }];
            db.query.mockResolvedValue([mockSubscribers]);
            sendEmail.mockResolvedValue(true);

            const response = await request(app)
                .post('/api/admin/send-newsletter')
                .send({ subject: 'Teszt Tárgy', content: 'Teszt Tartalom' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Hírlevél sikeresen elküldve 2 feliratkozónak.' });
            expect(sendEmail).toHaveBeenCalledTimes(2);
        });

        it('400-as hibát kell adnia, ha hiányzik a tárgy vagy a tartalom', async () => {
            const response = await request(app)
                .post('/api/admin/send-newsletter')
                .send({ subject: 'Csak Tárgy van' }); // Hiányzik a content

            expect(response.status).toBe(400);
            expect(response.body).toEqual({ error: 'A tárgy és a tartalom megadása kötelező.' });
            expect(db.query).not.toHaveBeenCalled();
        });

        it('404-es hibát kell adnia, ha nincsenek aktív feliratkozók', async () => {
            db.query.mockResolvedValue([[]]); // Üres tömböt ad vissza az adatbázis

            const response = await request(app)
                .post('/api/admin/send-newsletter')
                .send({ subject: 'Teszt Tárgy', content: 'Teszt Tartalom' });

            expect(response.status).toBe(404);
            expect(response.body).toEqual({ error: 'Nincsenek aktív feliratkozók.' });
            expect(sendEmail).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/admin/posts/:id', () => {
        it('Sikeresen törölnie kell a posztot és a hozzá tartozó helyi képet (ha létezik)', async () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockReturnValue(true);
            db.query.mockResolvedValue([{ affectedRows: 1 }]);

            const response = await request(app).delete('/api/admin/posts/456');

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Poszt sikeresen törölve.' });
            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(db.query).toHaveBeenCalledWith('DELETE FROM posts WHERE id = ?', ['456']);
        });
    });

    describe('GET /api/admin/reports', () => {
        it('Sikeresen le kell kérnie a bejelentéseket és formáznia kell a BLOB képeket', async () => {
            const mockReports = [
                { id: 1, target_type: 'post', target_id: 10, post_image: 'BLOB', reason: 'Spam' },
                { id: 2, target_type: 'comment', target_id: 20, post_image: null, reason: 'Inappropriate' }
            ];
            db.query.mockResolvedValue([mockReports]);

            const response = await request(app).get('/api/admin/reports');

            expect(response.status).toBe(200);
            // Ellenőrizzük, hogy a BLOB lecserélődött-e a megfelelő URL-re
            expect(response.body[0].post_image).toBe('http://localhost:3000/api/posts/10/image');
            expect(response.body[1].post_image).toBeNull();
        });
    });

    describe('DELETE /api/admin/reports/:id', () => {
        it('Sikeresen törölnie kell a bejelentést', async () => {
            db.query.mockResolvedValue([{ affectedRows: 1 }]);
            const response = await request(app).delete('/api/admin/reports/1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Bejelentés lezárva és törölve.' });
        });
    });

    describe('DELETE /api/admin/comments/:id', () => {
        it('Sikeresen törölnie kell a kommentet', async () => {
            db.query.mockResolvedValue([{ affectedRows: 1 }]);
            const response = await request(app).delete('/api/admin/comments/1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Komment sikeresen törölve.' });
        });
    });

    describe('GET /api/admin/feedbacks', () => {
        it('Sikeresen le kell kérnie a visszajelzéseket', async () => {
            const mockFeedbacks = [{ id: 1, message: 'Jó az oldal!', username: 'user1' }];
            db.query.mockResolvedValue([mockFeedbacks]);
            const response = await request(app).get('/api/admin/feedbacks');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockFeedbacks);
        });
    });

    describe('DELETE /api/admin/feedbacks/:id', () => {
        it('Sikeresen törölnie kell a visszajelzést', async () => {
            db.query.mockResolvedValue([{ affectedRows: 1 }]);
            const response = await request(app).delete('/api/admin/feedbacks/1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Visszajelzés sikeresen törölve.' });
        });
    });

    describe('GET /api/admin/newsletter-content', () => {
        it('Sikeresen le kell kérnie a legutóbbi hírlevél tartalmát', async () => {
            db.query.mockResolvedValue([[{ content: 'Legújabb híreink...' }]]);
            const response = await request(app).get('/api/admin/newsletter-content');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ content: 'Legújabb híreink...' });
        });

        it('Üres stringet kell visszaadnia, ha még nincs egyetlen hírlevél tartalom sem', async () => {
            db.query.mockResolvedValue([[]]); // Üres eredményhalmaz
            const response = await request(app).get('/api/admin/newsletter-content');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ content: '' });
        });
    });

    describe('POST /api/admin/newsletter-content', () => {
        it('Sikeresen el kell mentenie az új hírlevél tartalmát', async () => {
            db.query.mockResolvedValue([{ insertId: 1 }]);
            const response = await request(app)
                .post('/api/admin/newsletter-content')
                .send({ content: 'Új teszt hírlevél tartalom' });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ message: 'Hírlevél tartalom sikeresen frissítve.' });
            expect(db.query).toHaveBeenCalledWith('INSERT INTO newsletter_content (content) VALUES (?)', ['Új teszt hírlevél tartalom']);
        });
    });
});