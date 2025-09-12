"use strict";

module.exports = (sequelize, DataTypes) => {
  const Reglement = sequelize.define(
    "reglements",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      document_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      version: { type: DataTypes.STRING(30), allowNull: false },
      date_effet: { type: DataTypes.DATEONLY, allowNull: false },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "reglements",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [{ fields: ["document_id"] }, { fields: ["date_effet"] }],
    }
  );

  // Associations (si vous centralisez déjà dans models/index.js, ne pas dupliquer)
  // Reglement.belongsTo(models.Document, { as: "document", foreignKey: "document_id" });

  return Reglement;
};
