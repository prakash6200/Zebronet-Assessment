const { DataTypes } = require("sequelize");
const sequelize = require("../utils/sequelize.util");

const ContentModel = sequelize.define(
  "content",
  {
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lessons: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = ContentModel;