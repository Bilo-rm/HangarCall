const express = require("express");
const { getMenuByRestaurant } = require("../controllers/menuController");
const router = express.Router();

router.get("/:id/menu", getMenuByRestaurant);

module.exports = router;
