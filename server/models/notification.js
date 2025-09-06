const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      type: DataTypes.STRING(50),
      titre: DataTypes.STRING(200),
      corps: DataTypes.TEXT,
      lu_le: DataTypes.DATE,
    },
    { tableName: "notifications", underscored: true, timestamps: true }
  );
