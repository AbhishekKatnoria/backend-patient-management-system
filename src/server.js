const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/db");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Routes
app.use("/auth", authRoutes);

// DB Connection
sequelize
  .sync({force: true})
  .then(() => console.log("Database synced successfully"))
  .catch((err) => console.error("Error syncing database:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
