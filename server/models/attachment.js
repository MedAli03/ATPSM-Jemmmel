const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Attachment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      uploader_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      filename: { type: DataTypes.STRING(255), allowNull: true },
      mime_type: { type: DataTypes.STRING(120), allowNull: true },
      url: { type: DataTypes.STRING(500), allowNull: false },
      size_bytes: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
    },
    {
      tableName: "attachments",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["uploader_id"] }],
    }
  );
