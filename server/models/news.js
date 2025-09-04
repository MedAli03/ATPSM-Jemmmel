"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("News", {
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    publishedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  });
};
