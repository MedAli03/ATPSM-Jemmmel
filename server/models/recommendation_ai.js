const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "RecoAI",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      evaluation_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      projet_source_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      projet_cible_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      statut: {
        type: DataTypes.ENUM("proposee", "validee", "modifiee", "rejetee"),
        defaultValue: "proposee",
      },
      model_version: DataTypes.STRING(50),
      visible_parent: { type: DataTypes.BOOLEAN, defaultValue: false },
      date_creation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      commentaire: DataTypes.TEXT,
    },
    { tableName: "recommendation_ai", underscored: true, timestamps: true }
  );
