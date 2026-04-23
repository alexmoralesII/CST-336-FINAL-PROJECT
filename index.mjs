import express from 'express';
import mysql from 'mysql2/promise';
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
//routes
app.get('/', (req, res) => {
   res.render('login.ejs')
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