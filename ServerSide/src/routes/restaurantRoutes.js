const express = require("express");
const { getRestaurants, addRestaurant,getRestaurant, updateRestaurant,deleteRestaurant,  toggleSuspendRestaurant} = require("../controllers/restaurantController");
const  authMiddleware  = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

router.post("/", authMiddleware, roleMiddleware(["admin", "restaurant"]), addRestaurant);

router.get("/", getRestaurants);
router.get("/:id", getRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);
router.patch("/:id/suspend",toggleSuspendRestaurant);


module.exports = router;
