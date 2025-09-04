'use strict';
module.exports = (sequelize, DataTypes) => {
  return sequelize.define('User', {
    nom: DataTypes.STRING,
    prenom: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    motDePasse: DataTypes.STRING,
    phone: DataTypes.STRING,
    avatarUrl: DataTypes.STRING,
    roleId: DataTypes.INTEGER
  });
};
