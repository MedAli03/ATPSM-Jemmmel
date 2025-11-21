const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ParentChildReadState",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      parent_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      child_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      last_daily_note_seen_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      last_message_seen_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "parent_child_read_states",
      underscored: true,
      timestamps: true,
    }
  );
