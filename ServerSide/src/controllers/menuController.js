const { Menu } = require("../models");

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const menu = await Menu.findAll({ where: { restaurantId: req.params.id } });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
