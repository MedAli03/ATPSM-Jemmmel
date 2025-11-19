const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Groupe",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      nom: { type: DataTypes.STRING(150), allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      capacite: { type: DataTypes.SMALLINT, allowNull: true },
    },
    {
      tableName: "groupes",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
    }
  );
