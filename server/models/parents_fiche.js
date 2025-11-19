"use strict";

module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "ParentsFiche",
    {
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        allowNull: false,
      },
      situation_parentale: { type: DataTypes.STRING(150), allowNull: true },
      contact_principal: { type: DataTypes.STRING(255), allowNull: true },
      informations_complementaires: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "parents_fiche",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
