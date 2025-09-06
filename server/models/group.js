const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Groupe",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      nom: { type: DataTypes.STRING(120), allowNull: false },
      description: DataTypes.TEXT,
      manager_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      statut: {
        type: DataTypes.ENUM("actif", "archive"),
        defaultValue: "actif",
      },
    },
    { tableName: "groupes", underscored: true, timestamps: true }
  );
