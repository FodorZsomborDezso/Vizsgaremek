require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./Routes/Auth');
const userRoutes = require('./Routes/Users');
const contentRoutes = require('./Routes/Content');
const adminRoutes = require('./Routes/Admin');
const newsletterRoutes = require('./Routes/Newsletter');

const app = express();
const PORT = process.env.PORT || 3000;

// Alapvető middleware-ek és statikus mappák beállítása
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// API útvonalak regisztrálása a megfelelő végpontokhoz
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', contentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/newsletter', newsletterRoutes);

// Express szerver elindítása a megadott porton
app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});