const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../setup/database");

const Strategy = sequelize.define("Strategy", {
  user: {
    type: DataTypes.STRING(64),
    allowNull: false,
    validate: { isEmail: true },
  },
  name: {
    type: DataTypes.STRING(32),
    allowNull: false,
    validate: { is: /^[A-Za-z0-9._-\s]*$/i },
  },
  notes: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: { is: /^[A-Za-z0-9._-\s]*$/i },
  },
  positions: {
    type: DataTypes.JSON,
    allowNull: false,
  },
});

module.exports = Strategy;
