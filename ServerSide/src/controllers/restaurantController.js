const { Restaurant } = require("../models");

exports.addRestaurant = async (req, res) => {
  try {
    const { name, location } = req.body;
    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    const restaurant = await Restaurant.create({ name, location });
    res.status(201).json({ message: "Restaurant added", restaurant });
  } catch (error) {
    console.error("Error adding restaurant:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
