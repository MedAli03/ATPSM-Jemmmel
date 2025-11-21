const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "PeiHistoryLog",
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
      action: {
        type: DataTypes.ENUM("CREATION", "VALIDATION", "REVISION", "CLOTURE"),
        allowNull: false,
        defaultValue: "REVISION",
      },
      performed_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      details_json: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "pei_history_log",
      underscored: true,
      timestamps: false,
      createdAt: "created_at",
      updatedAt: false,
      indexes: [{ fields: ["pei_version_id"] }],
    }
  );
