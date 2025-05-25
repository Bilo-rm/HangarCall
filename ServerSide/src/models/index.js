const sequelize = require("../config/db");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: {
      type: DataTypes.ENUM("admin", "restaurant", "user"),
      allowNull: false,
      defaultValue: "user",
    },
});

const Restaurant = sequelize.define("Restaurant", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  location: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  suspended: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } }, // 👈 Add this line
});


const Menu = sequelize.define("Menu", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Restaurants', key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
});

const Cart = sequelize.define("Cart", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  menuItemId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Menus', key: 'id' } },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
});

const Order = sequelize.define("Order", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    defaultValue: "pending",
  },
  restaurantId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Restaurants', key: 'id' } } // ✅ Add this line
});


const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  orderId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Orders', key: 'id' } },
  menuItemId: { type: DataTypes.UUID, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  price: { type: DataTypes.FLOAT, allowNull: false },
});

///  User → Orders, Cart
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });


//  Cart → Menu
Cart.belongsTo(Menu, { foreignKey: 'menuItemId', as: 'Menu' });
Menu.hasMany(Cart, { foreignKey: 'menuItemId', as: 'Carts' }); // optional alias


//  Order → OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });


//  OrderItem → Menu
OrderItem.belongsTo(Menu, { foreignKey: 'menuItemId', as: 'Menu' });
Menu.hasMany(OrderItem, { foreignKey: 'menuItemId', as: 'OrderItems' });


//  Menu → Restaurant
Menu.belongsTo(Restaurant, { foreignKey: 'restaurantId', as: 'Restaurant' });
Restaurant.hasMany(Menu, { foreignKey: 'restaurantId', as: 'Menus' });

// Restaurant belongs to User
Restaurant.belongsTo(User, { foreignKey: 'userId', as: 'Owner' });
User.hasOne(Restaurant, { foreignKey: 'userId', as: 'OwnedRestaurant' });


sequelize.sync({ alter: true });

module.exports = { User, Restaurant, Menu, Cart, Order, OrderItem,sequelize };
