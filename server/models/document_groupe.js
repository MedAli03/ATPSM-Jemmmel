const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "DocumentGroupe",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      document_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      groupe_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "document_groupes",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["document_id", "groupe_id"] },
        { fields: ["groupe_id"] },
      ],
    }
  );
