const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "growssify_secret_key_123";

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ error: "Access denied. No validation token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ error: "Authentication token is invalid or expired." });
  }
};
