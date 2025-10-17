const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      sender_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      kind: {
        type: DataTypes.ENUM("text", "system", "attachment"),
        allowNull: false,
        defaultValue: "text",
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "messages",
      underscored: true,
      timestamps: true,
    }
  );
