'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('InitialObservation', {
    childId: { type: DataTypes.INTEGER, allowNull: false },
    authorId: { type: DataTypes.INTEGER, allowNull: false }, // educator
    date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    content: { type: DataTypes.TEXT, allowNull: false }
  });
};
