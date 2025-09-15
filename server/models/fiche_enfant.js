"use strict";

module.exports = (sequelize, DataTypes) => {
  const FicheEnfant = sequelize.define(
    "fiche_enfant",
    {
      enfant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true, // 1:1, PK = FK
        allowNull: false,
      },
      lieu_naissance: { type: DataTypes.STRING(150), allowNull: true },
      diagnostic_medical: { type: DataTypes.TEXT, allowNull: true },
      nb_freres: { type: DataTypes.INTEGER, allowNull: true },
      nb_soeurs: { type: DataTypes.INTEGER, allowNull: true },
      rang_enfant: { type: DataTypes.INTEGER, allowNull: true },
      situation_familiale: {
        type: DataTypes.ENUM(
          "deux_parents",
          "pere_seul",
          "mere_seule",
          "autre"
        ),
        allowNull: true,
      },
      diag_auteur_nom: { type: DataTypes.STRING(150), allowNull: true },
      diag_auteur_description: { type: DataTypes.TEXT, allowNull: true },
      carte_invalidite_numero: { type: DataTypes.STRING(100), allowNull: true },
      carte_invalidite_couleur: { type: DataTypes.STRING(50), allowNull: true },
      type_handicap: { type: DataTypes.STRING(150), allowNull: true },
      troubles_principaux: { type: DataTypes.TEXT, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "fiche_enfant",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [{ fields: ["enfant_id"] }],
    }
  );

  // Associations centralisées dans models/index.js
  // FicheEnfant.belongsTo(models.Enfant, { as: "enfant", foreignKey: "enfant_id" });

  return FicheEnfant;
};
