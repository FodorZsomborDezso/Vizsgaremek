const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'szuper_titkos_vizsgaremek_kulcs_2024';

// JWT token ellenőrzése és a felhasználó azonosítása a kérés fejlécéből
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Nincs bejelentkezve.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Érvénytelen token.' });
        }
        
        req.user = user;
        next(); 
    });
}

// Felhasználó adminisztrátori jogosultságának adatbázis szintű ellenőrzése
async function isAdmin(req, res, next) {
    try {
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ error: 'Nincs admin jogosultságod ehhez a művelethez.' });
        }
        
        next(); 
    } catch (err) {
        res.status(500).json({ error: 'Szerverhiba az engedélyek ellenőrzésekor.' });
    }
}

module.exports = { authenticateToken, isAdmin, JWT_SECRET };