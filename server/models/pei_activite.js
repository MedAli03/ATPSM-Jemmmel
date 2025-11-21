const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PeiActivite",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      objectif_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      titre: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      frequence: { type: DataTypes.STRING(120), allowNull: true },
      lieu: { type: DataTypes.STRING(120), allowNull: true },
      statut: {
        type: DataTypes.ENUM("PLANIFIEE", "EN_COURS", "TERMINEE", "ABANDONNEE"),
        allowNull: false,
        defaultValue: "PLANIFIEE",
      },
      created_by: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "pei_activites",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["objectif_id", "statut"] }],
    }
  );
