const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING(32),
    allowNull: true,
    validate: { is: /^[A-Za-z0-9._-\s]*$/i },
  },
  email: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  mobile: {
    type: DataTypes.STRING(32),
    allowNull: true,
    validate: { isNumeric: true },
  },
});

module.exports = User;
