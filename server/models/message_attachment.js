const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "MessageAttachment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      message_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      original_name: { type: DataTypes.STRING(255), allowNull: false },
      mime_type: { type: DataTypes.STRING(120), allowNull: true },
      size: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      storage_path: { type: DataTypes.STRING(255), allowNull: false },
      public_url: { type: DataTypes.STRING(255), allowNull: false },
    },
    { tableName: "message_attachments", underscored: true, timestamps: true }
  );
