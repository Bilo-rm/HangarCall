const express = require("express");
const { getMenuByRestaurant, addMenuItem } = require("../controllers/menuController");
const  authMiddleware  = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/:id/menu", authMiddleware, addMenuItem);
router.get("/:id/menu", getMenuByRestaurant);

module.exports = router;
