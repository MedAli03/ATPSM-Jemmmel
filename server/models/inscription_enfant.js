const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "InscriptionEnfant",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      annee_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      groupe_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_inscription: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "inscriptions_enfants",
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ["enfant_id", "annee_id"] }],
    }
  );
