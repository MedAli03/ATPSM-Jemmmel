"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enfant = sequelize.define(
    "Enfant",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      parent_user_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true, // sera lié plus tard (link/unlink)
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "enfants",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["nom"] },
        { fields: ["prenom"] },
        { fields: ["parent_user_id"] },
      ],
    }
  );

  // Les associations sont déclarées dans models/index.js (recommandé)
  // Enfant.belongsTo(models.Utilisateur, { as: "parent", foreignKey: "parent_user_id" });

  return Enfant;
};
