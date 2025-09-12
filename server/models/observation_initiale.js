"use strict";

module.exports = (sequelize, DataTypes) => {
  const ObservationInitiale = sequelize.define(
    "observation_initiale",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      educateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      date_observation: { type: DataTypes.DATE, allowNull: false },
      contenu: { type: DataTypes.TEXT, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "observation_initiale",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["enfant_id"] },
        { fields: ["educateur_id"] },
        { fields: ["date_observation"] },
      ],
    }
  );

  // Associations (assumes they’re already defined in models/index.js)
  // ObservationInitiale.belongsTo(models.Enfant, { as: "enfant", foreignKey: "enfant_id" });
  // ObservationInitiale.belongsTo(models.Utilisateur, { as: "educateur", foreignKey: "educateur_id" });

  return ObservationInitiale;
};
