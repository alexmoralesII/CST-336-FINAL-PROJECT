/**
 * routes/artist.mjs
 * Artist search and lyrics lookup via api.lyrics.ovh.
 * Mounted at /artist in index.mjs.
 */

import express from 'express';
import { pool } from '../index.mjs';

const router = express.Router();

// ── GET /artist ───────────────────────────────────────────────────────────────
// Default view – no search yet
router.get('/', (req, res) => {
  res.render('artist.ejs', {
    songs:   null,
    lyrics:  null,
    artist:  null,
    song:    null,
    error:   null
  });
});

// ── GET /artist/search?artist=<name> ─────────────────────────────────────────
// Returns a list of songs by the artist via lyrics.ovh suggest API
router.get('/search', async (req, res) => {
  const { artist } = req.query;

  if (!artist || !artist.trim()) {
    return res.render('artist.ejs', {
      songs: [], lyrics: null, artist: '', song: null, error: 'Please enter an artist name.'
    });
  }

  try {
    const suggestResponse = await fetch(
      `https://api.lyrics.ovh/suggest/${encodeURIComponent(artist)}`
    );
    const suggestData = await suggestResponse.json();

    res.render('artist.ejs', {
      songs:  suggestData.data || [],
      lyrics: null,
      artist,
      song:   null,
      error:  null
    });
  } catch (err) {
    console.error('Artist search error:', err);
    res.render('artist.ejs', {
      songs: [], lyrics: null, artist, song: null, error: 'Could not reach lyrics API.'
    });
  }
});

// ── GET /artist/lyrics?artist=<name>&song=<title> ────────────────────────────
// Fetches the full lyrics for a given artist + song title
router.get('/lyrics', async (req, res) => {
  const { artist, song } = req.query;

  if (!artist || !song) {
    return res.render('artist.ejs', {
      songs: null, lyrics: null, artist, song, error: 'Artist and song are required.'
    });
  }

  try {
    const lyricsResponse = await fetch(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(song)}`
    );
    const lyricsData = await lyricsResponse.json();

    res.render('artist.ejs', {
      songs:  null,
      lyrics: lyricsData.lyrics || 'Lyrics not found.',
      artist,
      song,
      error:  null
    });
  } catch (err) {
    console.error('Lyrics fetch error:', err);
    res.render('artist.ejs', {
      songs: null, lyrics: null, artist, song, error: 'Could not fetch lyrics.'
    });
  }
});

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
