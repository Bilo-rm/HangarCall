const { Menu, Restaurant } = require("../models");

// ✅ Add menu item (existing)
exports.addMenuItem = async (req, res) => {
  try {
    const { id } = req.params; 
    const { name, price, image } = req.body; 

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findByPk(id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const menuItem = await Menu.create({ name, price, restaurantId: id, image});

    res.status(201).json({ message: "Menu item added", menuItem });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all menu items for a restaurant (existing)
exports.getMenuByRestaurant = async (req, res) => {
  try {
    const menu = await Menu.findAll({ where: { restaurantId: req.params.id } });
    res.json(menu);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const { name, price, image } = req.body;

    // Find the menu item
    const menuItem = await Menu.findByPk(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Optional: Check if the restaurant belongs to the authenticated user
    // This depends on your authentication middleware
    // const restaurant = await Restaurant.findByPk(menuItem.restaurantId);
    // if (restaurant.userId !== req.user.id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    // Validate input
    if (name && name.trim().length === 0) {
      return res.status(400).json({ message: "Name cannot be empty" });
    }
    if (price && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Update the menu item
    const updatedMenuItem = await menuItem.update({
      name: name || menuItem.name,
      price: price || menuItem.price,
      image: image !== undefined ? image : menuItem.image, // Allow empty string for image
    });

    res.json({ 
      message: "Menu item updated successfully", 
      menuItem: updatedMenuItem 
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    // Find the menu item
    const menuItem = await Menu.findByPk(menuItemId);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Optional: Check if the restaurant belongs to the authenticated user
    // const restaurant = await Restaurant.findByPk(menuItem.restaurantId);
    // if (restaurant.userId !== req.user.id) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    // Delete the menu item
    await menuItem.destroy();

    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get single menu item (bonus - useful for edit forms)
exports.getMenuItem = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const menuItem = await Menu.findByPk(menuItemId, {
      include: [
        {
          model: Restaurant,
          as: 'Restaurant',
          attributes: ['id', 'name', 'location']
        }
      ]
    });

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};