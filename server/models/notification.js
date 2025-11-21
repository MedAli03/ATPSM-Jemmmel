const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      type: { type: DataTypes.STRING(80), allowNull: false },
      titre: { type: DataTypes.STRING(255), allowNull: true },
      corps: { type: DataTypes.TEXT, allowNull: true },
      payload: { type: DataTypes.JSON, allowNull: true },
      source_type: { type: DataTypes.STRING(80), allowNull: true },
      source_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
      icon: { type: DataTypes.STRING(120), allowNull: true },
      action_url: { type: DataTypes.STRING(500), allowNull: true },
      lu_le: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "notifications",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["utilisateur_id", "lu_le"] }],
    }
  );
