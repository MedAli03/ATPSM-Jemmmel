const { DataTypes } = require("sequelize");
module.exports = (sequelize) =>
  sequelize.define(
    "Notification",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      utilisateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      type: { type: DataTypes.STRING(50), allowNull: false },
      titre: { type: DataTypes.STRING(200), allowNull: false },
      corps: { type: DataTypes.TEXT, allowNull: true },
      icon: DataTypes.STRING(80),
      action_url: DataTypes.STRING(255),
      payload: DataTypes.JSON,
      lu_le: DataTypes.DATE,
    },
    {
      tableName: "notifications",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["utilisateur_id", "type"] },
        { fields: ["utilisateur_id", "lu_le"] },
      ],
    }
  );
