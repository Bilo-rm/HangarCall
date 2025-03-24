const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { updateLocation } = require("../controllers/locationController");
const router = express.Router();

router.post("/", authMiddleware, updateLocation);

module.exports = router;
