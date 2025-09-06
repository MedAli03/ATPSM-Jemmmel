const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "AnneeScolaire",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      libelle: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
      est_active: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "annees_scolaires", underscored: true, timestamps: true }
  );
