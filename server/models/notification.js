"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("Notification", {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING }, // reminder|message|event|alert...
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    readAt: DataTypes.DATE,
  });
};
