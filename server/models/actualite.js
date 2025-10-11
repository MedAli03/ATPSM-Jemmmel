"use strict";

module.exports = (sequelize, DataTypes) => {
  const Actualite = sequelize.define(
    "actualites",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      titre: { type: DataTypes.STRING(200), allowNull: false },
      resume: { type: DataTypes.STRING(500), allowNull: true },
      contenu: { type: DataTypes.TEXT, allowNull: false },
      contenu_html: { type: DataTypes.TEXT("long"), allowNull: true },
      statut: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "draft" },
      tags: { type: DataTypes.JSON, allowNull: true },
      couverture_url: { type: DataTypes.STRING(500), allowNull: true },
      galerie_urls: { type: DataTypes.JSON, allowNull: true },
      epingle: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      publie_le: { type: DataTypes.DATE, allowNull: true },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "actualites",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [{ fields: ["admin_id"] }, { fields: ["publie_le"] }, { fields: ["titre"] }],
    }
  );

  // Associations
  // Actualite.belongsTo(models.Utilisateur, { as: "admin", foreignKey: "admin_id" });

  return Actualite;
};
