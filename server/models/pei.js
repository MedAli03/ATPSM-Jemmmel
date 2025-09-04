'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PEI', {
    childId: { type: DataTypes.INTEGER, allowNull: false },
    title: DataTypes.STRING,
    summary: DataTypes.TEXT,
    startDate: DataTypes.DATEONLY,
    endDate: DataTypes.DATEONLY,
    status: { type: DataTypes.ENUM('draft','active','closed'), defaultValue: 'draft' },
    isTarget: { type: DataTypes.BOOLEAN, defaultValue: false },       // PEI cible
    generatedByAI: { type: DataTypes.BOOLEAN, defaultValue: false }   // créé depuis IA ?
  });
};
