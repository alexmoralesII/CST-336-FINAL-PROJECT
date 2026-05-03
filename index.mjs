import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { isUserAuthenticated } from './middleware/isAuthenticated.mjs';
import { getFullName } from './middleware/fullName.mjs';

// ─── Route modules ────────────────────────────────────────────────────────────
import authRoutes   from './routes/auth.mjs';
import artistRoutes from './routes/artist.mjs';
import userRoutes   from './routes/user.mjs';

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── View engine ──────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');

// ─── Static assets ────────────────────────────────────────────────────────────
app.use(express.static('public'));

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,          // set true when behind HTTPS
    maxAge: 1000 * 60 * 60  // 1 hour
  }
}));

// ─── Database pool ────────────────────────────────────────────────────────────
export const pool = mysql.createPool({
  host:            process.env.DB_HOST     || 'nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
  user:            process.env.DB_USERNAME,
  password:        process.env.DB_PWD,
  database:        process.env.DB_NAME     || 'knpq9kqfuqvfgfvz',
  connectionLimit: 10,
  waitForConnections: true
});

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(getFullName);   // attaches res.locals.fullName to every request

// ─── Routes ───────────────────────────────────────────────────────────────────

// Public landing / login page
app.get('/', (req, res) => res.render('login.ejs'));

// Auth  → /register  /login  /logout
app.use('/', authRoutes);

// Artist / lyrics search  → /artist  /artist/search  /artist/lyrics
app.use('/artist', artistRoutes);

// User profile / favourites (protected)  → /user/profile  /user/favorites
app.use('/user', isUserAuthenticated, userRoutes);

// ─── DB health-check ──────────────────────────────────────────────────────────
app.get('/dbTest', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT CURDATE() AS today');
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Database error!');
  }
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).render('404.ejs'));

// ─── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).render('error.ejs', { message: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Express server running on port ${PORT}`));
