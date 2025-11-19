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
      contenu: { type: DataTypes.TEXT, allowNull: false },
      kind: {
        type: DataTypes.ENUM("TEXTE", "MEDIA", "SYSTEME"),
        allowNull: false,
        defaultValue: "TEXTE",
      },
      metadata: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "messages",
      underscored: true,
      timestamps: true,
      indexes: [{ fields: ["thread_id", "created_at"] }],
    }
  );
