"use strict";

module.exports = (sequelize, DataTypes) => {
  const ParentsFiche = sequelize.define(
    "parents_fiche",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      enfant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true,
      },

      // Père
      pere_nom: { type: DataTypes.STRING(150), allowNull: true },
      pere_prenom: { type: DataTypes.STRING(150), allowNull: true },
      pere_naissance_date: { type: DataTypes.DATEONLY, allowNull: true },
      pere_naissance_lieu: { type: DataTypes.STRING(150), allowNull: true },
      pere_origine: { type: DataTypes.STRING(150), allowNull: true },
      pere_cin_numero: { type: DataTypes.STRING(100), allowNull: true },
      pere_cin_delivree_a: { type: DataTypes.STRING(150), allowNull: true },
      pere_adresse: { type: DataTypes.STRING(255), allowNull: true },
      pere_profession: { type: DataTypes.STRING(150), allowNull: true },
      pere_couverture_sociale: { type: DataTypes.STRING(150), allowNull: true },
      pere_tel_domicile: { type: DataTypes.STRING(50), allowNull: true },
      pere_tel_travail: { type: DataTypes.STRING(50), allowNull: true },
      pere_tel_portable: { type: DataTypes.STRING(50), allowNull: true },
      pere_email: { type: DataTypes.STRING(150), allowNull: true },

      // Mère
      mere_nom: { type: DataTypes.STRING(150), allowNull: true },
      mere_prenom: { type: DataTypes.STRING(150), allowNull: true },
      mere_naissance_date: { type: DataTypes.DATEONLY, allowNull: true },
      mere_naissance_lieu: { type: DataTypes.STRING(150), allowNull: true },
      mere_origine: { type: DataTypes.STRING(150), allowNull: true },
      mere_cin_numero: { type: DataTypes.STRING(100), allowNull: true },
      mere_cin_delivree_a: { type: DataTypes.STRING(150), allowNull: true },
      mere_adresse: { type: DataTypes.STRING(255), allowNull: true },
      mere_profession: { type: DataTypes.STRING(150), allowNull: true },
      mere_couverture_sociale: { type: DataTypes.STRING(150), allowNull: true },
      mere_tel_domicile: { type: DataTypes.STRING(50), allowNull: true },
      mere_tel_travail: { type: DataTypes.STRING(50), allowNull: true },
      mere_tel_portable: { type: DataTypes.STRING(50), allowNull: true },
      mere_email: { type: DataTypes.STRING(150), allowNull: true },

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
      tableName: "parents_fiche",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [{ fields: ["enfant_id"], unique: true }],
    }
  );

  // Associations centralisées dans models/index.js
  // ParentsFiche.belongsTo(models.Enfant, { as: "enfant", foreignKey: "enfant_id" });

  return ParentsFiche;
};
