'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('AiRecommendation', {
    childId: { type: DataTypes.INTEGER, allowNull: false },
    peiId: { type: DataTypes.INTEGER }, // optional target PEI
    modelVersion: DataTypes.STRING,
    content: { type: DataTypes.TEXT, allowNull: false },    // raw recommendation
    reviewedById: { type: DataTypes.INTEGER },              // educator user id
    reviewStatus: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' },
    visibleToParent: { type: DataTypes.BOOLEAN, defaultValue: false } // keep false per your rule
  });
};
