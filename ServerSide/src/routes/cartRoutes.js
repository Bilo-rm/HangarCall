const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");
const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);
router.delete("/:id", authMiddleware, removeFromCart);

module.exports = router;
