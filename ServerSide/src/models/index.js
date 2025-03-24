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
  location: { type: DataTypes.STRING, allowNull: false }
});

const Menu = sequelize.define("Menu", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurantId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Restaurants', key: 'id' } },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }
});

const Cart = sequelize.define("Cart", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Users', key: 'id' } },
  menuItemId: { type: DataTypes.UUID, allowNull: false, references: { model: 'Menus', key: 'id' } },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
});

User.hasMany(Cart);
Cart.belongsTo(User);
Restaurant.hasMany(Menu);
Menu.belongsTo(Restaurant);

sequelize.sync({ alter: true });

module.exports = { User, Restaurant, Menu, Cart };
