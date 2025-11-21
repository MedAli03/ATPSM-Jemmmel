"use strict";

module.exports = (sequelize, DataTypes) => {
  const AnneeScolaire = sequelize.define(
    "annees_scolaires",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      libelle: { type: DataTypes.STRING(20), allowNull: false, unique: true }, // "2025-2026"
      date_debut: { type: DataTypes.DATEONLY, allowNull: false },
      date_fin: { type: DataTypes.DATEONLY, allowNull: false },
      statut: {
        type: DataTypes.ENUM("PLANIFIEE", "ACTIVE", "ARCHIVEE"),
        allowNull: false,
        defaultValue: "PLANIFIEE",
      },
      est_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: DataTypes.DATE, allowNull: true },
      updated_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "annees_scolaires",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["date_debut"] },
        { fields: ["date_fin"] },
        { fields: ["est_active"] },
      ],
      defaultScope: { order: [["date_debut", "DESC"]] },
      scopes: {
        active: { where: { est_active: true, statut: "ACTIVE" } },
      },
      validate: {
        datesCoherentes() {
          if (
            this.date_debut &&
            this.date_fin &&
            this.date_debut >= this.date_fin
          ) {
            throw new Error("date_debut doit être < date_fin");
          }
        },
      },
    }
  );

  return AnneeScolaire;
};
