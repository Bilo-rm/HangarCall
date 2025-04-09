const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart, checkout, getOrders } = require("../controllers/cartController");
const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.delete("/:id", authMiddleware, removeFromCart);
router.post("/checkout", authMiddleware, checkout);
router.get("/getOrders", authMiddleware, getOrders);
module.exports = router;
