'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ParentProfile', {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    address: DataTypes.STRING,
    emergencyContactName: DataTypes.STRING,
    emergencyContactPhone: DataTypes.STRING
  });
};
