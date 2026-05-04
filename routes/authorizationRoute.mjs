import express from 'express';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import {isUserAuthenticated} from '../middleware/isAuthenticated.mjs';
import {pool} from '../config/db.js';



const router = express.Router();

router.get('/', (req, res) => {
   res.render('login.ejs')
});

// router.get('/profile', isUserAuthenticated, (req, res) => {
//   res.render('profile.ejs')
// });

// router.get('/settings', isUserAuthenticated,  (req, res) => {
//   res.render("settings.ejs")
// });

router.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect("/");
});

//route that checks username and password
router.post('/loginProcess', async (req, res) => {
   let {username, password} = req.body;
   console.log(username + ": " + password);

   let hashedPassword = "";

   let sql = `SELECT *
              FROM admin
              WHERE username = ?`;
   const [rows] = await pool.query(sql, [username]);

   if (rows.length > 0) { //username was found in the database
       hashedPassword = rows[0].password;
   }
 
   const match = await bcrypt.compare(password, hashedPassword);

   if (match) {
     req.session.authenticated = true;
     req.session.fullName = rows[0].firstName + " " + rows[0].lastName;
     res.render('Welcome.ejs', {"fullName":req.session.fullName});
   } else {
     let loginError = "Wrong Credentials! Try again!"
     res.render('login.ejs', {loginError});
   }
});

export default router;