const express = require("express");
const { getMenuByRestaurant, addMenuItem } = require("../controllers/menuController");
const  authMiddleware  = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/:id/menu", authMiddleware, roleMiddleware(["restaurant"]) , addMenuItem);
router.get("/:id/menu", getMenuByRestaurant);

module.exports = router;
