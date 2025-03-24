const app = require("./src/app");
const sequelize = require("./src/config/db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log("Database connected successfully!");
    return sequelize.sync(); // Sync models with DB
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("Database connection failed:", error));
