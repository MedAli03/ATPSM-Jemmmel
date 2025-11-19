"use strict";

module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "FicheEnfant",
    {
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      lieu_naissance: { type: DataTypes.STRING(150), allowNull: true },
      diagnostic_medical: { type: DataTypes.TEXT, allowNull: true },
      nb_freres: { type: DataTypes.INTEGER, allowNull: true },
      nb_soeurs: { type: DataTypes.INTEGER, allowNull: true },
      rang_enfant: { type: DataTypes.INTEGER, allowNull: true },
      situation_familiale: {
        type: DataTypes.ENUM("deux_parents", "pere_seul", "mere_seule", "autre"),
        allowNull: true,
      },
      diag_auteur_nom: { type: DataTypes.STRING(150), allowNull: true },
      diag_auteur_description: { type: DataTypes.TEXT, allowNull: true },
      carte_invalidite_numero: { type: DataTypes.STRING(100), allowNull: true },
      carte_invalidite_couleur: { type: DataTypes.STRING(50), allowNull: true },
      type_handicap: { type: DataTypes.STRING(150), allowNull: true },
      troubles_principaux: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "fiche_enfant",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
