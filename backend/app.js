const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const financeRoutes =  require("./routes/financeRoutes")
require("dotenv").config();

const app = express();

// Standard parsers
app.use(cors());
app.use(express.json());

// Mount Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/finance", financeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server executing cleanly on port ${PORT}`));
