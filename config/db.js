import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
    host: "nwhazdrp7hdpd4a4.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PWD,
    database: "knpq9kqfuqvfgfvz",
    connectionLimit: 10,
    waitForConnections: true
});