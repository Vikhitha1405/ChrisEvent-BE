const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // IMPORTANT: allows reading req.body

// MySQL connection
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// Insert login details into DB
app.post('/login', (req, res) => {

    const sql = "INSERT INTO login (name, password) VALUES (?)";
    const values = [
        req.body.name,
        req.body.password
    ];

    db.query(sql, [values], (err, result) => {
        if (err) {
            console.log(err);
            return res.json("Error saving data");
        }
        return res.json("Data Saved Successfully");
    });
});
app.post('/submit_answers', (req, res) => {

    const { username, answers: answersData } = req.body; 

 
    if (!username || !answersData || !Array.isArray(answersData)) {
        return res.status(400).json({ success: false, message: "Missing username or answers data." });
    }

   
    const valuesWithUsername = answersData.map(row => {
        const [question_no, answer] = row; // row is [question_no, answer]
        // Insert the username value first
        return [username, question_no, answer]; 
    });

   
    const sql = "INSERT INTO tbl_questions (user_name, question_no, answer) VALUES ?";

    db.query(sql, [valuesWithUsername], (err, result) => {
        if (err) {
            console.error("Database error during batch insert:", err);
            return res.status(500).json({ success: false, message: "Error saving answers to the database." });
        }
        return res.json({ success: true, message: `Successfully saved ${result.affectedRows} answers for user ${username}.` });
    });
});


app.listen(8081, () => {
    console.log("Server running on port 8081");
});
