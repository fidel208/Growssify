const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({
        error: "No token authorization clearance provided. Access denied.",
      });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_fallback_jwt_secret_key",
    );
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token signature invalid or expired." });
  }
};
