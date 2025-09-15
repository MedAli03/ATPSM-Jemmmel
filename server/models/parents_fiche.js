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
      pere_nom: { type: DataTypes.STRING, allowNull: true },
      pere_prenom: { type: DataTypes.STRING, allowNull: true },
      pere_naissance_date: { type: DataTypes.DATEONLY, allowNull: true },
      pere_naissance_lieu: { type: DataTypes.STRING, allowNull: true },
      pere_origine: { type: DataTypes.STRING, allowNull: true },
      pere_cin_numero: { type: DataTypes.STRING, allowNull: true },
      pere_cin_delivree_a: { type: DataTypes.STRING, allowNull: true },
      pere_adresse: { type: DataTypes.STRING, allowNull: true },
      pere_profession: { type: DataTypes.STRING, allowNull: true },
      pere_couverture_sociale: { type: DataTypes.STRING, allowNull: true },
      pere_tel_domicile: { type: DataTypes.STRING, allowNull: true },
      pere_tel_travail: { type: DataTypes.STRING, allowNull: true },
      pere_tel_portable: { type: DataTypes.STRING, allowNull: true },

      // Mère
      mere_nom: { type: DataTypes.STRING, allowNull: true },
      mere_prenom: { type: DataTypes.STRING, allowNull: true },
      mere_naissance_date: { type: DataTypes.DATEONLY, allowNull: true },
      mere_naissance_lieu: { type: DataTypes.STRING, allowNull: true },
      mere_origine: { type: DataTypes.STRING, allowNull: true },
      mere_cin_numero: { type: DataTypes.STRING, allowNull: true },
      mere_cin_delivree_a: { type: DataTypes.STRING, allowNull: true },
      mere_adresse: { type: DataTypes.STRING, allowNull: true },
      mere_profession: { type: DataTypes.STRING, allowNull: true },
      mere_couverture_sociale: { type: DataTypes.STRING, allowNull: true },
      mere_tel_domicile: { type: DataTypes.STRING, allowNull: true },
      mere_tel_travail: { type: DataTypes.STRING, allowNull: true },
      mere_tel_portable: { type: DataTypes.STRING, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
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
