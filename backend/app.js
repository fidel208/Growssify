require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const financeRoutes = require("./routes/financeRoutes");

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);

const PORT = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.json({
    status: "healthy",
    message: "Growssify Backend API is running smoothly!",
  });
});
app.listen(PORT, () => console.log(`Server executing cleanly on port ${PORT}`));
