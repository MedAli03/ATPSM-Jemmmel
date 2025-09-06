const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "FicheEnfant",
    {
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true },
      lieu_naissance: DataTypes.STRING(150),
      diagnostic_medical: DataTypes.TEXT,
      nb_freres: DataTypes.INTEGER,
      nb_soeurs: DataTypes.INTEGER,
      rang_enfant: DataTypes.INTEGER,
      situation_familiale: DataTypes.ENUM(
        "deux_parents",
        "pere_seul",
        "mere_seule",
        "autre"
      ),
      diag_auteur_nom: DataTypes.STRING(150),
      diag_auteur_description: DataTypes.TEXT,
      carte_invalidite_numero: DataTypes.STRING(100),
      carte_invalidite_couleur: DataTypes.STRING(50),
      type_handicap: DataTypes.STRING(150),
      troubles_principaux: DataTypes.TEXT,
    },
    { tableName: "fiche_enfant", underscored: true, timestamps: true }
  );
