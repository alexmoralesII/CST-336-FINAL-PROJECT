import express from 'express';
import 'dotenv/config';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { isUserAuthenticated } from './middleware/isAuthenticated.mjs';
import { getFullName } from './middleware/fullName.mjs';
import { pool } from './config/db.js';

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


//setting sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }
}))

//routes
app.use("/", authRoutes);




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
