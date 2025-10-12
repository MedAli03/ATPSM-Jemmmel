const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "UtilisateurSession",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      user_agent: { type: DataTypes.STRING(255), allowNull: true },
      browser: { type: DataTypes.STRING(150), allowNull: true },
      os: { type: DataTypes.STRING(150), allowNull: true },
      device: { type: DataTypes.STRING(150), allowNull: true },
      ip_address: { type: DataTypes.STRING(45), allowNull: true },
    },
    {
      tableName: "utilisateur_sessions",
      underscored: true,
      timestamps: true,
    }
  );
