const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "DocumentRole",
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
      role: {
        type: DataTypes.ENUM(
          "PRESIDENT",
          "DIRECTEUR",
          "EDUCATEUR",
          "PARENT",
          "VISITEUR"
        ),
        allowNull: false,
      },
    },
    {
      tableName: "document_roles",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["document_id", "role"] },
        { fields: ["role"] },
      ],
    }
  );
