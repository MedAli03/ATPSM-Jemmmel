'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Role', {
    name: { type: DataTypes.STRING(40), allowNull: false, unique: true }
  });
};
