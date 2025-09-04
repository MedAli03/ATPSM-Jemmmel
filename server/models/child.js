'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Child', {
    nom: { type: DataTypes.STRING, allowNull: false },
    dateNaissance: { type: DataTypes.DATEONLY, allowNull: false },
    diagnosisSummary: DataTypes.TEXT,
    guardianId: { type: DataTypes.INTEGER, allowNull: false }
  });
};
