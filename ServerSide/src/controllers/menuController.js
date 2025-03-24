const { Menu, Restaurant } = require("../models");

exports.addMenuItem = async (req, res) => {
  try {
    const { id } = req.params; // Restaurant ID from URL
    const { name, price } = req.body; // Corrected: No duplicate 'id'

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Corrected: Use 'Menu' instead of 'MenuItem'
    const menuItem = await Menu.create({ name, price, restaurantId: id });

    res.status(201).json({ message: "Menu item added", menuItem });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all menu items for a restaurant
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const menu = await Menu.findAll({ where: { restaurantId: req.params.id } });
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: error.message });
  }
};
