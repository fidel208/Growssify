const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "growssify_secret_key_123";

exports.signup = async (req, res) => {
  const { email, businessName, username, password } = req.body;

  try {
    if (!email || !username || !password) {
      return res
        .status(400)
        .json({ error: "Please fill in all required fields" });
    }

    const userCheck = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (username, email, password_hash, business_name) VALUES ($1, $2, $3, $4) RETURNING user_id, username, email, business_name",
      [username, email, hashedPassword, businessName],
    );

    res.status(201).json({
      message: "Account created successfully!",
      user: newUser.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server registration error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please provide both email and password" });
    }

    const userResult = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    res.json({
      token,
      user: {
        id: user.user_id,
        username: user.username,
        businessName: user.business_name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server authentication error" });
  }
};

exports.updateProfile = async (req, res) => {
  const { businessName, username, email } = req.body;

  if (!username || !email) {
    return res
      .status(400)
      .json({ error: "Username and email details are required fields" });
  }

  try {
    const activeUserId = req.userId;

    const updateQuery = `
      UPDATE users 
      SET business_name = $1, username = $2, email = $3 
      WHERE user_id = $4 
      RETURNING user_id, username, email, business_name;
    `;

    const result = await pool.query(updateQuery, [
      businessName,
      username,
      email,
      activeUserId,
    ]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "User account profile records not found" });
    }

    res.json({
      success: true,
      message: "Profile account settings synced successfully",
    });
  } catch (err) {
    console.error("Profile adjustment runtime exception:", err.message);
    res.status(500).json({ error: "Server database update runtime failure" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const activeUserId = req.userId;

    const deleteQuery =
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id;";
    const result = await pool.query(deleteQuery, [activeUserId]);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Account parameters matching target not found" });
    }

    res.json({
      success: true,
      message: "User records permanently removed from data arrays",
    });
  } catch (err) {
    console.error("Account elimination tracking fault:", err.message);
    res
      .status(500)
      .json({ error: "Server dataset execution processing fault" });
  }
};
