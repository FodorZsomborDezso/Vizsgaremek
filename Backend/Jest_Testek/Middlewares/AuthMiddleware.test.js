const jwt = require('jsonwebtoken');
const db = require('../../db');
const { authenticateToken, isAdmin } = require('../../Middlewares/Auth');

// Függőségek mockolása
jest.mock('jsonwebtoken');
jest.mock('../../db', () => ({
    query: jest.fn()
}));

describe('Auth Middleware', () => {
    let req, res, next;

    // Minden teszt előtt alaphelyzetbe állítjuk az Express objektumokat
    beforeEach(() => {
        req = {
            headers: {},
            user: {} // a tokenből dekódolt adatokat ide várjuk
        };
        res = {
            status: jest.fn().mockReturnThis(), // Láncolhatóvá tesszük: res.status().json()
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticateToken()', () => {
        it('401-es hibát kell adnia, ha nincs megadva token a fejlécben', () => {
            authenticateToken(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nincs bejelentkezve.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('403-as hibát kell adnia, ha a token érvénytelen vagy lejárt', () => {
            req.headers['authorization'] = 'Bearer hibas_token_123';
            // Szimuláljuk, hogy a jwt.verify hibát dob a callbackben
            jwt.verify.mockImplementation((token, secret, callback) => callback(new Error('Invalid token'), null));

            authenticateToken(req, res, next);
            
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Érvénytelen token.' });
            expect(next).not.toHaveBeenCalled();
        });

        it('Tovább kell engednie (next) és beállítania a req.user-t egy helyes token esetén', () => {
            req.headers['authorization'] = 'Bearer jo_token_123';
            const mockUser = { id: 1, username: 'tesztUser' };
            // Szimuláljuk a sikeres dekódolást
            jwt.verify.mockImplementation((token, secret, callback) => callback(null, mockUser));

            authenticateToken(req, res, next);
            
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled(); // Átengedte a kérést
        });
    });

    describe('isAdmin()', () => {
        it('403-as hibát kell adnia, ha a felhasználó jogosultsága nem admin (pl. user)', async () => {
            req.user = { id: 1 };
            db.query.mockResolvedValue([[{ role: 'user' }]]); // Az adatbázis 'user' szerepkört ad vissza

            await isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nincs admin jogosultságod ehhez a művelethez.' });
        });

        it('Tovább kell engednie (next), ha az adatbázis szerint a felhasználó admin', async () => {
            req.user = { id: 1 };
            db.query.mockResolvedValue([[{ role: 'admin' }]]);

            await isAdmin(req, res, next);
            expect(next).toHaveBeenCalled(); // Sikeres volt
        });

        it('500-as hibát kell adnia, ha megszakad az adatbázis kapcsolat', async () => {
            req.user = { id: 1 };
            db.query.mockRejectedValue(new Error('Adatbázis hiba'));

            await isAdmin(req, res, next);
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Szerverhiba az engedélyek ellenőrzésekor.' });
        });
    });
});