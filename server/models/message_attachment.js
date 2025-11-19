const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "MessageAttachment",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      message_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
      attachment_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
      },
    },
    {
      tableName: "message_attachments",
      underscored: true,
      timestamps: true,
      indexes: [
        { unique: true, fields: ["message_id", "attachment_id"] },
        { fields: ["attachment_id"] },
      ],
    }
  );
