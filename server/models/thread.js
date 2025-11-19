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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      enfant_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },
      is_group: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      archived: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_message_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
      },
    },
    {
      tableName: "threads",
      underscored: true,
      timestamps: true,
    }
  );
