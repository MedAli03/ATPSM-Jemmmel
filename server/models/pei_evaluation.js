const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PeiEvaluation",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      pei_version_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      objectif_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      educateur_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      evaluation_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      cycle: {
        type: DataTypes.ENUM("3M", "6M", "ANNUEL"),
        allowNull: true,
      },
      score: { type: DataTypes.TINYINT, allowNull: true },
      commentaires: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "pei_evaluations",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["pei_version_id", "evaluation_date"] },
        { fields: ["educateur_id", "evaluation_date"] },
      ],
    }
  );
