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
      created_by: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      enfant_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
      sujet: { type: DataTypes.STRING(200), allowNull: false },
    },
    { tableName: "threads", underscored: true, timestamps: true }
  );
