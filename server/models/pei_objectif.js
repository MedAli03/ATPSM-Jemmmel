const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PeiObjectif",
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
      titre: { type: DataTypes.STRING(255), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      priorite: {
        type: DataTypes.ENUM("BASSE", "MOYENNE", "ELEVEE"),
        allowNull: false,
        defaultValue: "MOYENNE",
      },
      source: {
        type: DataTypes.ENUM("EDUCATEUR", "PARENT"),
        allowNull: false,
        defaultValue: "EDUCATEUR",
      },
      ordre: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    },
    {
      tableName: "pei_objectifs",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["pei_version_id", "ordre"] }],
    }
  );
