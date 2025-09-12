"use strict";

module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define(
    "documents",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      admin_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      type: {
        type: DataTypes.ENUM("reglement", "autre"),
        allowNull: false,
        defaultValue: "autre",
      },
      titre: { type: DataTypes.STRING(200), allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: false },
      statut: {
        type: DataTypes.ENUM("brouillon", "publie"),
        allowNull: false,
        defaultValue: "brouillon",
      },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "documents",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["admin_id"] },
        { fields: ["type"] },
        { fields: ["statut"] },
        { fields: ["titre"] },
      ],
    }
  );

  // Associations (si tu centralises dans models/index.js, elles sont déjà faites)
  // Document.belongsTo(models.Utilisateur, { as: "admin", foreignKey: "admin_id" });

  return Document;
};
