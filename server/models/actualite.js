"use strict";

module.exports = (sequelize, DataTypes) => {
  const Actualite = sequelize.define(
    "actualites",
    {
      id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      titre: { type: DataTypes.STRING(200), allowNull: false },
      contenu: { type: DataTypes.TEXT, allowNull: false },
      publie_le: { type: DataTypes.DATE, allowNull: false },
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
