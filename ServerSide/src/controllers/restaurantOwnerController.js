const { User, Restaurant, Menu, Order, OrderItem, sequelize } = require("../models");
const { Op } = require("sequelize");

// Get all orders for the logged-in restaurant owner
// Restaurant-owner gets their restaurant's orders
exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ where: { userId: req.user.id } });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          required: true, // Enforces INNER JOIN
          include: [
            {
              model: Menu,
              as: 'Menu',
              required: true,
              where: { restaurantId: restaurant.id }, // Filters by restaurant
              include: [
                {
                  model: Restaurant,
                  as: 'Restaurant',
                  attributes: ['id', 'userId'],
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// Update order status (only if the order contains their restaurant's menu items)
exports.updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const ownerId = req.user.id;

  try {
    const restaurant = await Restaurant.findOne({ where: { userId: ownerId } });
    if (!restaurant) return res.status(403).json({ message: "You don't own a restaurant." });

    const order = await Order.findByPk(orderId, {
      include: {
        model: OrderItem,
        include: {
          model: Menu,
          as: 'Menu'
        },
        as: 'OrderItems'
      }
    });

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Check if this order contains items from this restaurant
    const containsItems = order.OrderItems.some(
      item => item.Menu.restaurantId === restaurant.id
    );

    if (!containsItems) {
      return res.status(403).json({ message: "You can't modify this order." });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated.", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating order status." });
  }
};

// Add new menu item to the owner's restaurant
exports.addMenuItem = async (req, res) => {
  const ownerId = req.user.id;
  const { name, price, image } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ where: { userId: ownerId } });
    if (!restaurant) return res.status(403).json({ message: "You don't own a restaurant." });

    const menuItem = await Menu.create({
      name,
      price,
      image,
      restaurantId: restaurant.id
    });

    res.status(201).json({ message: "Menu item added.", menuItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding menu item." });
  }
};
