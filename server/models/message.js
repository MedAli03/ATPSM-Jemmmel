const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Message",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      expediteur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      texte: { type: DataTypes.TEXT, allowNull: false },
      pieces_jointes: DataTypes.JSON,
    },
    { tableName: "messages", underscored: true, timestamps: true }
  );
