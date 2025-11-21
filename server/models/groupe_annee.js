const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "GroupeAnnee",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      groupe_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      annee_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      educateur_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      statut: {
        type: DataTypes.ENUM("OUVERT", "FERME"),
        allowNull: false,
        defaultValue: "OUVERT",
      },
      effectif_max: { type: DataTypes.SMALLINT, allowNull: true },
    },
    {
      tableName: "groupes_annees",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["groupe_id", "annee_id"] },
        { fields: ["educateur_id", "annee_id"] },
        { fields: ["annee_id", "statut"] },
      ],
    }
  );
