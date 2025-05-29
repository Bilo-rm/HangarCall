const express = require("express");
const { 
  getMenuByRestaurant, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem, 
  getMenuItem 
} = require("../controllers/menuController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const router = express.Router();

// Public routes - anyone can view menus
router.get("/:id/menu", getMenuByRestaurant);
router.get("/menu-item/:menuItemId", getMenuItem);

// Protected routes - only restaurant owners can modify their menus
router.post("/:id/menu", authMiddleware, roleMiddleware(["restaurant"]), addMenuItem);
router.put("/menu-item/:menuItemId", authMiddleware, roleMiddleware(["restaurant"]), updateMenuItem);
router.delete("/menu-item/:menuItemId", authMiddleware, roleMiddleware(["restaurant"]), deleteMenuItem);

module.exports = router;