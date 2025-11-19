const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "AnneeScolaire",
    {
      id: {
        type: DataTypes.SMALLINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      label: {
        type: DataTypes.STRING(9),
        allowNull: false,
        unique: true,
      },
      date_debut: { type: DataTypes.DATEONLY, allowNull: true },
      date_fin: { type: DataTypes.DATEONLY, allowNull: true },
      est_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    },
    {
      tableName: "annees_scolaires",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["date_debut", "date_fin"] },
        { fields: ["est_active"] },
      ],
    }
  );
