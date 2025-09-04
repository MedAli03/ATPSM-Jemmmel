'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DailyNote', {
    childId: { type: DataTypes.INTEGER, allowNull: false },
    authorId: { type: DataTypes.INTEGER, allowNull: false }, // educator
    activityId: { type: DataTypes.INTEGER },                 // optional link
    title: DataTypes.STRING,
    body: DataTypes.TEXT,
    sharedWithParent: { type: DataTypes.BOOLEAN, defaultValue: true }
  });
};
