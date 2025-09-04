"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Event", {
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    start: DataTypes.DATE,
    end: DataTypes.DATE,
    audience: {
      type: DataTypes.ENUM("parents", "educateurs", "tous"),
      defaultValue: "tous",
    },
  });
};
