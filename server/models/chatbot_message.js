"use strict";

module.exports = (sequelize, DataTypes) =>
  sequelize.define(
    "ChatbotMessage",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      reply: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      model: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "llama2",
      },
    },
    {
      tableName: "chatbot_messages",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["utilisateur_id"] },
        { fields: ["created_at"] },
      ],
    }
  );
