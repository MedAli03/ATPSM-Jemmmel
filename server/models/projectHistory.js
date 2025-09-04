'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProjectHistory', {
    peiId: { type: DataTypes.INTEGER, allowNull: false },
    authorId: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING, allowNull: false }, // CREATED/UPDATED/STATUS_CHANGE/ACTIVITY_ADDED...
    details: DataTypes.TEXT
  });
};
