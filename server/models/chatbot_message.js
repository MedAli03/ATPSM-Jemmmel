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
      enfant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      educateur_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      annee_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("user", "assistant"),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "chatbot_messages",
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      indexes: [
        { fields: ["enfant_id", "annee_id", "created_at"] },
        { fields: ["educateur_id", "enfant_id", "annee_id"] },
      ],
    }
  );

