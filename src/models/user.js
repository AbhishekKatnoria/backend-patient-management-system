const Sequelize = require("sequelize");
const db = require("../config/db");

const User = db.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  email: Sequelize.STRING,
  phone: Sequelize.STRING,
  password: Sequelize.STRING,
});

module.exports = User;
