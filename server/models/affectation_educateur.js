const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "AffectationEducateur",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      groupe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_affectation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "affectations_educateurs",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["educateur_id", "annee_id"] },
        { unique: true, fields: ["groupe_id", "annee_id"] },
      ],
    }
  );
