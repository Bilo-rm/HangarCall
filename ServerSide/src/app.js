const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cartRoutes");
const locationRoutes = require("./routes/locationRoutes");
const restaurantOwnerRoutes = require("./routes/restaurantownerRoutes");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/restaurants", restaurantRoutes);
app.use("/menus", menuRoutes);
app.use("/cart", cartRoutes);
app.use("/location", locationRoutes);
app.use("/restaurant-owner", restaurantOwnerRoutes);

module.exports = app;
