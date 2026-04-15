const mysql = require('mysql2');
require('dotenv').config();

// MySQL adatbázis kapcsolatkészlet létrehozása a környezeti változók alapján
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'artisticeye_user',
    password: process.env.DB_PASSWORD || 'strongpassword123',
    database: process.env.DB_NAME || 'artisticeye_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Kezdeti kapcsolat ellenőrzése az adatbázissal a szerver indulásakor
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Adatbázis indítása folyamatban vagy hiba történt. Kérlek várj.');
    } else {
        console.log('Sikeresen csatlakozva a MySQL adatbázishoz.');
        connection.release();
    }
});

module.exports = pool.promise();