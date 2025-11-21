const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "AffectationEducateur",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      groupe_annee_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      educateur_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      date_debut: { type: DataTypes.DATEONLY, allowNull: true },
      date_fin: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    },
    {
      tableName: "affectations_educateurs",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["groupe_annee_id", "is_active"] },
        { unique: true, fields: ["groupe_annee_id", "educateur_id"] },
        { fields: ["educateur_id", "is_active"] },
      ],
    }
  );
