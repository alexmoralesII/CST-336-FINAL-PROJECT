import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
import { isUserAuthenticated } from './middleware/isAuthenticated.mjs'
import { getFullName } from './middleware/fullName.mjs';


const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({ extended: true }));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: "knpq9kqfuqvfgfvz",
    connectionLimit: 10,
    waitForConnections: true
});

//setting sessions
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
//   cookie: { secure: true }
}))

//routes
app.get("/", authRoutes);




//middleware used by ALL routes
app.use(getFullName);


app.get('/artist', (req, res) => {
    res.render('artist.ejs', { songs: null, lyrics: null, artist: null, song: null });
});

app.get('/artist/search', async (req, res) => {
    let artist = req.query.artist;
    let suggestResponse = await fetch(`https://api.lyrics.ovh/suggest/${artist}`);
    let suggestData = await suggestResponse.json();
    res.render('artist.ejs', {
        songs: suggestData.data || [],
        lyrics: null,
        artist,
        song: null
    });
});

app.get('/artist/lyrics', async (req, res) => {
    let { artist, song } = req.query;
    let lyricsResponse = await fetch(`https://api.lyrics.ovh/v1/${artist}/${song}`);
    let lyricsData = await lyricsResponse.json();
    res.render('artist.ejs', {
        songs: null,
        lyrics: lyricsData.lyrics || 'Lyrics not found.',
        artist,
        song
    });
});


app.get('/events', (req, res) => {
    res.render('events.ejs', { events: null });
});

app.get('/events/search', async (req, res) => {
    let artist = req.query.artist;
    let eventsResponse = await fetch(`https://api.data.jambase.com/v3/events?artistName=${artist}`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer jbd_trial_QO1jj40lI3Wj_eDrpOVafFa1ulZ5Rr4G3mfh33ZE7QExM",
            "Accept": "application/json",
            "User-Agent": "JamBaseData-Sandbox/1.0"
        }
    });
    let eventsData = await eventsResponse.json();
    res.render('events.ejs', { events: eventsData.events || [], artist });
});

app.get("/dbTest", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, () => {
    console.log("Express server running")
})