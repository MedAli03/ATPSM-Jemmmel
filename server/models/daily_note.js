const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "DailyNote",
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
      educateur_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      pei_version_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      pei_objectif_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
      note_date: { type: DataTypes.DATEONLY, allowNull: false },
      contenu: { type: DataTypes.TEXT, allowNull: false },
      type: {
        type: DataTypes.ENUM("OBSERVATION", "INCIDENT", "PROGRES"),
        allowNull: false,
        defaultValue: "OBSERVATION",
      },
      visibility: {
        type: DataTypes.ENUM("INTERNE", "PARTAGE_PARENT"),
        allowNull: false,
        defaultValue: "INTERNE",
      },
    },
    {
      tableName: "daily_notes",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["enfant_id", "note_date", "educateur_id"] },
        { fields: ["enfant_id", "note_date"] },
        { fields: ["visibility"] },
      ],
    }
  );
