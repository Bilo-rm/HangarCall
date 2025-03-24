const express = require("express");
const { getRestaurants, addRestaurant } = require("../controllers/restaurantController");
const  authMiddleware  = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["admin"]) , addRestaurant);
router.get("/", getRestaurants);

module.exports = router;
