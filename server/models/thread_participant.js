const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define(
    "ThreadParticipant",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      thread_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      utilisateur_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
      last_read_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "thread_participants",
      underscored: true,
      timestamps: true,
    }
  );
