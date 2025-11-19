const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Document",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      titre: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      contenu: { type: DataTypes.TEXT, allowNull: true },
      fichier_url: { type: DataTypes.STRING(500), allowNull: true },
      type: {
        type: DataTypes.ENUM("DOCUMENT", "REGLEMENT", "EVENEMENT", "ACTUALITE"),
        allowNull: false,
        defaultValue: "DOCUMENT",
      },
      audience_scope: {
        type: DataTypes.ENUM("TOUS", "ROLE", "GROUPE", "ENFANT"),
        allowNull: false,
        defaultValue: "TOUS",
      },
      visible_from: { type: DataTypes.DATE, allowNull: true },
      visible_to: { type: DataTypes.DATE, allowNull: true },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      is_archived: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      legacy_source_table: { type: DataTypes.STRING(50), allowNull: true },
      legacy_source_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "documents",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["type", "audience_scope"] },
        { fields: ["visible_from", "visible_to"] },
      ],
    }
  );
