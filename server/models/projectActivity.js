'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectActivity', {
    peiId: { type: DataTypes.INTEGER, allowNull: false },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    scheduledAt: DataTypes.DATE
  });
};
