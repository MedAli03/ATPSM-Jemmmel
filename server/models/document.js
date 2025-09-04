'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Document', {
    ownerUserId: { type: DataTypes.INTEGER, allowNull: false },
    childId: { type: DataTypes.INTEGER },    // optional if doc linked to a child
    type: { type: DataTypes.ENUM('reglement','autre'), defaultValue: 'autre' },
    title: DataTypes.STRING,
    url: DataTypes.STRING,
    status: { type: DataTypes.ENUM('draft','published'), defaultValue: 'published' }
  });
};
