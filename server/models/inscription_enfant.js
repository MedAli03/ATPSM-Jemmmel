// models/InscriptionEnfant.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "InscriptionEnfant",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      groupe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_inscription: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      date_sortie: { type: DataTypes.DATE, allowNull: true },
      est_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "inscriptions_enfants",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["groupe_id", "enfant_id", "annee_id"] },
        { unique: true, fields: ["enfant_id", "annee_id", "est_active"] },
        { fields: ["annee_id", "est_active"] },
        { fields: ["groupe_id", "annee_id"] },
        { fields: ["enfant_id", "annee_id"] },
      ],
    }
  );
