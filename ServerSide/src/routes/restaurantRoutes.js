const express = require("express");
const { getRestaurants, addRestaurant } = require("../controllers/restaurantController");
const  authMiddleware  = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/", authMiddleware, addRestaurant);
router.get("/", getRestaurants);

module.exports = router;
