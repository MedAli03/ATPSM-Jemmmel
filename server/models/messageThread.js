"use strict";
module.exports = (sequelize, DataTypes) => {
  return sequelize.define("MessageThread", {
    childId: { type: DataTypes.INTEGER }, // optional context
    subject: DataTypes.STRING,
  });
};
