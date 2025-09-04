'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectEvaluation', {
    peiId: { type: DataTypes.INTEGER, allowNull: false },
    activityId: { type: DataTypes.INTEGER }, // optional
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    score: { type: DataTypes.INTEGER },      // 0..100 or scale 1..5
    notes: DataTypes.TEXT
  });
};
