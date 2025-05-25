const { Cart , Menu, Order, OrderItem,Restaurant ,sequelize  } = require("../models");



exports.addToCart = async (req, res) => {
  try {
    const { menuItemId, quantity } = req.body;
    const cartItem = await Cart.create({ userId: req.user.id, menuItemId, quantity });
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findAll({ 
      where: { userId: req.user.id },
      include: [{
        model: Menu, 
        as: 'Menu',
        attributes: ['name', 'price', 'image']
      }]
     });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (!cartItem) return res.status(404).json({ message: "Item not found" });

    await cartItem.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.checkout = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;

    // Fetch cart items with menu and restaurant info
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        { model: Menu, as: 'Menu', include: [{ model: Restaurant, as: 'Restaurant' }] }
      ]
    });

    if (!cartItems.length) return res.status(400).json({ message: "Cart is empty" });

    // Group cart items by restaurantId
    const itemsByRestaurant = {};
    cartItems.forEach(item => {
      const restaurantId = item.Menu.restaurantId;
      if (!itemsByRestaurant[restaurantId]) {
        itemsByRestaurant[restaurantId] = [];
      }
      itemsByRestaurant[restaurantId].push(item);
    });

    // Create an order for each restaurant
    const createdOrders = [];
    for (const restaurantId in itemsByRestaurant) {
      const items = itemsByRestaurant[restaurantId];
      const total = items.reduce((sum, item) => sum + (item.quantity * item.Menu.price), 0);

      const order = await Order.create({ userId, total, restaurantId }, { transaction: t });

      for (const item of items) {
        await OrderItem.create({
          orderId: order.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.Menu.price
        }, { transaction: t });
      }

      createdOrders.push(order);
    }

    // Clear the cart
    await Cart.destroy({ where: { userId }, transaction: t });

    await t.commit();
    res.json({ message: "Checkout successful", orders: createdOrders.map(o => o.id) });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};


exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Menu,
              as: 'Menu', // match alias
              include: [
                {
                  model: Restaurant,
                  as: 'Restaurant' // match alias
                }
              ]
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
