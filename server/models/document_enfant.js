const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "DocumentEnfant",
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
      enfant_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "document_enfants",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["document_id", "enfant_id"] },
        { fields: ["enfant_id"] },
      ],
    }
  );
