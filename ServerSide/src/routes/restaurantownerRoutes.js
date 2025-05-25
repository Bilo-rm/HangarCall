const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/restaurantOwnerController");

router.get(
  "/restaurant-orders",
  auth,
  role(["restaurant"]),
  controller.getRestaurantOrders
);

router.put(
  "/order/:orderId/status",
  auth,
  role(["restaurant"]),
  controller.updateOrderStatus
);

router.post(
  "/menu",
  auth,
  role(["restaurant"]),
  controller.addMenuItem
);

module.exports = router;
