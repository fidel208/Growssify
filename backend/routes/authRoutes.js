const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.put("/update-profile", verifyToken, authController.updateProfile);
router.delete("/delete-account", verifyToken, authController.deleteAccount);

module.exports = router;
