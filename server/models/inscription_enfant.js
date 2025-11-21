const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "InscriptionEnfant",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      groupe_annee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      annee_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      date_entree: { type: DataTypes.DATEONLY, allowNull: true },
      date_sortie: { type: DataTypes.DATEONLY, allowNull: true },
      statut: {
        type: DataTypes.ENUM("ACTIVE", "SUSPENDU", "TERMINE"),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      tableName: "inscriptions_enfants",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["enfant_id", "annee_id", "statut"] },
        { fields: ["groupe_annee_id", "statut"] },
        { fields: ["enfant_id", "statut"] },
      ],
    }
  );
