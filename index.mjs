import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
//for Express to get values using the POST method
app.use(express.urlencoded({extended:true}));
//setting up database connection pool, replace values in red
const pool = mysql.createPool({
    host: "nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "qqv6hy4j7rbddqyl",
    password: "aad3igcuqf1bev1c",
    database: "knpq9kqfuqvfgfvz",
    connectionLimit: 10,
    waitForConnections: true
});

app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
//   cookie: { secure: true }
}))
//routes
app.get('/', (req, res) => {
   res.render('login.ejs')
});


app.post('/loginProcess', async (req, res) => {
    let { username, password } = req.body;
    let foundUser = null;
    let role = null;

    //Check admin table first
    const [adminRows] = await pool.query(
        `SELECT * FROM admin WHERE username = ?`, [username]
    );

    if (adminRows.length > 0) {
        const match = await bcrypt.compare(password, adminRows[0].password);
        if (match) {
            foundUser = adminRows[0];
            role = 'admin';
        }
    }

    //If not an admin, check user table
    if (!foundUser) {
        const [userRows] = await pool.query(
            `SELECT * FROM user WHERE username = ?`, [username]
        );

        if (userRows.length > 0) {
            const match = await bcrypt.compare(password, userRows[0].password);
            if (match) {
                foundUser = userRows[0];
                role = 'user';
            }
        }
    }
    // Handles result
    if (foundUser) {
        req.session.authenticated = true;
        req.session.role = role;  // <-- 'admin' or 'user'
        req.session.fullName = foundUser.firstName + " " + foundUser.lastName;
        res.render('home.ejs', { fullName: req.session.fullName, role });
    } else {
        let loginError = "Wrong Credentials! Try again!";
        res.render('login.ejs', { loginError });
    }
});



app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest
app.listen(3000, ()=>{
    console.log("Express server running")
})