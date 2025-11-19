"use strict";

module.exports = (sequelize, DataTypes) => {
  const Enfant = sequelize.define(
    "Enfant",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      numero_dossier: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
      },
      prenom: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      nom: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      date_naissance: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      genre: {
        type: DataTypes.ENUM("F", "M", "AUTRE"),
        allowNull: true,
      },
      statut: {
        type: DataTypes.ENUM("ACTIF", "INACTIF"),
        allowNull: false,
        defaultValue: "ACTIF",
      },
      date_inscription: { type: DataTypes.DATEONLY, allowNull: true },
      notes_confidentielles: { type: DataTypes.TEXT, allowNull: true },
      created_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "enfants",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["statut"] },
        { fields: ["date_inscription"] },
        { fields: ["created_by"] },
      ],
    }
  );

  return Enfant;
};
