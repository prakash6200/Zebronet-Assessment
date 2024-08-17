const config = require("../config/config");

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  config.DB_DATABASE,
  config.DB_USER,
  config.DB_PASSWORD,
  {
    host: config.DB_HOST,
    dialect: "mysql",
    logging: false,
  },
);

module.exports = sequelize;