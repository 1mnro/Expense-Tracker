// Expense Tracker - backend (Express API + PostgreSQL)
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

require("dotenv").config();
const { Pool } = require("pg");
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// first required ENDPOINT: GET /api/expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date
             FROM expenses ORDER BY date, id`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

//second required ENDPOINT GET /api/expenses/:id
app.get("/api/expenses/:id", async (req, res) => {
  const id = req.params.id;
  if (isNaN(id)) {
    return res.status(404).json({ message: "ID must be a number" });
  }

  try {
    const result = await pool.query("SELECT id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date FROM expenses WHERE id = $1 ORDER BY date, id", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Expense with this ID was not found." });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

//third required ENDPOINT POST /api/expenses
const ValidCategories = [
  "Food",
  "Transport",
  "Bills",
  "Entertainment",
  "Other",
];

app.post("/api/expenses", async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "title is required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "amount must be a number greater than 0" });
  }

  if (!ValidCategories.includes(category)) {
    return res.status(400).json({
      message: `category must be one of: ${ValidCategories.join(", ")}`,
    });
  }

  if (!date) {
    return res.status(400).json({ message: "date is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), amount, category, date],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Something went wrong!" });
  }
});

//Fourth required ENDPOINT PUT /api/expenses/:id
app.put('/api/expenses/:id', async (req, res)=>{
    const {id} = req.params;
    const {title, amount, category, date} = req.body;
    
    if (isNaN(id)){
        return res.status(404).json({message: 'id must be a number'});
    }
    
    if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ message: "title is required" });
  }

  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ message: "amount must be a number greater than 0" });
  }

  if (!ValidCategories.includes(category)) {
    return res.status(400).json({
      message: `category must be one of: ${ValidCategories.join(", ")}`,
    });
  }

  if (!date) {
    return res.status(400).json({ message: "date is required" });
  }

  try {
    const result = await pool.query(
        `UPDATE expenses
         SET title = $1, amount = $2, category = $3, date = $4
         WHERE id = $5
         RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date`,
         [title.trim(), amount, category, date, id]
    );

    if (result.rows.length === 0){
        return res.status(404).json({message: 'expense was not found'});
    }

    res.status(200).json(result.rows[0]);

  }
  catch(err){
    console.error(err);
    res.status(500).json({message:'Something went wrong!'});
  }

});

//Fifth required ENDPOINT DELETE /api/expenses/:id
app.delete('/api/expenses/:id', async (req, res)=>{
    const {id} = req.params;
    if (isNaN(id)){
        return res.status(404).json({message: 'id must be a number'});
    }
    
    try{
        const result = await pool.query(
            `DELETE FROM expenses WHERE id = $1 RETURNING id, title, amount::float8, category, to_char(date, 'YYYY-MM-DD') AS date`, [id]
        );

        if (result.rows.length === 0){
            return res.status(404).json({message: 'expense was not found'});
        }

        res.status(200).json({message: 'expense deleted', expense: result.rows[0]});
    }
    catch(err){
        console.error(err);
        res.status(500).json({message: 'Something went wrong!'});
    }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
