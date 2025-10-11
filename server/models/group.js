// models/Groupe.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Groupe",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      nom: { type: DataTypes.STRING(120), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      statut: { type: DataTypes.ENUM("actif", "archive"), allowNull: false, defaultValue: "actif" },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "groupes",
      underscored: true,
      timestamps: true,
      indexes: [
        // Optional: avoid duplicate names within a year (if you want it)
        // { unique: true, fields: ["annee_id", "nom"] },
      ],
    }
  );
