const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OTP = sequelize.define(
  "OTP",
  {
    identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = OTP;
