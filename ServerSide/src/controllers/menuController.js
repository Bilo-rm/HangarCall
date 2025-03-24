const { Menu ,Restaurant} = require("../models");

exports.addMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await MenuItem.create({ name, price, restaurantId: id });
    res.status(201).json({ message: "Menu item added", menuItem });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const menu = await Menu.findAll({ where: { restaurantId: req.params.id } });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
