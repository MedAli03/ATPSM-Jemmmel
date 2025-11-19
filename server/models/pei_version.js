const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PeiVersion",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      annee_id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        allowNull: false,
      },
      groupe_annee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      observation_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      version_number: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.ENUM("DRAFT", "ACTIVE", "ARCHIVE"),
        allowNull: false,
        defaultValue: "DRAFT",
      },
      est_actif: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      effective_start: { type: DataTypes.DATEONLY, allowNull: true },
      effective_end: { type: DataTypes.DATEONLY, allowNull: true },
      motivation: { type: DataTypes.TEXT, allowNull: true },
      previous_version_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "pei_versions",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["enfant_id", "annee_id", "version_number"] },
        { fields: ["enfant_id", "status"] },
        { fields: ["annee_id", "status"] },
      ],
    }
  );
