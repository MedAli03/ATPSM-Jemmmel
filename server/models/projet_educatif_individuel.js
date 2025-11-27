const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "PEI",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_creation: { type: DataTypes.DATEONLY, allowNull: false },
      objectifs: { type: DataTypes.TEXT, allowNull: true },
      statut: {
        type: DataTypes.ENUM("EN_ATTENTE_VALIDATION", "VALIDE", "CLOTURE", "REFUSE"),
        allowNull: false,
        defaultValue: "EN_ATTENTE_VALIDATION",
      },
      est_actif: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: null },
      valide_par_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      date_validation: { type: DataTypes.DATE, allowNull: true },
      precedent_projet_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      date_derniere_maj: { type: DataTypes.DATE, allowNull: true },
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
      tableName: "projet_educatif_individuel",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["enfant_id", "annee_id"] },
        { unique: true, fields: ["enfant_id", "annee_id", "est_actif"] },
        { fields: ["annee_id", "statut"] },
      ],
    }
  );
