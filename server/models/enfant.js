const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Enfant",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      nom: { type: DataTypes.STRING(100), allowNull: false },
      prenom: { type: DataTypes.STRING(100), allowNull: false },
      date_naissance: { type: DataTypes.DATEONLY, allowNull: false },
      parent_user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    },
    { tableName: "enfants", underscored: true, timestamps: true }
  );
