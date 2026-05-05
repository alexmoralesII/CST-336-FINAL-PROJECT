  /**
   * routes/user.mjs
   * Protected user routes – profile viewing and favorites management.
   * Mounted at /user with isUserAuthenticated in index.mjs.
   */

  import express from 'express';
  import bcrypt  from 'bcrypt';
  import { pool } from '../config/db.js';
  import { isUserAuthenticated } from '../middleware/isAuthenticated.mjs';
  const router = express.Router();

  // ── GET /user/profile ─────────────────────────────────────────────────────────
 router.get('/profile', isUserAuthenticated, (req, res) => {
  res.render('profile.ejs', { error: null, success: null, user: { username: req.session.username } });
});

  // ── POST /user/profile ────────────────────────────────────────────────────────
  router.post('/profile', async (req, res) => {
    const { current_password, new_password } = req.body;

    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE userId = ?', [req.session.userId]
      );
      const user = rows[0];

      if (new_password) {
        const match = await bcrypt.compare(current_password, user.password);
        if (!match) {
          return res.render('profile.ejs', {
            user, error: 'Current password is incorrect.', success: null
          });
        }
        const hashed = await bcrypt.hash(new_password, 10);
        await pool.query(
          'UPDATE users SET password = ? WHERE userId = ?',
          [hashed, req.session.userId]
        );
      }

      res.render('profile.ejs', { user, error: null, success: 'Profile updated!' });
    } catch (err) {
      console.error('Profile update error:', err);
      res.status(500).render('error.ejs', { message: 'Could not update profile.' });
    }
  });

  // ── GET /user/favorites ───────────────────────────────────────────────────────
  router.get('/favorites', async (req, res) => {
    try {
      const [favorites] = await pool.query(
        'SELECT fav_songId, songTitle, artistName FROM favorite_songs WHERE userId = ?',
        [req.session.userId]
      );
      const [favArtists] = await pool.query(
        'SELECT fav_artistId, artistName, artistImgUrl FROM favorite_artist WHERE userId = ?',
        [req.session.userId]
      );
      const [favConcerts] = await pool.query(
        'SELECT fav_concertId, artistName, eventTitle, concertDate, venueName, city, country FROM favorite_concerts WHERE userId = ?',
        [req.session.userId]
      );
      res.render('favorites.ejs', { favorites, favArtists, favConcerts });
    } catch (err) {
      console.error('Favorites fetch error:', err);
      res.status(500).render('error.ejs', { message: 'Could not load favorites.' });
    }
  });

  // ── DELETE /user/favorites/:id ────────────────────────────────────────────────
  router.post('/favorites/delete/:id', async (req, res) => {
    try {
      await pool.query(
        'DELETE FROM favorites WHERE id = ? AND user_id = ?',
        [req.params.id, req.session.userId]
      );
      res.redirect('/user/favorites');
    } catch (err) {
      console.error('Favorites delete error:', err);
      res.status(500).render('error.ejs', { message: 'Could not delete favorite.' });
    }
  });

// ── GET /user/settings ────────────────────────────────────────────────────────
  router.get('/settings', isUserAuthenticated, (req, res) => {
    res.render('settings.ejs', { error: null, success: null });
  });

  // ── POST /user/settings ───────────────────────────────────────────────────────
  router.post('/settings', isUserAuthenticated, async (req, res) => {
    const { current_password, new_password } = req.body;
    try {
      const [rows] = await pool.query(
        'SELECT * FROM user WHERE userId = ?', [req.session.userId]
      );
      const user = rows[0];
      const match = await bcrypt.compare(current_password, user.password);
      if (!match) {
        return res.render('settings.ejs', { error: 'Current password is incorrect.', success: null });
      }
      const hashed = await bcrypt.hash(new_password, 10);
      await pool.query(
        'UPDATE user SET password = ? WHERE userId = ?',
        [hashed, req.session.userId]
      );
      res.render('settings.ejs', { error: null, success: 'Password updated!' });
    } catch (err) {
      console.error('Settings error:', err);
      res.status(500).render('error.ejs', { message: 'Could not update password.' });
    }
  });


  export default router;