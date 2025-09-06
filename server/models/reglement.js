const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Reglement",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      document_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      version: DataTypes.STRING(30),
      date_effet: DataTypes.DATEONLY,
    },
    { tableName: "reglements", underscored: true, timestamps: true }
  );
