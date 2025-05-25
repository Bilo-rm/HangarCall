const { Restaurant } = require("../models");

exports.addRestaurant = async (req, res) => {
  try {
    const { name, location, image, userId } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: "Name and location are required" });
    }

    let ownerId = userId;  // Admin can assign
    if (req.user.role === 'restaurant') {
      ownerId = req.user.id;  // Restaurant owner creates their own
    }

    if (!ownerId) {
      return res.status(400).json({ message: "Restaurant owner userId is required" });
    }

    const restaurant = await Restaurant.create({ name, location, image, userId: ownerId });
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

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateRestaurant = async (req, res) => {
  try {
    const { name, location, image } = req.body;
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    await restaurant.update({ name, location, image });
    res.json({ message: "Updated", restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    await restaurant.destroy();
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.toggleSuspendRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByPk(req.params.id);
    if (!restaurant) return res.status(404).json({ message: "Not found" });

    restaurant.suspended = !restaurant.suspended;
    await restaurant.save();
    res.json({ message: `Restaurant ${restaurant.suspended ? 'suspended' : 'unsuspended'}`, restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
