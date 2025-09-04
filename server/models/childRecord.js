'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ChildRecord', {
    childId: { type: DataTypes.INTEGER, allowNull: false },
    medicalNotes: DataTypes.TEXT,
    allergies: DataTypes.STRING,
    strengths: DataTypes.TEXT,
    needs: DataTypes.TEXT,
    preferences: DataTypes.TEXT
  });
};
