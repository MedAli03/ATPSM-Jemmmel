const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "Attachment",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      uploader_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      mime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      size: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      storage_key: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "attachments",
      underscored: true,
      timestamps: true,
    }
  );
