const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
  } else {
    console.log(
      "🚀 Growssify Database Connected Successfully at:",
      res.rows[0].now,
    );
  }
});

app.get("/", (req, res) => {
  res.send("Growssify API is live and breathing...");
});

app.listen(PORT, () => {
  console.log(`Backend server is spinning on port ${PORT}`);
});
