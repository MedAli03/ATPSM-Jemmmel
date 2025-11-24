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
      educator_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      child_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
    },
    {
      tableName: "chatbot_messages",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["educator_id"] },
        { fields: ["child_id"] },
        { fields: ["created_at"] },
      ],
    }
  );
