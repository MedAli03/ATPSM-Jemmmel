const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Thread",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      enfant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      sujet: { type: DataTypes.STRING(255), allowNull: true },
      is_group: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      archived_at: { type: DataTypes.DATE, allowNull: true },
      last_message_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      tableName: "threads",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["enfant_id", "archived_at"] },
        { fields: ["created_by"] },
      ],
    }
  );
