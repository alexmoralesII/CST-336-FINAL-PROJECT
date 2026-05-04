/**
 * routes/artist.mjs
 * Artist search and lyrics lookup via api.lyrics.ovh.
 * Mounted at /artist in index.mjs.
 */

import express from 'express';
import { pool } from '../config/db.js';

const router = express.Router();

// ── POST /artist/favorite ─────────────────────────────────────────────────────
// Save a favorite song to the DB (requires login)
router.post('/favorite', async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ success: false, message: 'Not logged in.' });
  }

  const { artist, song } = req.body;
  if (!artist || !song) {
    return res.status(400).json({ success: false, message: 'Artist and song required.' });
  }

  try {
    await pool.query(
      'INSERT INTO favorite_songs (userId, songTitle, artistName) VALUES (?, ?, ?)',
      [req.session.userId, song, artist]
    );
    res.json({ success: true, message: 'Song saved to favorites.' });
  } catch (err) {
    console.error('Favorite insert error:', err);
    res.status(500).json({ success: false, message: 'Could not save favorite.' });
  }
});

export default router;
