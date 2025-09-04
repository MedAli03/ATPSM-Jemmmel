'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Group', {
    name: { type: DataTypes.STRING, allowNull: false },
    description: DataTypes.TEXT,
    // one educator per group, and an educator can lead only ONE group
    educatorId: { type: DataTypes.INTEGER, allowNull: true, unique: true } 
  });
};
